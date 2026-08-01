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
const jsonLdNodes = (html) => {
  const documents = [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map(
    ([, json]) => JSON.parse(json),
  );
  const nodes = [];
  const collect = (value) => {
    if (Array.isArray(value)) {
      value.forEach(collect);
    } else if (value && typeof value === "object") {
      if (value["@type"]) nodes.push(value);
      if (value["@graph"]) collect(value["@graph"]);
    }
  };
  documents.forEach(collect);
  return nodes;
};
const websiteNodes = (html) =>
  jsonLdNodes(html).filter(({ "@type": type }) =>
    Array.isArray(type) ? type.includes("WebSite") : type === "WebSite",
  );

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
  const homepageSlugs = new Set(
    [...formalArticles]
      .sort(
        (left, right) =>
          new Date(frontmatterValue(right.content, "publishedAt")) -
          new Date(frontmatterValue(left.content, "publishedAt")),
      )
      .slice(0, 5)
      .map(({ content }) => frontmatterValue(content, "slug")),
  );
  const home = read("dist/index.html");
  const archive = read("dist/articles/index.html");
  const rss = read("dist/rss.xml");
  const sitemap = read("dist/sitemap-0.xml");

  for (const { file, content } of formalArticles) {
    const title = frontmatterValue(content, "title");
    const slug = frontmatterValue(content, "slug");
    const category = frontmatterValue(content, "category");
    assert.ok(title && slug && category, `${file} is missing public metadata`);
    if (homepageSlugs.has(slug)) assert.match(home, new RegExp(slug), `${title} missing from homepage latest list`);
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

test("only the homepage exposes the canonical WebSite name JSON-LD", () => {
  const home = read("dist/index.html");
  const homeWebsites = websiteNodes(home);

  assert.equal(homeWebsites.length, 1, "homepage must expose exactly one WebSite node");
  assert.deepEqual(homeWebsites[0], {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://qiuhai.net.cn/#website",
    url: "https://qiuhai.net.cn/",
    name: "秋海",
    alternateName: ["秋海｜跑步写作手记", "跑步写作手记", "qiuhai.net.cn"],
  });

  for (const page of [
    "dist/articles/index.html",
    "dist/articles/does-low-heart-rate-running-work/index.html",
    "dist/about/index.html",
    "dist/works/index.html",
  ]) {
    assert.equal(websiteNodes(read(page)).length, 0, `${page} must not expose a WebSite node`);
  }

  assert.match(home, /<title>秋海｜跑步写作手记<\/title>/);
  assert.equal([...home.matchAll(/<h1\b[^>]*>秋海<\/h1>/g)].length, 1);
  assert.match(home, /<meta property="og:site_name" content="秋海">/);
  assert.match(home, /<link rel="canonical" href="https:\/\/qiuhai\.net\.cn\/">/);
  assert.match(home, /<meta name="robots" content="index, follow">/);
  assert.doesNotMatch(home, /noindex|\/Users\/|(?:\d{1,3}\.){3}\d{1,3}|BEGIN (?:RSA |OPENSSH )?PRIVATE KEY/);
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

test("approved ICP and public security filings render globally with the official asset and link", () => {
  const publicSecurityNumber = "闽公网安备35018102240193号";
  const publicSecurityUrl = "https://beian.mps.gov.cn/#/query/webSearch?code=35018102240193";
  const publicSecurityIcon = "assets/filing/public-security.png";
  const publicSecurityIconSha256 = "8dfecad0dfcb3dc584f2c2447943eefb1fd65a058856eb0611e2c56ddc4c1fe1";
  const pages = [
    "dist/index.html",
    "dist/articles/index.html",
    "dist/articles/before-memory-fades-understanding-grandfather/index.html",
    "dist/articles/does-low-heart-rate-running-work/index.html",
    "dist/articles/i-gave-data-the-power-to-judge-me/index.html",
    "dist/topics/index.html",
    "dist/works/index.html",
    "dist/about/index.html",
    "dist/now/index.html",
    "dist/404.html",
  ];

  assert.equal(existsSync(join(root, "public", publicSecurityIcon)), true, "missing official filing icon");
  assert.equal(sha256(join("public", publicSecurityIcon)), publicSecurityIconSha256, "source filing icon changed");
  assert.equal(existsSync(join(root, "dist", publicSecurityIcon)), true, "missing built filing icon");
  assert.equal(sha256(join("dist", publicSecurityIcon)), publicSecurityIconSha256, "built filing icon changed");

  for (const page of pages) {
    const html = read(page);
    assert.match(html, /闽ICP备2026028446号-1/, `${page} missing ICP filing`);
    assert.match(html, /href="https:\/\/beian\.miit\.gov\.cn\/"/, `${page} has the wrong ICP link`);
    assert.equal(html.split(publicSecurityNumber).length - 1, 1, `${page} must show the public security filing once`);

    const filingLink = html.match(/<a[^>]*class="public-security-filing"[^>]*>[\s\S]*?<\/a>/)?.[0];
    assert.ok(filingLink, `${page} missing public security filing link`);
    assert.match(filingLink, new RegExp(`href="${publicSecurityUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`));
    assert.match(filingLink, /target="_blank"/);
    assert.match(filingLink, /rel="noopener noreferrer"/);
    assert.match(filingLink, /<img[^>]*src="\/assets\/filing\/public-security\.png"[^>]*alt="公安备案"/);
    assert.ok(filingLink.indexOf("public-security.png") < filingLink.indexOf(publicSecurityNumber));
    assert.doesNotMatch(filingLink, /\/Users\/|(?:\d{1,3}\.){3}\d{1,3}|BEGIN (?:RSA |OPENSSH )?PRIVATE KEY/);
  }
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
  assert.match(env, /^PUBLIC_SECURITY_NUMBER=闽公网安备35018102240193号$/m);
  assert.match(
    env,
    /^PUBLIC_SECURITY_URL="https:\/\/beian\.mps\.gov\.cn\/#\/query\/webSearch\?code=35018102240193"$/m,
  );

  const config = read("src/config.ts");
  const deploy = read("scripts/deploy-manual.sh");
  assert.match(config, /闽公网安备35018102240193号/);
  assert.match(config, /https:\/\/beian\.mps\.gov\.cn\/#\/query\/webSearch\?code=35018102240193/);
  assert.match(deploy, /PUBLIC_SECURITY_NUMBER="\$\{PUBLIC_SECURITY_NUMBER:-闽公网安备35018102240193号\}"/);
  assert.match(
    deploy,
    /PUBLIC_SECURITY_URL="\$\{PUBLIC_SECURITY_URL:-https:\/\/beian\.mps\.gov\.cn\/#\/query\/webSearch\?code=35018102240193\}"/,
  );
});
