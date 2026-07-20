# 秋海

“秋海”是一个以中文长文章为主的个人博客，内容围绕跑步、写作与普通生活。第一版使用 Astro 静态生成，适合部署到 EdgeOne Pages。

## 技术栈

- Astro 7、TypeScript、Markdown
- Astro Content Collections
- 原生 CSS 与 CSS Variables
- 静态 HTML 输出，无 SSR、数据库和前端框架

## 本地运行

需要 Node.js 22.12 或更高版本。

```bash
npm install
npm run dev
```

默认开发地址为 `http://localhost:4321`。

## 检查与构建

```bash
npm test
npm run check
npm run build
npm run preview
```

构建结果位于 `dist/`。

## 添加文章

在 `src/content/articles/` 中新建 Markdown 文件，并填写以下 frontmatter：

```yaml
---
title: 文章标题
description: 一句话摘要
publishedAt: 2026-07-20
updatedAt: 2026-07-20 # 可选
category: running # running / creation / life
tags:
  - 标签
slug: article-slug
featured: false
draft: false
originalPlatform: 微信公众号 # 可选
originalUrl: https://example.com/article # 可选
cover: /images/cover.jpg # 可选
---
```

`draft: true` 的文章不会进入公开页面、RSS 或 sitemap。迁移内容时，只复制用户明确指定的公开终稿；私人知识库不得进入本仓库。

## 站点地址与 SEO

构建时通过 `SITE_URL` 设置正式域名；未设置时使用占位地址 `https://qiuhai.example.com`。

```bash
SITE_URL=https://your-domain.example npm run build
```

正式部署前必须设置真实域名，否则 canonical、Open Graph、RSS、robots 和 sitemap 会保留占位域名。

## EdgeOne Pages 部署

在 EdgeOne Pages 中连接本仓库并选择当前分支，使用以下配置：

- Framework preset：Astro
- Node.js：22.12 或更高
- Install command：`npm ci`
- Build command：`npm run build`
- Output directory：`dist`
- Environment variable：`SITE_URL=https://你的正式域名`

该项目使用 Astro 的 `output: "static"`，不需要 SSR adapter。推送分支可用于预览部署；确认后再在 EdgeOne 中切换生产分支。

## 目录结构

```text
src/
├── components/       # 通用展示组件
├── content/articles/ # Markdown 文章
├── layouts/          # 页面与文章布局
├── pages/            # 静态页面、动态静态路由、RSS 与 robots
├── styles/           # 全局样式
├── consts.ts         # 站点与专题常量
└── content.config.ts # 内容 Schema
```
