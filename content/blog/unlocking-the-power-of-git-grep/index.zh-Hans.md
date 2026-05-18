---
lang: "zh-Hans"
translationOf: "unlocking-the-power-of-git-grep"
translationUpdatedAt: "2026-05-18"
translationSourceHash: "133f75c4ec8e9010"
title: "释放 'git grep' 的力量，高效搜索代码"
date: "2024-11-13"
description: "什么时候 'git grep' 胜过普通 grep，什么时候 'rg' (ripgrep) 又胜过它们，以及 'git grep' 到底会不会理会 .gitignore（剧透：不会）。"
featuredImage: "./images/featured.jpg"
imageCaption: "一个图书馆卡片目录抽屉被拉开。其中一张卡片微微探出——你正在找的那段文字。"
tags: ["git", "git grep", "ripgrep", "代码搜索", "开发者工具", "软件开发", "命令行工具"]
---

在一个辽阔的王国里，卷轴和手稿数不胜数。有一位名叫 Alaric 的学者住在那里。他的图书馆庞大得像一座知识迷宫：古老文本与当代著作并置，秘密藏在行与行之间。Alaric 常常需要在这片信息海中寻找一句难以捉摸的短语；日子久了，这件事越来越让人发怵。

某天清晨，阳光把金色洒在蒙尘的巨册上，Alaric 开始寻找档案里提到的一个概念。它只以 "The Whispering Sigil" 这个名字出现。他一卷卷翻阅，用惯常的方法筛过页面；可这些方法如今显得迟缓而不精确。他越往深处找，就越被无关段落、重复内容和误导性引用缠住。几小时变成几天，进展寥寥，挫败感也慢慢堆起来。

后来，一位老智者来访，看出了他的困境。智者会意一笑，说："也许你是在用困难的方法找。还有一条隐秘路径，只有那些懂得整理知识的人知道。" Alaric 被勾起了兴趣，听智者解释一种能聚焦搜索的方法。它能切开杂物，直接通向他要找的文本。

带着这个新办法，Alaric 又试了一次。这回，无关的杂音退去了。通往 "The Whispering Sigil" 的路径变得清晰，他以惊人的速度找到了想要的东西。仿佛他在自己的迷宫里打开了一扇秘密之门，快速抵达了所需的确切知识。

**噗。** 秘密揭晓：这就是 `git grep` 的力量。

## `git grep` 到底是什么

普通的 `grep -r` 会遍历文件系统。它尽职尽责地读取路径上的一切：源代码、日志文件、构建产物、同事忘了删掉的那个 4 MB 零散 dump 文件、整个 `node_modules` 树。`git grep` 做的事情更窄：它搜索 Git 已经知道的文件。它的大部分价值，就来自这一个设计选择。

### `git grep` 擅长什么

- **它搜索 tracked files，而不是文件系统。** Git 会维护一份列表，记录你曾经 staged 或 committed 的每个文件，也就是 index。`git grep` 从这份列表读取。未跟踪的杂物根本不在那里。没有 `node_modules/`，没有 `dist/`，没有 coverage reports，没有随机日志文件，因为 Git 从没被告知它们存在。

- **在大型 repo 中，它比 `grep -r` 更快。** 它已经有文件列表，所以跳过了文件系统遍历。它还会用多线程并行执行。收益是真的，但不是魔法。`git grep` 迭代的是 `grep` 也会读到的同一批 blobs，只是仪式少一点。这里没有内容搜索索引。"Git index" 是文件路径和 blob hash 的列表，不是 Lucene 风格的倒排索引。

- **它可以在不 checkout 的情况下搜索任意 ref。** 这是杀手特性。tag、branch、commit、tree object，都可以直接交给 `git grep`。不用 `git checkout`，不用 stash 舞步，也不用偏离你手头正在做的事。

### 实用示例

#### 基本搜索

要在仓库中搜索某个具体词，比如 `"initializeSettings"`：

```bash
git grep "initializeSettings"
```

这会扫描当前 branch 中所有 tracked files，寻找精确匹配。

#### 不区分大小写搜索

如果你不确定大小写，可以做不区分大小写的搜索：

```bash
git grep -i "initializesettings"
```

它会找到大小写不同的所有匹配。

#### 在指定 branch 中搜索

要在另一个 branch 里搜索，而不切过去，例如 `feature/login`：

```bash
git grep "validateUser" feature/login
```

这招很难被打败。不 checkout，不 stash，直接得到答案。

#### 跨所有 branches 搜索

要在每个 branch 中搜索某个词，包括 remotes：

```bash
git branch -a | xargs -n 1 git grep "configureDatabase"
```

要搜索 Git 知道的每个 commit，而不只是每个 branch tip：

```bash
git grep "configureDatabase" $(git rev-list --all)
```

这会在历史中任何地方的任何 blob 里寻找匹配。在繁忙的 repo 上可能需要一点时间，因为它真的在走过每个 commit。

#### 在 commit 历史中搜索

要找出某个字符串是在什么时候被加入或移除的，可以用：

```bash
git log -S "optimizePerformance"
```

这会显示引入或移除 `"optimizePerformance"` 这个词的 commits。

要查看这个词被加入或移除时的实际 diffs：

```bash
git log -G "optimizePerformance" -p
```

#### 使用正则表达式

`git grep` 支持正则表达式，可以做更高级的搜索：

```bash
git grep -E "def\s+\w+\("
```

这会匹配 Python 函数定义：`def`、空白、函数名，然后是一个字面意义上的左括号。（在 extended regex 中，`\(` 是字面括号，而 `(` 表示分组；这就是为什么这里需要反斜杠。）

### `git grep` 会读什么，不会读什么

`git grep` 遍历 index。就这样。它不会解析 `.gitignore`。很多人，包括本文之前的一个版本，都说它会；这个说法几乎正确，正如"地球是平的"在你一辈子只看一个停车场时也几乎正确。

两者看起来一致，只是因为 gitignored 文件通常也 untracked。一旦某个文件既被 gitignored 又被 tracked，比如有人跑过 `git add -f`，或者这个文件在规则出现之前就已经 committed，`git grep` 会照样搜索它。`rg` 不会。

你可以在二十秒内证明：

```bash
mkdir demo && cd demo
git init -q
echo "*.log" > .gitignore
echo "the secret phrase" > tracked.log
git add -f tracked.log .gitignore
git commit -qm init

git grep "secret phrase"   # finds it - the file is tracked, ignore rule notwithstanding
rg "secret phrase"         # finds nothing - rg actually reads .gitignore
```

所以精确的说法是：`git grep` 搜索 tracked files。这碰巧会跳过 `.gitignore` 会跳过的*大多数*东西，但机制不同，边界情况也重要。尤其是当你追查一个字符串，最后发现它住在某个多年前被人强行加入的 generated file 里时。

`.gitignore` 机制只会通过两个 opt-in 模式进入 `git grep`：

- `--untracked`：同时搜索 untracked files。*在这个模式下*，`git grep` 默认遵守 `.gitignore`，并跳过 ignored files（可以用 `--no-exclude-standard` 覆盖，也把它们搜进去）。
- `--no-index`：搜索当前目录，同时完全忽略 Git。在 repo 内想要 plain-grep 语义时很有用。在这个模式下，`git grep` 默认*不会*查询 `.gitignore`；如果你想要它这么做，可以用 `--exclude-standard` 显式打开。

默认的 `git grep`，不带任何 flags，永远不会打开你的 `.gitignore` 文件。

## 什么时候该用 `rg`

`git grep` 和 `rg`（ripgrep）其实不是竞争对手。它们遍历的东西不同。认真的工具箱里两个都该有。

- `git grep` 遍历 **index**：tracked files，以及你指向它的任何 ref 或 tree object。
- `rg` 遍历 **文件系统**：当前目录下的所有文件，减去 `.gitignore`、`.ignore`、`.rgignore` 和全局 excludes 让它跳过的部分。

它们各自能做对方做不了的事情。

当你想在不 checkout 的情况下跨历史搜索时，`git grep` 胜出：

```bash
git grep "deprecated_api" v2.3.0          # search a tag
git grep "deprecated_api" HEAD~50         # 50 commits ago
git grep "deprecated_api" $(git rev-list --all)   # every commit, ever
```

当你真正需要文件系统语义，并且希望正确处理 gitignore 时，`rg` 胜出：包括刚 clone 下来但还没 `git add` 的子目录、Git 从未听说过的 generated files，或者根本不是 Git repo 的目录。

```bash
rg "deprecated_api"                # respects .gitignore by default
rg --no-ignore "deprecated_api"    # opt back into ignored files
rg --hidden "deprecated_api"       # include dotfiles
```

`rg` 也是 VS Code 项目搜索背后的引擎，所以 "Find in Files" 感觉就像在终端里跑 `rg`。它的 Unicode 处理扎实；在大多数现代语料上，它至少和 `git grep` 一样快，常常更快。[ripgrep README 的 Linux kernel benchmark](https://github.com/BurntSushi/ripgrep/blob/master/README.md) 显示，在同一个查询上，ripgrep 大约比 `git grep -P` 快 3 倍。（提示：如果你想要"只有 pattern 里有大写时才区分大小写"的行为，传 `-S` 开启 smart-case。它是 opt-in，不是默认行为。）

如果你还没装 `rg`，修一下：

```bash
brew install ripgrep   # macOS
apt install ripgrep    # Debian/Ubuntu
cargo install ripgrep  # anywhere with Rust
```

把 `rg` 放在 `git grep` 旁边。它们负责不同的工作。

### `git grep` 的好处

- **相关性。** 它只搜索你正在 track 的东西。构建产物、缓存、`node_modules` 不会挡路，因为 Git 从没见过它们。
- **大型 repo 上的速度。** 多线程，不走文件系统遍历。
- **历史触达。** 任意 branch、tag 或 commit，且不离开你的 working tree。这是 `rg` 做不到的部分。
- **更少二进制噪音。** 和 `grep` 一样，`git grep` 会用 "Binary file X matches" 标记二进制文件，而不是倾倒字节；但因为它遍历 tracked files，通常一开始就会少遇到这类文件。传 `-I` 可以完全跳过二进制文件。

### 额外技巧

- **分页查看结果：**

  ```bash
  git grep "searchTerm" | less
  ```

- **按文件统计匹配次数：**

  ```bash
  git grep -c "searchTerm"
  ```

- **显示行号：**

  ```bash
  git grep -n "searchTerm"
  ```

- **在编辑器中打开每个匹配文件：**

  ```bash
  git grep -l "searchTerm" | xargs code
  ```

  把 `code` 换成 `nvim`、`subl`，或者你自己用的任何编辑器。

## 结论

就像 Alaric 在迷宫般的图书馆里找到了一条隐秘路径，`git grep` 会在 tracked codebase 中切出一条干净的线：快速、懂 branch，并且不被 Git 从未听说过的东西弄乱。它不是 `grep` 的万能替代品，也不是 `rg` 的替代品。它知道的是你的 repo 的 *index*；一旦你开始伸手去用它，迷宫就会小很多。

当问题是"这个代码库里，包括它的历史里，哪里有它"时，用 `git grep`。当问题是"磁盘上哪里有它，并且要遵守我的 ignore rules"时，用 `rg`。多数日子里，你会希望两者都在手边。

---

*2026-04-27 更新：修正了早先关于 `git grep` 会遵守 `.gitignore` 的说法（它不会，至少不是直接遵守）；放缓了"内部索引"的解释；修正了一个正则示例；并新增了什么时候该用 `rg` 的章节。*
