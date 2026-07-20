import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const root = new URL("..", import.meta.url).pathname;
const output = mkdtempSync(join(tmpdir(), "qiuhai-build-modes-"));

try {
  const buildMode = (name, purchase) => {
    const outDir = join(output, name);
    const build = spawnSync("npm", ["run", "build"], {
      cwd: root,
      encoding: "utf8",
      env: {
        ...process.env,
        BUILD_OUT_DIR: outDir,
        SITE_URL: "https://qiuhai.net.cn",
        PUBLIC_INDEXING: "true",
        PUBLIC_SHOW_PRODUCT_PURCHASE: purchase,
        ICP_NUMBER: "",
        ICP_URL: "",
        PUBLIC_SECURITY_NUMBER: "",
        PUBLIC_SECURITY_URL: "",
      },
    });
    assert.equal(build.status, 0, `${build.stdout}\n${build.stderr}`);
    return (path) => readFileSync(join(outDir, path), "utf8");
  };

  const readHidden = buildMode("purchase-hidden", "false");
  const readVisible = buildMode("purchase-visible", "true");
  const home = readHidden("index.html");
  const works = readHidden("works/index.html");
  const hiddenArticle = readHidden("articles/does-low-heart-rate-running-work/index.html");
  const visibleArticle = readVisible("articles/does-low-heart-rate-running-work/index.html");
  const robots = readHidden("robots.txt");
  const sitemap = readHidden("sitemap-0.xml");
  const rss = readHidden("rss.xml");

  assert.match(home, /name="robots" content="index, follow"/);
  assert.match(home, /rel="canonical" href="https:\/\/qiuhai\.net\.cn\/"/);
  assert.match(robots, /Allow: \/(?:\n|$)/);
  assert.match(robots, /Sitemap: https:\/\/qiuhai\.net\.cn\/sitemap-index\.xml/);
  assert.doesNotMatch(robots, /Disallow: \/(?:\n|$)/);
  assert.doesNotMatch(home, /网站备案信息/);
  assert.doesNotMatch(sitemap, /preview\/samples|long-form-layout-sample|why-i-keep-running/);
  assert.doesNotMatch(hiddenArticle, /handbook-qr\.png|低心率慢跑手册二维码/);
  assert.match(hiddenArticle, /购买入口将在网站正式上线后补充。/);
  assert.match(visibleArticle, /handbook-qr\.png/);
  assert.match(visibleArticle, /低心率慢跑手册二维码/);
  assert.doesNotMatch(visibleArticle, /购买入口将在网站正式上线后补充。/);
  assert.match(hiddenArticle, /两年 24 次 MAF 测试记录/);
  assert.match(visibleArticle, /两年 24 次 MAF 测试记录/);
  for (const outputText of [home, works]) {
    assert.match(outputText, /低心率慢跑手册/);
    assert.match(outputText, /已发布/);
    assert.match(outputText, /购买入口将在网站正式上线后补充。/);
    assert.doesNotMatch(outputText, /href=""/);
  }
  assert.match(rss, /does-low-heart-rate-running-work/);
  assert.match(sitemap, /does-low-heart-rate-running-work/);
  assert.equal(readVisible("rss.xml"), rss);
  assert.equal(readVisible("sitemap-0.xml"), sitemap);
  console.log("indexing and product purchase build contracts passed");
} finally {
  rmSync(output, { recursive: true, force: true });
}
