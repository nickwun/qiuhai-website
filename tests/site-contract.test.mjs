import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const root = new URL("..", import.meta.url).pathname;

const read = (path) => readFileSync(join(root, path), "utf8");

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
  ];

  for (const file of requiredFiles) {
    assert.equal(existsSync(join(root, file)), true, `missing ${file}`);
  }
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
  ];

  for (const field of fields) {
    assert.match(schema, new RegExp(`\\b${field}\\b`), `schema missing ${field}`);
  }
});

test("three example articles contain the required frontmatter", () => {
  const directory = join(root, "src/content/articles");
  const articles = readdirSync(directory).filter((file) => file.endsWith(".md"));
  assert.equal(articles.length, 3);

  const requiredFields = [
    "title",
    "description",
    "publishedAt",
    "category",
    "tags",
    "slug",
    "featured",
    "draft",
  ];

  for (const article of articles) {
    const content = read(`src/content/articles/${article}`);
    for (const field of requiredFields) {
      assert.match(content, new RegExp(`^${field}:`, "m"), `${article} missing ${field}`);
    }
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

  const article = read("dist/articles/why-i-keep-running/index.html");
  assert.match(article, /property="og:type" content="article"/);
  assert.match(article, /application\/ld\+json/);
  assert.match(article, /"@type":"BlogPosting"/);
  assert.match(article, /rel="canonical"/);
});
