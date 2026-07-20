# 秋海个人博客 V1 实施计划

## 目标

在空仓库中建立一个以中文长文章阅读为核心的 Astro 静态网站。内容由 Markdown 与 Astro Content Collections 管理，可直接部署到 EdgeOne Pages，不引入数据库、后台、登录或前端框架。

## 技术方案

- Astro 7、TypeScript、Markdown，`output: "static"`。
- `src/content.config.ts` 统一校验文章字段；草稿在列表、详情、RSS 与 sitemap 构建路径中排除。
- 共享布局负责站点导航、SEO、Open Graph、RSS 自动发现和通用页脚。
- 动态静态路由生成文章详情与专题详情；所有页面在构建期输出 HTML。
- 原生 CSS 与 CSS Variables 形成暖白、低饱和、单强调色的响应式设计，正文宽度限制为约 720px。
- `@astrojs/sitemap` 生成 sitemap，`@astrojs/rss` 生成 RSS，`public/robots.txt` 声明抓取规则。

## 实施阶段

1. 建立测试契约，先验证缺少站点结构时测试会失败。
2. 创建 npm/Astro/TypeScript/Git 基础配置、AGENTS.md、README 与内容 Schema。
3. 实现共享布局和组件、全局样式、首页、文章、专题、作品、关于、现在与 404 页面。
4. 添加 3 篇仅用于演示结构的中文示例文章，不导入或引用私人知识库。
5. 接入 sitemap、RSS、robots、文章 Open Graph 与 BlogPosting JSON-LD。
6. 安装依赖并运行 `npm test`、`npm run check`、`npm run build`。
7. 启动本地预览，在 360、390、768、1440 像素宽度下检查首页、列表与文章详情。
8. 核对 Git 差异与敏感路径，精确暂存，提交当前分支并尝试推送远端；不合并 main。

## 验收标准

- 所有指定路由均有静态输出，草稿不会进入公开页面或订阅源。
- 三篇示例文章通过 Content Collections Schema 校验。
- `dist/sitemap-index.xml`、`dist/rss.xml` 与 `dist/robots.txt` 存在。
- 文章详情包含 canonical、Open Graph 与 `BlogPosting` 结构化数据。
- 四档视口无横向溢出，移动端保持单栏，正文阅读宽度不超过约 720px。
- `npm test`、`npm run check`、`npm run build` 均以退出码 0 完成。
