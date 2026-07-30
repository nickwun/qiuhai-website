import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const root = new URL("..", import.meta.url).pathname;

const read = (path) => readFileSync(join(root, path), "utf8");
const sha256 = (path) => createHash("sha256").update(readFileSync(join(root, path))).digest("hex");
const articleDirectory = join(root, "src/content/articles");
const articleFiles = () => readdirSync(articleDirectory).filter((file) => file.endsWith(".md"));
const frontmatterValue = (content, key) =>
  content.match(new RegExp(`^${key}:\\s*(.+?)\\s*$`, "m"))?.[1]?.trim().replace(/^(["'])(.*)\1$/, "$2");

test("required source pages and project files exist", () => {
  const requiredFiles = [
    "AGENTS.md",
    "README.md",
    "astro.config.mjs",
    "src/content.config.ts",
    "src/pages/index.astro",
    "src/pages/articles/index.astro",
    "src/pages/articles/[slug].astro",
    "src/pages/topics/index.astro",
    "src/pages/topics/[topic].astro",
    "src/pages/works.astro",
    "src/pages/about.astro",
    "src/pages/now.astro",
    "src/pages/404.astro",
    "src/pages/rss.xml.ts",
    "src/pages/robots.txt.ts",
    "src/pages/preview/samples/[...slug].astro",
    "src/config.ts",
    "src/lib/articles.ts",
    "scripts/check-responsive.mjs",
    "scripts/verify-build-modes.mjs",
  ];

  for (const file of requiredFiles) {
    assert.equal(existsSync(join(root, file)), true, `missing ${file}`);
  }
});

test("Baidu verification file is preserved verbatim in source and build output", () => {
  const verificationFile = "baidu_verify_codeva-O3Ni0PhIGW.html";
  const expectedSha256 = "c172fadf8bd74b373e09b60919334f09de238dd81998a0a6f1acd8de5b833923";

  assert.equal(existsSync(join(root, "public", verificationFile)), true, "missing source verification file");
  assert.equal(sha256(join("public", verificationFile)), expectedSha256, "source verification file changed");
  assert.equal(existsSync(join(root, "dist", verificationFile)), true, "missing built verification file");
  assert.equal(sha256(join("dist", verificationFile)), expectedSha256, "built verification file changed");
});

test("content schema declares every requested article field", () => {
  const schema = read("src/content.config.ts");
  const fields = [
    "title",
    "description",
    "publishedAt",
    "updatedAt",
    "category",
    "tags",
    "slug",
    "featured",
    "draft",
    "originalPlatform",
    "originalUrl",
    "cover",
    "sample",
  ];

  for (const field of fields) {
    assert.match(schema, new RegExp(`\\b${field}\\b`), `schema missing ${field}`);
  }
});

test("four layout samples are explicitly marked as sample content", () => {
  const articles = articleFiles().filter((article) => /^sample: true$/m.test(read(`src/content/articles/${article}`)));
  assert.equal(articles.length, 4);

  const requiredFields = [
    "title",
    "description",
    "publishedAt",
    "category",
    "tags",
    "slug",
    "featured",
    "draft",
    "sample",
  ];

  for (const article of articles) {
    const content = read(`src/content/articles/${article}`);
    for (const field of requiredFields) {
      assert.match(content, new RegExp(`^${field}:`, "m"), `${article} missing ${field}`);
    }
    assert.match(content, /^sample: true$/m, `${article} must be an explicit sample`);
  }
});

test("every formal article is published across its expected discovery surfaces", () => {
  const formalArticles = articleFiles()
    .map((file) => ({ file, content: read(`src/content/articles/${file}`) }))
    .filter(({ content }) => /^draft: false$/m.test(content) && /^sample: false$/m.test(content));
  const home = read("dist/index.html");
  const archive = read("dist/articles/index.html");
  const rss = read("dist/rss.xml");
  const sitemap = read("dist/sitemap-0.xml");

  for (const { file, content } of formalArticles) {
    const title = frontmatterValue(content, "title");
    const slug = frontmatterValue(content, "slug");
    const category = frontmatterValue(content, "category");
    assert.ok(title && slug && category, `${file} is missing public metadata`);
    assert.match(home, new RegExp(slug), `${title} missing from homepage`);
    assert.match(archive, new RegExp(slug), `${title} missing from article archive`);
    assert.match(read(`dist/topics/${category}/index.html`), new RegExp(slug), `${title} missing from category`);
    assert.match(rss, new RegExp(slug), `${title} missing from RSS`);
    assert.match(sitemap, new RegExp(slug), `${title} missing from Sitemap`);
    assert.equal(existsSync(join(root, `dist/articles/${slug}/index.html`)), true, `${title} detail page missing`);
  }
});

test("mobile navigation expands to the available header width", () => {
  const styles = read("src/styles/global.css");
  assert.match(styles, /\.header-inner nav\s*\{\s*width:\s*100%;\s*\}/);
});

test("production build exposes static discovery files and article metadata", () => {
  const requiredOutputs = [
    "dist/index.html",
    "dist/articles/index.html",
    "dist/topics/index.html",
    "dist/works/index.html",
    "dist/about/index.html",
    "dist/now/index.html",
    "dist/404.html",
    "dist/rss.xml",
    "dist/robots.txt",
    "dist/sitemap-index.xml",
  ];

  for (const file of requiredOutputs) {
    assert.equal(existsSync(join(root, file)), true, `missing build output ${file}`);
  }

  const layout = read("src/layouts/BaseLayout.astro");
  const articleRoute = read("src/pages/articles/[slug].astro");
  assert.match(layout, /property="og:type"/);
  assert.match(articleRoute, /"@type": "BlogPosting"/);
  assert.match(layout, /rel="canonical"/);
  assert.match(layout, /href="\/favicon\.svg\?v=ring-1"/);
});

test("sample and draft content stay outside every production discovery surface", () => {
  const sampleSlugs = [
    "leave-some-space",
    "why-i-keep-running",
    "writing-to-make-room",
    "long-form-layout-sample",
  ];
  const publicOutputs = [
    "dist/index.html",
    "dist/articles/index.html",
    "dist/topics/index.html",
    "dist/topics/running/index.html",
    "dist/topics/creation/index.html",
    "dist/topics/life/index.html",
    "dist/rss.xml",
    "dist/sitemap-0.xml",
  ].map(read).join("\n");

  for (const slug of sampleSlugs) {
    assert.doesNotMatch(publicOutputs, new RegExp(slug), `${slug} leaked into production output`);
    assert.equal(existsSync(join(root, `dist/articles/${slug}/index.html`)), false);
  }
  assert.match(read("src/lib/articles.ts"), /!data\.draft && !data\.sample/);
  assert.equal(existsSync(join(root, "dist/preview/samples/index.html")), false);
});

test("production defaults allow indexing while purchase entry remains disabled", () => {
  const home = read("dist/index.html");
  const robots = read("dist/robots.txt");
  assert.match(home, /name="robots" content="index, follow"/);
  assert.doesNotMatch(home, /noindex, nofollow/);
  assert.match(home, /https:\/\/qiuhai\.net\.cn/);
  assert.doesNotMatch(home, /handbook-qr\.png|低心率慢跑手册二维码/);
  assert.match(robots, /Allow: \/(?:\n|$)/);
  assert.match(robots, /Sitemap: https:\/\/qiuhai\.net\.cn\/sitemap-index\.xml/);
  assert.doesNotMatch(robots, /Disallow: \/(?:\n|$)/);
});

test("all public page titles contain the filed service name", () => {
  const pages = [
    "dist/index.html",
    "dist/articles/index.html",
    "dist/articles/does-low-heart-rate-running-work/index.html",
    "dist/topics/index.html",
    "dist/topics/running/index.html",
    "dist/works/index.html",
    "dist/about/index.html",
    "dist/now/index.html",
    "dist/404.html",
  ];

  assert.match(read("dist/index.html"), /<title>秋海｜跑步写作手记<\/title>/);
  for (const page of pages) {
    const title = read(page).match(/<title>(.*?)<\/title>/)?.[1];
    assert.ok(title?.includes("跑步写作手记"), `${page} title missing filed service name`);
  }
});

test("approved ICP filing is visible and public security filing remains absent", () => {
  const home = read("dist/index.html");
  assert.match(home, /闽ICP备2026028446号-1/);
  assert.match(home, /href="https:\/\/beian\.miit\.gov\.cn\/"/);
  assert.doesNotMatch(home, /公安备案|公网安备/);
});

test("environment example declares centralized production settings with approved filing values", () => {
  const env = read(".env.example");
  for (const key of [
    "SITE_URL",
    "PUBLIC_INDEXING",
    "PUBLIC_SHOW_PRODUCT_PURCHASE",
    "ICP_NUMBER",
    "ICP_URL",
    "PUBLIC_SECURITY_NUMBER",
    "PUBLIC_SECURITY_URL",
  ]) {
    assert.match(env, new RegExp(`^${key}=`, "m"), `.env.example missing ${key}`);
  }
  assert.match(env, /^SITE_URL=https:\/\/qiuhai\.net\.cn$/m);
  assert.match(env, /^PUBLIC_INDEXING=true$/m);
  assert.match(env, /^PUBLIC_SHOW_PRODUCT_PURCHASE=false$/m);
  assert.match(env, /^ICP_NUMBER=闽ICP备2026028446号-1$/m);
  assert.match(env, /^ICP_URL=https:\/\/beian\.miit\.gov\.cn\/$/m);
  assert.match(env, /^PUBLIC_SECURITY_NUMBER=$/m);
});
