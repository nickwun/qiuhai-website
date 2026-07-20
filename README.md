# 秋海

“秋海”是一个以中文长文章为主的个人博客，内容围绕跑步、写作与普通生活。网站使用 Astro 静态生成，不含 SSR、数据库、后台或前端框架。

## 技术栈

- Astro 7、TypeScript、Markdown
- Astro Content Collections 与 Schema 校验
- 原生 CSS 与 CSS Variables
- RSS、Sitemap、robots、Open Graph 和文章结构化数据

## 本地运行

需要 Node.js 22.12 或更高版本。首次运行浏览器回归检查前，需要安装测试浏览器：

```bash
npm ci
npx playwright install chromium
npm run dev
```

默认开发地址为 `http://localhost:4321`。开发环境可访问 `/preview/samples/` 查看排版样本；生产构建不会生成该入口。

## 检查与构建

```bash
npm run check
npm test
npm run build
npm run preview
```

`npm test` 会先生成生产构建，再检查内容隔离、两种索引模式、部署资产，以及 320–1440px 的浏览器级横向溢出。构建结果位于 `dist/`。

公开内容隐私与图片热链检查可单独运行：

```bash
npm run check:content
```

## 内容管理

在 `src/content/articles/` 新建 Markdown 文件，并填写 frontmatter：

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
sample: false
originalPlatform: 微信公众号 # 可选
originalUrl: https://example.com/article # 可选
cover: /images/cover.jpg # 可选
---
```

- `sample: true`：只用于本地排版检查；可在 `/preview/samples/` 查看，不进入任何生产路由、列表、专题、RSS 或 Sitemap。
- `draft: true`：尚未公开的真实草稿；本地样本入口也不会展示。
- 正式文章应同时设置 `sample: false` 和 `draft: false`。
- 删除样本时，删除对应 Markdown 文件即可；若不再需要任何样本，也可删除 `src/pages/preview/samples/`。

迁移内容时只复制用户明确指定的公开终稿。私人知识库、原始笔记和凭据不得读取或进入本仓库。

正式文章导入格式见 `docs/article-import-template.md`，本批导入状态与人工隐私确认项见 `docs/content-import-report.md`。终稿文件、首次发布日期或公开授权缺失时，不创建占位正式文章。

首批三篇微信公众号文章可从下载目录重复执行确定性导入：

```bash
node scripts/import-wechat-articles.mjs /path/to/wechat-download
```

脚本只读取该目录下已确认的三篇文章和对应图片；会生成站内 Markdown、本地化 5 张正文图片，并排除已记录的二维码和公众号尾部推广图片。导入后仍需运行 `npm run check:content` 和人工隐私复核。

## 环境变量

复制 `.env.example` 为本机 `.env`，但不要提交 `.env`。

| 变量 | 用途 | 安全默认值 |
| --- | --- | --- |
| `SITE_URL` | canonical、Open Graph、RSS、Sitemap | `https://qiuhai.net.cn` |
| `PUBLIC_INDEXING` | 是否允许正式页面被索引 | `false` |
| `ICP_NUMBER` / `ICP_URL` | ICP 备案展示 | 空，不渲染 |
| `PUBLIC_SECURITY_NUMBER` / `PUBLIC_SECURITY_URL` | 公安备案展示 | 空，不渲染 |

ICP备案完成前保持 `PUBLIC_INDEXING=false`。样本页无论该变量为何值都始终 `noindex`。

## 部署

默认生产方案为：`Astro → dist/ → rsync → 腾讯云轻量应用服务器 → Nginx`。本仓库只提供部署准备，不会自动连接服务器、修改 DNS 或申请证书。

本地无远端修改演练：

```bash
./scripts/deploy-manual.sh --dry-run
```

备案完成、配置 SSH 环境变量并获得明确部署授权后：

```bash
HEALTHCHECK_URL=https://qiuhai.net.cn ./scripts/deploy-manual.sh
```

完整准备步骤、Nginx 配置与回滚方式见 `docs/deployment-lighthouse.md`。EdgeOne Pages 仅作为 `future_optional_deployment` 保留，不是当前默认目标。

## 目录结构

```text
deploy/nginx/          # Nginx 静态站点模板
docs/                  # 实施、部署与视觉验收记录
scripts/               # 构建模式、响应式、部署与回滚脚本
src/
├── components/        # 通用展示组件
├── content/articles/  # Markdown 内容与本地样本
├── layouts/           # 页面布局
├── lib/               # 内容公开范围筛选
├── pages/             # 静态页面、RSS、robots 与预览入口
├── styles/            # 全局样式
├── config.ts          # 集中的生产环境配置
└── content.config.ts  # 内容 Schema
tests/                 # 内容与部署契约测试
```
