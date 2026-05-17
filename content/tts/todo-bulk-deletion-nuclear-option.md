[matter-of-fact] The Nuclear Option for Bulk Deletes: Truncate and Reinsert in MySQL and InnoDB.

You need to delete millions of rows from a MySQL table.

You reach for the obvious move: delete from the big table where some condition is true.

[resigned tone] And then you watch the progress bar age in real time.

You try to be responsible and chunk it. Delete ten thousand rows at a time. Repeat until done.

[flatly] Better. Still slow. Still noisy. Still expensive.

If you are deleting most of the table, and by most I mean roughly eighty percent or more, there is a different move that is brutally effective.

Do not delete what you do not want.

[emphasized] Keep what you want, and nuke the rest.

I call it the nuclear option: truncate and reinsert.

[deliberate] Why DELETE stays slow, even when chunked.

InnoDB does not simply remove rows. It does work.

Lots of work.

It has to locate rows, lock them, and mark them as deleted.

It has to maintain indexes. Every deletion touches every secondary index.

It has to write undo and redo logs, because the engine must preserve the ability to roll back and recover.

It churns the buffer pool. You keep dirtying pages and evicting useful ones.

And if you have replication, large delete streams are a great way to generate replica lag.

[matter-of-fact] Back-of-the-napkin reality check: twenty seven million rows at around six thousand rows per second is about seventy five minutes.

That is not a bug.

[deadpan] That is the cost model you chose.

[deliberate] The nuclear option: truncate and reinsert.

This technique flips the cost model.

Instead of paying per deleted row, you pay per kept row.

The algorithm is simple.

First, copy the rows you want to keep into a temporary table.

Second, truncate the original table. This is fast.

Third, insert the preserved rows back into the original table.

Fourth, drop the temporary table.

[matter-of-fact] And yes, it is called nuclear for a reason. It is intentionally blunt.

[reflective] Why it is fast.

The wins are mechanical.

Truncate is roughly constant time because MySQL drops and recreates the table at the metadata level.

Creating a table as a select is proportional to the number of rows you keep. It is a sequential scan plus a bulk write.

Inserting back from the temporary table is also proportional to the rows you keep. It is a bulk insert, without the delete tax.

[emphasized] There is no per-row delete overhead. No index updates for the rows you removed, because they are gone in one shot.

[deliberate] When to use it, and when not to.

Use it when you are deleting most of the table. Again, eighty percent or more is the line where this starts to shine.

Use it when you can define the rows to keep cleanly.

Use it when you can afford brief unavailability or a maintenance window.

Use it when the table is not actively referenced by foreign keys from other tables, or when you can manage those constraints safely.

Use it when you have enough disk for the temporary table.

[stress on next word] Do not use it when you need zero downtime.

Do not use it when the table is heavily referenced by foreign keys you cannot touch.

Do not use it when you must fire delete triggers.

And do not use it when you are only deleting a minority of rows. A chunked delete can be the simpler win.

[reflective] A practical decision rule.

If you want one sentence you can say in a review: if the delete would remove most of the table, stop deleting. Preserve and rebuild.

Or, in slightly more mechanical terms:

If you are deleting less than fifty percent, use a chunked delete with index-aware filters.

If you are deleting between fifty and eighty percent, measure both approaches.

If you are deleting more than eighty percent, use truncate and reinsert, if the constraints allow it.

[matter-of-fact] Implementation in SQL.

The minimal shape is this.

Create a temporary preserved table from the original table, selecting only the rows where your preserve condition is true.

Then truncate the original table.

Then insert the preserved rows back into the original table.

Then drop the temporary table.

In SQL terms, that means: create table temp_preserved as select everything from big_table where preserve_condition. Truncate table big_table. Insert into big_table by selecting everything from temp_preserved. Drop table temp_preserved.

[deliberate] Two production notes matter.

First, truncate is DDL in MySQL. It implicitly commits, and you cannot roll it back like a normal transaction.

Second, you want a maintenance window and a backup. This is not a try it live and see situation.

[matter-of-fact] Implementation in Laravel and PHP.

The version I actually use is a helper that accepts three things: the database connection, the table name, and the preserve condition.

It builds a temporary table name using the original table name and the current timestamp.

[deliberate] Then it does the dangerous part very explicitly.

It turns foreign key checks off.

It creates the temporary table by selecting the rows to preserve.

It counts how many rows were preserved.

It truncates the original table.

It inserts the preserved rows back.

It drops the temporary table.

And in a finally block, it turns foreign key checks back on.

[emphasized] That last part matters. If the script fails halfway through, you still want the connection to put the guardrails back.

[reflective] Pinch of rubber-duck energy: read the helper again and ask your future self, am I sure this table can be emptied for a moment?

[deliberate] If the answer is not an unambiguous yes, this is not the tool.

[matter-of-fact] Gotchas you must account for.

First, auto-increment resets.

Truncate resets the auto-increment value. If you need to preserve it, find the maximum ID and set auto-increment to max ID plus one.

Second, foreign keys.

[stress on next word] If other tables reference this one, truncate may be forbidden or unsafe. Do not just disable checks and hope.

Third, triggers.

Truncate does not fire delete triggers. If you need trigger side effects, you are back to delete.

Fourth, disk space.

You need room for the preserved dataset, because the temporary table has to live somewhere. Check the table size first. Information schema can tell you the data size and index size for the table.

Fifth, replication and the binary log.

[deliberate] This is DDL plus a bulk insert. It can still cause replica lag. Do it intentionally, monitor lag, and do not pretend it is free.

[reflective] If you need near zero downtime.

This post is about the fast hammer.

If you need a scalpel, use the tools built for it.

Use Percona Toolkit's pt-archiver for batched deletes with replica-friendly pacing.

Use partitioning strategies, where you drop partitions instead of rows.

Or use shadow-table approaches with a controlled swap. More complex, more moving parts, but better suited for near-zero downtime work.

[reflective] Closing thought.

This is not a clever trick.

It is choosing which work you pay for.

[emphasized] When you are deleting almost everything, paying per deleted row is just self-inflicted pain.

[deliberate] Preserve what matters. Rebuild. Move on.
