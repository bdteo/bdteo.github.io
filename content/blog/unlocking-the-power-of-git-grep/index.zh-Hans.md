---
lang: "zh-Hans"
translationOf: "unlocking-the-power-of-git-grep"
translationUpdatedAt: "2026-06-22"
translationSourceHash: "203041318333bf65"
title: "git grep 食谱：搜索已跟踪代码，而不是整个文件系统"
date: "2024-11-13"
description: "一份实用的 git grep 速查表，涵盖已跟踪文件、branches、tags、staged changes 和旧 commits 的搜索，以及 .gitignore 的坑和什么时候改用 ripgrep。"
tags: ["git", "git grep", "ripgrep", "代码搜索", "开发者工具", "软件开发", "命令行工具"]
featuredImage: "./images/featured.jpg"
imageCaption: "一个图书馆卡片目录抽屉被拉开。其中一张卡片微微探出 - 你正在找的那段文字。"
---

大多数代码搜索建议都从速度讲起。速度当然重要，但我会伸手用 `git grep`，真正的原因更简单：

**它搜索的是 Git 知道的代码，而不是整个文件系统。**

这意味着你的搜索不会跑进 `node_modules`、`.cache`、`dist`、coverage reports、本地 dumps、screenshots，或者某个奇怪 debugging 下午里顺手创建的临时东西。默认情况下，`git grep` 从 Git working tree 中已跟踪的 paths 开始。单是这个约束，就会让结果安静很多。

这不是反对 `rg` / ripgrep。我一直在用 `rg`。但这两个工具回答的是不同问题：

- `git grep`："这个东西在已跟踪代码里哪里出现，或者在另一个 branch、tag、commit 里哪里出现？"
- `rg`："这个东西在磁盘上哪里出现，并且要遵守我的 ignore rules？"

一旦这个区别想通了，`git grep` 就不再是那个你隐约知道存在的老命令，而会变成一个非常锋利的小习惯。

## 心智模型

这个命令有用的形状是：

```bash
git grep [options] <pattern> [<tree-ish>...] [-- <pathspec>...]
```

用白话说：

- `<pattern>` 是你要搜索的内容。
- `<tree-ish>` 是可选的：要搜索的 branch、tag、commit 或其他 Git tree。
- `<pathspec>` 是可选的：把搜索限制到哪些文件或目录。
- 当 revision 和 path 可能产生歧义时，`--` 用来把两者分开。

默认的 `git grep` 搜索 working tree 中已跟踪的文件。它不是神奇的内容索引。它不会读取当前目录下面的每个文件。它会问 Git 哪些 paths 属于这个项目，然后搜索这些 paths。

所以它才显得干净。

## 食谱

### 1. 搜索已跟踪代码并显示行号

```bash
git grep -n "initializeSettings"
```

这是日常版本。`-n` 会打印行号，让输出在 terminal、PR comment 或快速 handoff note 里都有用。

如果你总是想要行号，Git 有一个对应的 config：

```bash
git config --global grep.lineNumber true
```

我仍然倾向于手动输入 `-n`，因为它在 snippets 里可见，也更容易移植。

### 2. 搜索字面字符串，而不是 regex

```bash
git grep -n -F "useEffect(" -- "*.js" "*.jsx" "*.ts" "*.tsx"
```

当 pattern 是固定字符串时，用 `-F`。括号、点、方括号和其他看起来像 regex 的字符都会被当作普通文本。

这里有两个小习惯很重要：

- 把 file globs 放在 `--` 后面。
- 给 globs 加引号，避免 shell 在 Git 看到它们之前先展开。

当我知道确切的 function call、config key、class name 或 error message 时，我要的就是这个版本。

### 3. 不区分大小写、按完整单词、带列号搜索

```bash
git grep -n -i -w --column "customer"
```

`-i` 忽略大小写。`-w` 要求 whole-word matches。`--column` 打印这一行中第一个匹配项的列号。

当某个词太常见，原始输出开始吵起来时，这很好用。把结果送进 editor integrations 或 quickfix lists 时也有用。

### 4. 搜索以 dash 开头的 pattern

```bash
git grep -n -e "--force"
```

没有 `-e` 的话，Git 可能会把 pattern 当作另一个 command-line option。`-e` 的意思是："下一个东西是 search pattern。" 这是那种你不常需要的小 flag，但一旦需要，就是真的需要。

你也可以传多个 `-e`：

```bash
git grep -n -e "oldBillingFlow" -e "legacyCheckout"
```

这会搜索任意一个 pattern。

### 5. 当结构重要时使用 regex

```bash
git grep -n -E "def[[:space:]]+[[:alnum:]_]+\\(" -- "*.py"
```

`-E` 启用 extended regular expressions。这个例子寻找 Python 函数定义，但没有假装自己是 parser。

面对更大的结构性问题，请使用语言工具。`git grep` 非常擅长找候选项；它不是 AST engine，而这种诚实正是我喜欢它的原因之一。

### 6. 把搜索限制到某个 path

```bash
git grep -n "FeatureFlag" -- src components
```

`--` 后面的 pathspecs 会让搜索保持聚焦。这常常不只是计算上更快，也是脑子里更快。你在告诉命令：你关心哪一种答案。

你也可以排除 paths：

```bash
git grep -n "logger" -- src ":(exclude)src/generated" ":(exclude)*.snap"
```

Git pathspecs 很强，也有点怪。重要的实践规则是：path filters 放在 `--` 后面，而像 `:(exclude)...` 这样的 exclusion pathspecs 由 Git 处理，不由 shell 处理。

### 7. 只列出匹配的文件

```bash
git grep -l "useOldCheckout"
```

`-l` 打印文件名，而不是匹配行。当下一步是"打开这些文件"或"数一下 blast radius"，而不是"阅读每个 match"时，用它。

反向版本也存在：

```bash
git grep -L "use client" -- "src/**/*.tsx"
```

`-L` 会列出**不**包含该 pattern 的已跟踪文件。在 framework migrations 中，这可能出奇地顺手。

### 8. 按文件统计匹配数

```bash
git grep -c "TODO"
```

`-c` 给你一张快速 heat map。它不是代码质量指标；拜托别把它变成一个。但在你开始编辑之前，它很适合用来发现某个词集中在哪些文件里。

### 9. 搜索 staged 版本，而不是 working tree

```bash
git grep -n --cached "newConfigKey"
```

默认情况下，`git grep` 搜索 working tree 中已跟踪的 paths。`--cached` 搜索 index 里的 blobs，也就是 staged 版本。

这在 pre-commit checks、review scripts，或者任何你想问"我到底 staged 了什么？"而不是"磁盘上现在有什么？"的时候都很有用。

### 10. 搜索 untracked files，同时记住 ignore rules

```bash
git grep -n --untracked "draftFlag"
```

`--untracked` 会把 untracked files 加进搜索。在这个模式下，Git 的标准 ignore rules 会被遵守，所以 ignored files 仍然不会出现在结果里。

如果你真的也想要 ignored files：

```bash
git grep -n --untracked --no-exclude-standard "draftFlag"
```

这是一个有意为之的动作。我会在怀疑某个 generated file、本地 fixture 或 ignored artifact 里藏着我要找的东西时用它。

### 11. 不 checkout，直接搜索另一个 branch、tag 或旧 commit

```bash
git grep -n "validateUser" main
git grep -n "validateUser" v2.3.0
git grep -n "validateUser" HEAD~20 -- src
```

这是 killer feature。

不用 checkout。不用 stash。不用绕去 worktree。你可以直接向某个 branch、tag 或旧 commit 提问，同时留在原地。

当 bug report 说"这个在上一个 release 里还能用"时，我通常从这里开始。

### 12. 只有在你真的这么想时，才搜索每个 commit

```bash
git rev-list --all | xargs -n 50 git grep -n "validateUser"
```

这会分批搜索整段历史中的 commit trees。对一个严肃的 repository 来说，它可能很吵、重复，也很贵，因为同一份 file content 可能出现在许多 commits 里。

大多数时候，如果你真正的问题是"这个 string 是什么时候出现或消失的？"，`git log` 是更好的 companion：

```bash
git log -S "validateUser" --oneline -- src
git log -G "validate(User|Account)" -p -- src
```

`-S` 用来寻找某个 string 的 occurrence count 变化。`-G` 用来寻找 added 或 removed lines match 某个 regex 的 diffs。问题不同，工具也不同。

## `.gitignore` 的坑

"`git grep` respects `.gitignore`" 这句话接近到很诱人，也错到会咬人。

默认情况下，`git grep` 搜索已跟踪文件。`.gitignore` 文件的作用，是让 untracked files 保持 untracked。已经被 Git 跟踪的文件，不会因为后来有一条 ignore rule match 到它，就突然隐形。

所以精确版本是：

- 默认情况下，`git grep` 搜索 working tree 中的 tracked paths。
- Ignored-but-untracked files 不会被搜索，因为 untracked files 本来就不会被搜索。
- Ignored-but-tracked files **会**被搜索，因为它们是 tracked。
- `--untracked` 会加入 untracked files，同时仍然遵守 standard ignore rules。
- `--untracked --no-exclude-standard` 也会包含 ignored files。
- `--no-index` 会把 `git grep` 变成从当前目录开始的 filesystem search，即使不在 repo 里也一样。
- `--no-index --exclude-standard` 会让这个 filesystem search 遵守 Git 的 standard ignore rules。

这个边界情况在老 repositories 里很重要。一个文件可能先被 committed，后来才被 ignored。如果你在追一个 string，而 `git grep` 在一个 supposedly ignored file 里找到了它，Git 没有糊涂。这个文件是 tracked。

## 什么时候 `rg` 是更好的工具

当你想要 filesystem semantics 时，用 ripgrep。

```bash
rg "validateUser"
rg -S "validateUser"
rg --hidden "validateUser"
rg --no-ignore "validateUser"
```

`rg` 遍历 directory tree。默认情况下，它遵守 `.gitignore`、`.ignore`、`.rgignore`、global ignore files、hidden-file rules 和 binary-file skipping。它很快，很成熟；当我要搜索磁盘上真实存在的 working directory 时，它通常就是我想要的工具。

代价是，`rg` 不知道怎么搜索 `v2.3.0` 或 `HEAD~20`，除非你把那个 tree checkout 到某个地方。Git history 不是它的世界。

所以我的经验法则是：

- 对 tracked code 和 Git objects 使用 `git grep`：branches、tags、commits、staged content。
- 对 live filesystem 使用 `rg`：untracked files、non-Git directories、ignored-file experiments，以及广泛的 project search。

只选一个没有奖。把两个都放在手里。

## 紧凑速查表

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

`git grep` 那种无聊的力量在于，它从 Git 理解的项目开始。这正是你比自己想象中更常需要的东西：不是磁盘上的每个文件，不是每个 build artifact，不是每个本地实验，而只是属于这个 repository 的代码，再加上你能点名的任何旧版本代码。
