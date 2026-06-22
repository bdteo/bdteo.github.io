[matter-of-fact] The Nuclear Option for Bulk Deletes: Truncate and Reinsert in MySQL and InnoDB.

You need to delete millions of rows from a MySQL table.

The honest first instinct is simple: delete from the big table where the row is older than your cutoff.

Then the query runs long enough for you to become a different person.

So you do the responsible thing. You delete ten thousand rows at a time. You order by id. You repeat until done. You add a sleep. You watch replicas. You hope the lock story stays boring.

That is often the right answer.

[flatly] But if you are deleting most of the table, a row-by-row delete is not noble. It is just expensive.

There is a different move: do not delete what you do not want. Preserve what you do want, rebuild the table, and move on.

That is the nuclear option: copy the rows to keep, truncate the table, then reinsert those rows.

It is fast because it changes the unit of work. You stop paying for every deleted row and start paying for every preserved row.

[deliberate] It is also dangerous because truncate is not a polite delete. In MySQL it is D D L-flavoured. It commits implicitly. It resets auto increment. It skips on-delete triggers. It has real foreign-key and replication consequences.

That is exactly why it deserves a proper runbook, not a clever snippet pasted into production at two in the morning.

Here is the decision shape.

Plain delete is best when you are deleting a small, indexed slice. It is usually online, and it can be transactional if you keep the transaction sane, but huge sets are slow because every affected index, undo log, redo log, and binlog entry has to be paid for.

Batched delete is best when you need live-system pacing and can tolerate a longer job. Each batch can commit independently. You can pause and resume. But it is still row by row, and it can still create replica lag.

Partition drop or partition truncate is best when the rows line up cleanly with whole partitions. That is the adult version of retention cleanup. The catch is that the partition boundary has to match the rule. Boundaries do not forgive optimism.

Table swap is useful when you can build a replacement table and atomically rename it into place. The swap window is short, but the copy phase still needs a plan for writes, triggers, grants, foreign keys, and application assumptions.

And truncate plus reinsert is best when you are deleting almost everything and can pause writes. The table is empty between truncate and restore, and the rollback story is not friendly.

[reflective] My rule of thumb is this: deleting less than fifty percent, start with indexed delete or batched delete. Deleting between fifty and eighty percent, measure batched delete against rebuild approaches. Deleting more than eighty percent, strongly consider preserve-and-rebuild.

The percentage is not magic. A thirty percent delete from a table with horrible indexes can still hurt. A ninety percent delete from a small table may not deserve ceremony.

The real question is: which side of the data is smaller and safer to operate on?

Why does a massive delete hurt InnoDB?

Because InnoDB does not look at your where clause, sigh wistfully, and remove a range of bytes from disk.

It has to find rows through an index, or scan too much. It has to lock records, and sometimes gaps, along the scanned index ranges. It has to maintain every affected secondary index. It writes undo so the delete can roll back. It writes redo so crash recovery works. It writes binary logs so replication and recovery have a history. And it leaves purge work behind for InnoDB to clean up after old row versions are no longer visible.

[matter-of-fact] The uncomfortable detail is that delete locks the index records it scans, not merely the rows your mental model thinks it matched.

Batched deletes reduce the blast radius by making each transaction smaller. Delete a limited number of rows older than the cutoff, ordered by id, then repeat. That gives replicas time to breathe. It lets you stop. It keeps undo from becoming one enormous transaction.

But it does not change the basic cost model. You are still deleting row by row.

Truncate changes that model because MySQL treats truncate table more like dropping and recreating the table than like deleting every row. It bypasses the normal D M L delete path, causes an implicit commit, cannot be rolled back like a normal D M L statement, and does not fire on-delete triggers.

So instead of deleting eighty million rows and keeping twenty million, you copy twenty million rows, empty the table quickly, and insert twenty million rows back.

[deadpan] That is the whole trick. The implementation details are where the bodies are buried.

The safest version starts with the keep set.

Not: delete everything older than X.

But: after this operation, the table contains exactly the rows matching Y.

That framing matters because the preserved rows become your recovery anchor.

Freeze volatile values before you measure anything. If the cutoff is January first, set it once and reuse that exact value. Then count total rows, rows to keep, and rows to delete in the same preflight query.

After that, check the access path. Explain the query that finds the rows to keep. If MySQL needs a full table scan over a table that is still taking writes, stop and design the maintenance window properly. The nuclear option is not a substitute for knowing how the table is accessed.

[deliberate] Before touching production, I want five checks.

First, confirm foreign-key relationships. Find child tables that reference the table you want to empty. If other tables reference it, do not casually disable foreign key checks and hope. MySQL does not validate existing rows when checks are turned back on. That is useful for controlled reloads. It is terrifying as a hand-wave.

Second, check triggers. If delete triggers write audit rows, clear caches, update rollups, or notify other systems, truncate bypasses them. That is either exactly what you want or exactly how you create a very quiet incident.

Third, check disk space. You need room for the preserved rows somewhere. If you are keeping twenty percent of a five-hundred-gigabyte table, the temporary copy is a real object competing for real disk and I O.

Fourth, check binary logs and replicas. Truncate is logged for replication as a statement, and the reinsert is still a large write. That may be much better than logging millions of row deletes, but it is not free.

Fifth, have a restore path you have actually tested. "We have backups" is not a restore plan. Know which backup you would restore, where you would restore it, and how you would extract just this table if the result is wrong.

Here is the practical runbook.

Assume the table is safe to empty briefly: no child tables depend on those rows while the operation runs, writes are paused or the application is in maintenance mode, the keep condition is frozen, backups are real, and replicas have been considered.

Use explicit columns. I know select star looks clean. It is also how generated columns, invisible columns, column-order drift, and future migrations make your night more interesting.

Create a keep table with the same structure as the source table. Use create table like, not create table as select. Insert the rows you want to preserve into that keep table, naming every column explicitly, and using the frozen cutoff.

Then count the preserved copy before you do anything irreversible.

After that comes the point of no casual return: truncate the original table.

Restore the preserved rows back into the original table with an explicit column list. Refresh optimizer statistics. Then verify the final row count, the oldest remaining row, and the table status before cleanup.

[reflective] Drop the preserved copy only after the application is back, the counts match, and you have looked at the actual product behaviour that depends on this table.

That preserved table is not clutter during the operation. It is the rope.

There is also a table-swap variant when the empty-table window is unacceptable.

The shape is similar: create a new table like the old one, insert the rows you want into the new table, then atomically rename the old table out of the way and the new table into place.

The rename itself is atomic. Other sessions do not see a half-renamed pair. But do not confuse that with zero downtime.

If the old table receives writes while the new table is being populated, those writes are not magically copied. You need a write pause, a delta-capture plan, or a deliberately more complex online migration.

Also, create table like copies column attributes and indexes, but it does not make every surrounding object safe. Verify triggers, foreign keys, grants, partitioning, generated columns, and application assumptions. The table name may survive the swap. The operational context may not.

If the rows line up with partitions, partitioning is often the cleanest answer. Drop the old partition, or truncate the old partition, and move on.

[matter-of-fact] That is the grown-up version of bulk deletion: design the table so old data can leave through a door instead of through a shredder.

The catch is obvious and still painful. The partition boundary must match the retention rule. If the cleanup condition is "delete every completed task for customers on the old billing plan except the ones with unresolved exports," partitioning will not rescue you.

Now the gotchas, plainly.

Truncate commits implicitly. Create table, alter table, drop table, and rename table live in the same implicit-commit world. Wrapping the runbook in start transaction does not make it safely reversible. If your plan depends on "we will roll back if it looks wrong," you do not have a plan.

Foreign keys are not a checkbox. If the table is a parent, child rows elsewhere may depend on it. If the table is a child, reinsert order matters. If you disable foreign key checks, MySQL will not validate old rows when you turn checks back on.

On-delete triggers do not fire. That can be a performance benefit. It can also bypass audit trails and denormalized counters.

Auto increment resets. If you reinsert explicit ids, MySQL often advances the next value as it sees those ids, but I still verify it. Read the maximum id. Check the table status. If the next auto increment value is wrong, fix it deliberately. Do not guess the number.

Create table as select is not the same as create table like. The first is convenient, but it does not automatically create indexes for the new table, and some attributes are not preserved the way people assume. For an operational runbook, I prefer create table like, then insert with explicit columns.

Constraints still matter after the truncate. If the preserved set is produced by joins, deduping, transformations, or code, validate it before the truncate. "Should be fine" is not a verification strategy.

Replicas can still lag. This method can reduce work compared with an enormous row-by-row delete, but replicas still need to apply the truncate and the bulk insert. Watch them.

[emphasized] And the application must not write through the copy window.

If you copy keep rows at two o'clock and the application inserts new valid rows five seconds later, those rows are not in the keep table. A later truncate removes them.

Maintenance mode is not just about user experience. It is data correctness.

A Laravel-shaped caution: the important thing is not the facade. It is the boundary.

Do not hide this inside a generic helper that accepts arbitrary table names and raw where strings. Identifiers should be code constants. The keep condition should come from reviewed code, not user input. And database transactions do not make D D L rollback-safe in MySQL.

The skeleton I trust looks more like a command than a reusable library function. Create the keep table. Insert the preserved rows with a bound cutoff. Count the keep rows. Log that number. Compare it to the preflight count. Require an explicit operator confirmation. Then truncate and restore.

[deadpan] That confirmation step is not theatre. It is the pause where you catch: wait, keep rows is eleven, not eleven million.

Here is the small two-in-the-morning checklist.

Before: know the exact keep condition. Freeze any time-based cutoff. Count total, keep, and delete rows. Check foreign keys and triggers. Check disk space. Know the backup and restore path. Check replica lag and binlog implications. Pause writes, or have a real delta-capture plan.

During: create the keep table. Count it. Compare the count to the preflight number. Run the irreversible step only after the numbers make sense. Reinsert with explicit columns. Analyze and verify.

After: final row count matches keep count. Boundary rows look right. Application behaviour is checked, not merely SQL output. Replicas are caught up, or intentionally catching up. The keep table stays until you no longer need the rope.

I would not use truncate plus reinsert if the table has important delete triggers, if foreign-key cascades are the correct business behaviour, if writes cannot be paused, if the keep condition is fuzzy, if the delete is small enough for batched delete, if the table is already partitioned on the retention boundary, or if the organization cannot restore the table when the runbook is wrong.

That last one is the test. If restoring the table would be chaos, do not choose an operation whose failure mode is: restore the table.

[reflective] The nuclear option is not clever because truncate is fast. Everyone knows truncate is fast.

The useful idea is deciding which work you want the database to do.

If you are deleting almost everything, making InnoDB carefully delete almost everything can be the wrong kindness. Preserve what matters. Rebuild around it. Verify like a tired future version of you will be reading the output with one eye open.
