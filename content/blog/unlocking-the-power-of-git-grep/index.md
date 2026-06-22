---
title: "git grep Recipes: Search Tracked Code Without Searching the Whole Filesystem"
date: "2024-11-13"
slug: "unlocking-the-power-of-git-grep"
author: "Boris D. Teoharov"
description: "A practical git grep cheat sheet for searching tracked files, branches, tags, staged changes, and old commits, with .gitignore gotchas and when to use ripgrep instead."
tags: ["git", "git grep", "ripgrep", "code search", "developer tools", "software development", "command line tools"]
featuredImage: "./images/featured.jpg"
imageCaption: "A library card catalog drawer pulled open. One card stands slightly proud — the passage you were looking for."
audioUrl: "/audio/articles/unlocking-the-power-of-git-grep/UzI1NsMEV3ni5JRkRSls-019492b329bf.m4a"
audioDuration: "13:42"
audioVoice: "Alistair (ElevenLabs cultured British)"
audioGeneratedAt: "2026-06-22"
audioTextSource: "content/tts/unlocking-the-power-of-git-grep.md"
---

Most code search advice starts with speed. Speed matters, but the real reason I reach for `git grep` is simpler:

**It searches the code Git knows about, not the whole filesystem.**

That means your search does not wander into `node_modules`, `.cache`, `dist`, coverage reports, local dumps, screenshots, or whatever temporary thing you created during a weird debugging afternoon. Default `git grep` starts from tracked paths in your Git working tree. That one constraint makes the results calmer.

This is not an argument against `rg` / ripgrep. I use `rg` constantly. But the two tools answer different questions:

- `git grep`: "Where is this in the tracked code, or in another branch, tag, or commit?"
- `rg`: "Where is this on disk, respecting my ignore rules?"

Once that distinction clicks, `git grep` stops being an old command you vaguely know exists and becomes a very sharp little habit.

## The mental model

The useful shape of the command is:

```bash
git grep [options] <pattern> [<tree-ish>...] [-- <pathspec>...]
```

In plain English:

- `<pattern>` is what you are searching for.
- `<tree-ish>` is optional: a branch, tag, commit, or other Git tree to search.
- `<pathspec>` is optional: the files or directories to limit the search to.
- `--` separates revisions from paths when there is any chance of ambiguity.

Default `git grep` searches tracked files in your working tree. It is not a magic content index. It is not reading every file under the current directory. It is asking Git which paths belong to the project, then searching those paths.

That is why it feels tidy.

## Recipes

### 1. Search tracked code and show line numbers

```bash
git grep -n "initializeSettings"
```

This is the everyday version. `-n` prints line numbers, which makes the output useful in a terminal, a PR comment, or a quick handoff note.

If you always want line numbers, Git supports a config for that:

```bash
git config --global grep.lineNumber true
```

I still tend to type `-n` because it is visible and portable in snippets.

### 2. Search a literal string, not a regex

```bash
git grep -n -F "useEffect(" -- "*.js" "*.jsx" "*.ts" "*.tsx"
```

Use `-F` when the pattern is a fixed string. Parentheses, dots, brackets, and other regex-ish characters are treated as ordinary text.

Two small habits matter here:

- Put file globs after `--`.
- Quote the globs so your shell does not expand them before Git sees them.

This is the version I want when I know the exact function call, config key, class name, or error message.

### 3. Search case-insensitively, as a whole word, with columns

```bash
git grep -n -i -w --column "customer"
```

`-i` ignores case. `-w` asks for whole-word matches. `--column` prints the column number of the first match on the line.

This is nice when the term is common enough that raw output gets noisy. It is also useful when you are feeding results into editor integrations or quickfix lists.

### 4. Search for a pattern that starts with a dash

```bash
git grep -n -e "--force"
```

Without `-e`, Git may read the pattern as another command-line option. `-e` says "the next thing is a search pattern." It is one of those tiny flags you do not need often, but when you need it, you really need it.

You can pass more than one `-e` too:

```bash
git grep -n -e "oldBillingFlow" -e "legacyCheckout"
```

That searches for either pattern.

### 5. Use a regex when structure matters

```bash
git grep -n -E "def[[:space:]]+[[:alnum:]_]+\\(" -- "*.py"
```

`-E` enables extended regular expressions. This example looks for Python function definitions without pretending to be a parser.

For bigger structural questions, use the language tooling. `git grep` is excellent at finding candidates; it is not an AST engine, and that honesty is part of why I like it.

### 6. Limit the search to a path

```bash
git grep -n "FeatureFlag" -- src components
```

The pathspecs after `--` keep the search focused. This is often faster mentally, not just computationally. You are telling the command what kind of answer you care about.

You can also exclude paths:

```bash
git grep -n "logger" -- src ":(exclude)src/generated" ":(exclude)*.snap"
```

Git pathspecs are powerful and a little strange. The important practical rule is that path filters belong after `--`, and exclusion pathspecs like `:(exclude)...` are handled by Git, not by the shell.

### 7. List only matching files

```bash
git grep -l "useOldCheckout"
```

`-l` prints file names instead of matching lines. Use it when the next step is "open the files" or "count the blast radius", not "read every match."

The inverse exists too:

```bash
git grep -L "use client" -- "src/**/*.tsx"
```

`-L` lists tracked files that do **not** contain the pattern. That can be surprisingly handy during framework migrations.

### 8. Count matches per file

```bash
git grep -c "TODO"
```

`-c` gives you a quick heat map. It is not a code-quality metric; please do not make it one. But it is useful for spotting the files where a term is concentrated before you start editing.

### 9. Search the staged version instead of the working tree

```bash
git grep -n --cached "newConfigKey"
```

Default `git grep` searches tracked paths in the working tree. `--cached` searches the blobs in the index - the staged version.

That is useful in pre-commit checks, review scripts, or any moment where you want to ask, "What exactly have I staged?" rather than "What is currently on disk?"

### 10. Search untracked files, with ignore rules in mind

```bash
git grep -n --untracked "draftFlag"
```

`--untracked` adds untracked files to the search. In this mode, Git's standard ignore rules are honored, so ignored files still stay out of the result.

If you really want ignored files too:

```bash
git grep -n --untracked --no-exclude-standard "draftFlag"
```

That is a deliberate move. I use it when I suspect a generated file, local fixture, or ignored artifact contains the thing I am chasing.

### 11. Search another branch, tag, or old commit without checking it out

```bash
git grep -n "validateUser" main
git grep -n "validateUser" v2.3.0
git grep -n "validateUser" HEAD~20 -- src
```

This is the killer feature.

No checkout. No stash. No worktree detour. You can ask a branch, tag, or old commit a direct question and stay exactly where you are.

When a bug report says "this worked in the last release", I usually start here.

### 12. Search every commit only when you really mean it

```bash
git rev-list --all | xargs -n 50 git grep -n "validateUser"
```

This searches commit trees across all history in batches. It can be loud, repetitive, and expensive on a serious repository, because the same file content may appear in many commits.

Most of the time, if your real question is "when did this string appear or disappear?", `git log` is the better companion:

```bash
git log -S "validateUser" --oneline -- src
git log -G "validate(User|Account)" -p -- src
```

`-S` is for changes in the number of occurrences of a string. `-G` is for diffs whose added or removed lines match a regex. Different question, different tool.

## The `.gitignore` gotcha

The sentence "git grep respects `.gitignore`" is close enough to be tempting and wrong enough to bite you.

Default `git grep` searches tracked files. A `.gitignore` file is about keeping untracked files untracked. Files already tracked by Git are not made invisible just because a later ignore rule matches them.

So this is the precise version:

- Default `git grep` searches tracked paths in the working tree.
- Ignored-but-untracked files are not searched, because untracked files are not searched.
- Ignored-but-tracked files **are** searched, because they are tracked.
- `--untracked` adds untracked files while still honoring standard ignore rules.
- `--untracked --no-exclude-standard` includes ignored files too.
- `--no-index` turns `git grep` into a filesystem search from the current directory, even outside a repo.
- `--no-index --exclude-standard` makes that filesystem search honor Git's standard ignore rules.

The edge case matters in old repositories. A file can be committed first and ignored later. If you are hunting a string and `git grep` finds it in a supposedly ignored file, Git is not confused. The file is tracked.

## When `rg` is the better tool

Use ripgrep when you want filesystem semantics.

```bash
rg "validateUser"
rg -S "validateUser"
rg --hidden "validateUser"
rg --no-ignore "validateUser"
```

`rg` walks the directory tree. By default it respects `.gitignore`, `.ignore`, `.rgignore`, global ignore files, hidden-file rules, and binary-file skipping. It is very fast, very polished, and usually what I want when I am searching the working directory as it exists on disk.

The trade-off is that `rg` does not know how to search `v2.3.0` or `HEAD~20` unless you check that tree out somewhere. Git history is not its world.

So my rule of thumb is:

- Use `git grep` for tracked code and Git objects: branches, tags, commits, staged content.
- Use `rg` for the live filesystem: untracked files, non-Git directories, ignored-file experiments, and broad project search.

There is no prize for choosing only one. Put both in your hands.

## A compact cheat sheet

```bash
git grep -n "term"                         # tracked files, with line numbers
git grep -n -F "literal(" -- "*.ts"        # fixed string in TypeScript files
git grep -n -i -w --column "term"          # case-insensitive whole-word search
git grep -n -e "--flag"                    # pattern begins with a dash
git grep -n -E "regex" -- src              # extended regex, limited to src
git grep -l "term"                         # matching file names only
git grep -L "term" -- "*.tsx"              # files that do not contain term
git grep -c "term"                         # match count per file
git grep -n --cached "term"                # staged/index version
git grep -n --untracked "term"             # tracked plus untracked, honoring ignores
git grep -n "term" v1.2.3 -- src           # search a tag without checkout
git log -S "term" --oneline -- src         # find commits that changed occurrence count
```

The boring power of `git grep` is that it starts with the project as Git understands it. That is exactly what you want more often than you think: not every file on disk, not every build artifact, not every local experiment - just the code that belongs to the repository, plus any older version of that code you can name.
