# 网站发布手册

在检出的 `personal-space` 工作区修改网站。推送到 GitHub 的 `personal-space` 分支后，GitHub Actions 会自动构建并发布到 [timidbirch.github.io](https://timidbirch.github.io/)。

## 1. 打开项目

    cd "/你的项目目录/timidbirch.github.io/personal-space"
    git status -sb
    git pull --ff-only origin personal-space

确认 `git status -sb` 显示当前分支为 `personal-space`。开始新一轮修改前，先检查是否有上次留下的改动。首次使用或依赖更新后，运行 `npm ci` 安装依赖。

## 2. 写文章或修改网站

### 从 Obsidian 发布

在默认笔记库 `~/timidbirch_obsidian` 中写文章，把以下 YAML 属性加在正文顶部。替换示例中的标题、日期和摘要。

    ---
    publish: true
    title: 我的新文章
    slug: my-new-article
    date: 2026-11-15
    description: 一两句话介绍这篇文章。
    category: 学习与生活
    language: zh
    ---

回到网站目录，先看同步计划，再生成发布文件。

    npm run blog:sync -- --dry-run
    npm run blog:sync
    git status --short

生成的文章在 `src/content/posts/obsidian/`，引用图片在 `public/media/blog/obsidian/`。检查待公开的正文和图片。更新同一篇文章时，在 Obsidian 修改原文并重新同步。保留原来的 `slug`，文章地址就会保留。更多分类和图片规则见 [博客与 Obsidian 发布指南](BLOG_GUIDE.md)。

### 直接写 Markdown

在 `src/content/posts/` 新建文件，例如 `my-new-article.md`。文件名对应文章地址 `/blog/my-new-article`，日期字段用 `pubDate`。

    ---
    title: 我的新文章
    description: 一两句话介绍这篇文章。
    pubDate: 2026-11-15
    category: 学习与生活
    language: zh
    ---

    从这里写正文。

### 修改页面

| 要改的地方 | 文件 |
| --- | --- |
| 首页标题、副标语和栏目 | `src/components/space/Home.astro` |
| 首页样式和首屏布局 | `src/styles/space-home.css` |
| 顶部导航、页脚 | `src/layouts/Header.astro`、`src/layouts/Footer.astro` |
| 关于页 | `src/pages/about.astro`、`src/pages/en/about.astro` |
| 项目介绍 | `src/content/projects/<项目名>/index.mdx` |

## 3. 本地预览

    npm run build
    npm run preview

构建成功后，打开终端显示的本地地址。检查文章、图片、链接和改过的页面。预览结束后按 `Ctrl+C`。如果构建报错，先修复终端显示的错误，再继续下一步。

## 4. 提交并上线

    git status --short
    git diff

用 `git add` 选中本次要发布的文件。直接写 Markdown 时，例如运行 `git add -- src/content/posts/my-new-article.md`。修改页面时将路径换成实际改动的文件。Obsidian 同步时，按 `git status` 的结果暂存生成的文章、清单和图片变更。

    git add -A -- src/content/posts/obsidian scripts/obsidian-manifest.json
    # 如果 git status 显示同步图片有变更，再执行下一行
    git add -A -- public/media/blog/obsidian

复核将要发布的内容，然后提交并推送。

    git diff --cached --stat
    git diff --cached
    git commit -m "发布新文章"
    git push origin personal-space

在 [GitHub Actions](https://github.com/timidbirch/timidbirch.github.io/actions/workflows/deploy.yml) 找到对应提交的运行记录。等 `build` 和 `deploy` 成功后，打开正式站点检查。构建产物 `dist/` 和依赖 `node_modules/` 由工具生成。

## 更新、撤下和回退

- **更新文章**：修改 Markdown 原文件，按预览、提交、推送的步骤发布。Obsidian 文章需要先重新同步。
- **撤下文章**：Obsidian 笔记设为 `publish: false` 后重新同步。直接写在仓库里的文章加 `draft: true`。提交并部署后，文章会下线。公开仓库的历史提交仍会保存已经推送的内容。
- **发布失败**：在 Actions 打开失败的 `build` 或 `deploy`，查看标红步骤。修复后再提交和推送。
- **撤销一次已上线的改动**：先用 `git log --oneline -10` 找到对应提交，再运行 `git revert <提交号>` 和 `git push origin personal-space`。撤销提交会触发重新发布。
