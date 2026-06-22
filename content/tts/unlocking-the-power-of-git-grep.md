git grep Recipes: Search Tracked Code Without Searching the Whole Filesystem

[conversational tone] Most code search advice starts with speed. Speed matters, but the real reason I reach for git grep is simpler:

It searches the code Git knows about, not the whole filesystem.

That means your search does not wander into node underscore modules, dot cache, dist, coverage reports, local dumps, screenshots, or whatever temporary thing you created during a weird debugging afternoon. Default git grep starts from tracked paths in your Git working tree. That one constraint makes the results calmer.

This is not an argument against rg, or ripgrep. I use rg constantly. But the two tools answer different questions.

Git grep asks: where is this in the tracked code, or in another branch, tag, or commit?

Ripgrep asks: where is this on disk, respecting my ignore rules?

Once that distinction clicks, git grep stops being an old command you vaguely know exists and becomes a very sharp little habit.

[matter-of-fact] The mental model is small. The useful shape is: git grep, then options, then the pattern, then optional tree-ish values, then a double dash and optional path specs.

The pattern is what you are searching for.

A tree-ish is optional: a branch, tag, commit, or other Git tree to search.

A path spec is optional: the files or directories to limit the search to.

The double dash separates revisions from paths when there is any chance of ambiguity.

Default git grep searches tracked files in your working tree. It is not a magic content index. It is not reading every file under the current directory. It is asking Git which paths belong to the project, then searching those paths.

That is why it feels tidy.

[deliberate] First recipe: search tracked code and show line numbers.

Run git grep minus n initializeSettings.

The minus n flag prints line numbers, which makes the output useful in a terminal, a pull request comment, or a quick handoff note. Git can be configured to show line numbers by default, but I still tend to type minus n because it is visible and portable in snippets.

Second: search a literal string, not a regular expression.

Use minus capital F when the pattern is a fixed string. For example, search for useEffect, open parenthesis, inside JavaScript and TypeScript files by combining git grep minus n, minus capital F, the literal text, then a double dash and the quoted file globs.

The important habit is this: put file globs after the double dash, and quote them so your shell does not expand them before Git sees them.

This is the version I want when I know the exact function call, config key, class name, or error message.

Third: search case-insensitively, as a whole word, with columns.

Run git grep minus n, minus i, minus w, double dash column, customer.

Minus i ignores case. Minus w asks for whole-word matches. Double dash column prints the column number of the first match on the line. That is nice when the term is common enough that raw output gets noisy.

Fourth: search for a pattern that starts with a dash.

Run git grep minus n, minus e, double dash force.

Without minus e, Git may read the pattern as another command-line option. Minus e says: the next thing is a search pattern. It is one of those tiny flags you do not need often, but when you need it, you really need it.

You can pass more than one minus e, too. Searching for oldBillingFlow and legacyCheckout that way means either pattern can match.

[matter-of-fact] Fifth: use a regular expression when structure matters.

Minus capital E enables extended regular expressions. One practical example is looking for Python function definitions with a pattern that means: def, then whitespace, then a function name, then an opening parenthesis.

For bigger structural questions, use the language tooling. Git grep is excellent at finding candidates. It is not an abstract syntax tree engine, and that honesty is part of why I like it.

Sixth: limit the search to a path.

Run git grep minus n FeatureFlag, double dash, src, components.

The path specs after the double dash keep the search focused. This is often faster mentally, not just computationally. You are telling the command what kind of answer you care about.

You can also exclude paths with Git's exclude path spec. The important practical rule is that path filters belong after the double dash, and exclusion path specs are handled by Git, not by the shell.

Seventh: list only matching files.

Use minus l when the next step is open the files, or count the blast radius, not read every match.

The inverse is minus capital L. It lists tracked files that do not contain the pattern. That can be surprisingly handy during framework migrations.

Eighth: count matches per file.

Use minus c for a quick heat map. It is not a code-quality metric; please do not make it one. But it is useful for spotting the files where a term is concentrated before you start editing.

[deliberate] Ninth: search the staged version instead of the working tree.

Run git grep minus n, double dash cached, newConfigKey.

Default git grep searches tracked paths in the working tree. Double dash cached searches the blobs in the index: the staged version.

That is useful in pre-commit checks, review scripts, or any moment where you want to ask, what exactly have I staged, rather than what is currently on disk?

Tenth: search untracked files, with ignore rules in mind.

Run git grep minus n, double dash untracked, draftFlag.

Double dash untracked adds untracked files to the search. In this mode, Git's standard ignore rules are honored, so ignored files still stay out of the result.

If you really want ignored files too, add double dash no exclude standard. That is a deliberate move. I use it when I suspect a generated file, local fixture, or ignored artifact contains the thing I am chasing.

Eleventh: search another branch, tag, or old commit without checking it out.

Run git grep minus n validateUser main.

Or run it against version two point three point zero.

Or run it against H E A D tilde twenty, limited to src.

This is the killer feature.

No checkout. No stash. No worktree detour. You can ask a branch, tag, or old commit a direct question and stay exactly where you are.

When a bug report says, this worked in the last release, I usually start here.

Twelfth: search every commit only when you really mean it.

The rough shape is: git rev-list double dash all, piped into xargs minus n fifty, then git grep minus n validateUser.

That searches commit trees across all history in batches. It can be loud, repetitive, and expensive on a serious repository, because the same file content may appear in many commits.

Most of the time, if your real question is when did this string appear or disappear, git log is the better companion.

Use git log minus capital S when you care about changes in the number of occurrences of a string.

Use git log minus capital G, with minus p, when you care about diffs whose added or removed lines match a regular expression.

Different question, different tool.

[calm] Now, the dot gitignore gotcha.

The sentence, git grep respects dot gitignore, is close enough to be tempting and wrong enough to bite you.

Default git grep searches tracked files. A dot gitignore file is about keeping untracked files untracked. Files already tracked by Git are not made invisible just because a later ignore rule matches them.

So the precise version is this:

Default git grep searches tracked paths in the working tree.

Ignored but untracked files are not searched, because untracked files are not searched.

Ignored but tracked files are searched, because they are tracked.

Double dash untracked adds untracked files while still honoring standard ignore rules.

Double dash untracked plus double dash no exclude standard includes ignored files too.

Double dash no index turns git grep into a filesystem search from the current directory, even outside a repository.

Double dash no index plus double dash exclude standard makes that filesystem search honor Git's standard ignore rules.

The edge case matters in old repositories. A file can be committed first and ignored later. If you are hunting a string and git grep finds it in a supposedly ignored file, Git is not confused. The file is tracked.

[conversational tone] So when is rg the better tool?

Use ripgrep when you want filesystem semantics.

Run rg validateUser for the normal search. Add capital S for smart case. Add double dash hidden when you want dotfiles too. Add double dash no ignore when you want ignored files too.

Ripgrep walks the directory tree. By default it respects dot gitignore, dot ignore, dot rgignore, global ignore files, hidden-file rules, and binary-file skipping. It is very fast, very polished, and usually what I want when I am searching the working directory as it exists on disk.

The trade-off is that rg does not know how to search version two point three point zero or H E A D tilde twenty unless you check that tree out somewhere. Git history is not its world.

So my rule of thumb is simple.

Use git grep for tracked code and Git objects: branches, tags, commits, staged content.

Use rg for the live filesystem: untracked files, non-Git directories, ignored-file experiments, and broad project search.

There is no prize for choosing only one. Put both in your hands.

[matter-of-fact] The compact version:

Use git grep minus n for tracked files with line numbers.

Use minus capital F for literal strings.

Use minus i, minus w, and double dash column when you need case-insensitive whole-word matches with columns.

Use minus e when the search pattern starts with a dash.

Use minus capital E for an extended regular expression.

Use minus l for matching file names, and minus capital L for files that do not contain the term.

Use minus c for counts.

Use double dash cached for the staged version.

Use double dash untracked when untracked files matter.

Name a branch, tag, or commit when you want to search an older Git tree without checking it out.

And use git log minus capital S when the real question is not where is this string, but when did its occurrence count change?

[reflective] The boring power of git grep is that it starts with the project as Git understands it.

That is exactly what you want more often than you think: not every file on disk, not every build artifact, not every local experiment. Just the code that belongs to the repository, plus any older version of that code you can name.

Use git grep when the question is: where in this codebase, including its history?

Use ripgrep when the question is: where on disk, respecting my ignore rules?

Most days, you will want both within arm's reach.
