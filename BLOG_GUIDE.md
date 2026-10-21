# 博客与 Obsidian 发布指南

博客入口：`/blog`，英文界面：`/en/blog`。首版没有导入任何现有私人笔记。

## 选择一篇笔记公开

在 Obsidian 中，给准备公开的 Markdown 笔记顶部添加属性：

```yaml
---
publish: true
title: 我的第一篇文章
slug: my-first-note
date: 2026-10-22
description: 一两句话介绍这篇文章。
category: 技术与 AI
tags:
  - AI
  - 学习笔记
language: zh
---
```

`publish: true` 和有效的 `date` 是必需的。`slug` 建议设置为固定英文短名；不设置会生成稳定哈希。修改 slug 会改变文章地址。不要在 YAML 属性里放密码或其他私人资料。只有这篇笔记的正文和被引用的图片会导出，不会复制整个笔记库。

## 博客板块

通过笔记属性 `category` 指定板块，**不要依赖笔记所在的目录**：

| category | 板块地址 | 适合的内容 |
| --- | --- | --- |
| 技术与 AI | `/blog/category/technology` | AI、编程、信息安全 |
| 金融与量化 | `/blog/category/finance` | 市场、交易、量化研究 |
| 产品与创业 | `/blog/category/product` | 产品设计、创业实践 |
| 学习与生活 | `/blog/category/learning` | 学习方法、生活观察、随笔 |

例如 `category: 金融与量化` 的笔记同步后，会自动出现在金融板块及博客的“全部文章”中。未填写或无法识别的分类归入“学习与生活”，不会遗漏文章。旧分类“技术探索”“市场观察”“随笔”也兼容。目录变化不会改变文章板块，也不会让未标记发布的笔记公开。

板块名称、说明、顺序和兼容分类统一在 `src/lib/blog-categories.ts` 维护。每个板块都有对应的 `/en/blog/category/...` 英文界面。

## 同步与预览

在网站项目目录执行：

```sh
npm run blog:sync -- --dry-run
npm run blog:sync
npm run build
```

默认笔记库为当前用户目录下的 `timidbirch_obsidian`。也可以指定：

```sh
npm run blog:sync -- --vault /你的/笔记库路径 --dry-run
```

同步是单向的，不修改 Obsidian 原始笔记。生成文章在 `src/content/posts/obsidian/`，引用图片在 `public/media/blog/obsidian/`。不要直接编辑生成文件；请修改 Obsidian 原文后重新同步。普通文章也可以直接写进 `src/content/posts/`，使用 `title`、`description`、`pubDate` 等现有 Astro 文章属性。

构建不会读取本地笔记库，GitHub Actions 仅部署已经同步并提交的文件。Obsidian 保存后**不会立即自动公开**。检查网站预览、`git diff`、生成文章和引用图片，确认没有私人信息后再提交、推送，现有 GitHub Actions 会自动部署。

## 支持的笔记语法

- Markdown 标题、代码、表格、任务清单、引用、数学公式沿用现有文章渲染能力。
- `[[另一篇笔记]]`、`[[另一篇笔记|显示文字]]`：仅当目标也明确发布时生成链接；未发布目标只显示文字，不会递归公开目标笔记。
- `[[笔记#标题]]`：支持常规标题锚点；块引用 `#^id` 不支持，改用标题链接。
- `![[图片.png]]` 及 Markdown 图片：只复制这篇公开文章实际引用的 PNG、JPEG、WebP、GIF、AVIF。图片最大 20 MB，同名图片有歧义时请使用相对路径。
- `%%私人注释%%`：导出时移除；代码块、行内代码中的相同语法保持原样。
- 嵌入笔记、PDF、音视频、Canvas、Excalidraw、Mermaid 图渲染及原始 HTML 暂不支持。检测到不支持的嵌入会中止同步，避免误公开附件；普通 Mermaid 代码块会按代码展示。
- 不支持的本地链接会阻止同步，需改为已发布文章双链、普通文字或公开 HTTPS 链接。

博客搜索覆盖标题、摘要和标签，可以结合标签筛选。中英文切换的是网站界面，正文保留 `language` 声明的原文，不自动翻译，不需要手写两份。

## 更新和撤下

修改原文后重新同步并部署即可。移除 `publish: true`、设为 `publish: false` 或 `draft: true` 后，**再次同步、提交并部署**才会撤下生成的文章和不再引用的图片。工具只清理 `scripts/obsidian-manifest.json` 中记录的生成文件，不动其他内容。

注意：这是公开的 GitHub 仓库。撤下网页不等于清除 Git 历史、搜索引擎缓存或他人下载，因此敏感内容请不要提交。不要将整个笔记库复制进仓库，也不要把本地笔记库路径写进公开配置。

测试同步规则：`npm run blog:test`。测试使用临时模拟笔记库，不访问真实笔记。
