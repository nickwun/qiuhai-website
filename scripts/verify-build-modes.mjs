import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const root = new URL("..", import.meta.url).pathname;
const output = mkdtempSync(join(tmpdir(), "qiuhai-indexing-build-"));

try {
  const build = spawnSync("npm", ["run", "build"], {
    cwd: root,
    encoding: "utf8",
    env: {
      ...process.env,
      BUILD_OUT_DIR: output,
      SITE_URL: "https://qiuhai.net.cn",
      PUBLIC_INDEXING: "true",
      ICP_NUMBER: "",
      ICP_URL: "",
      PUBLIC_SECURITY_NUMBER: "",
      PUBLIC_SECURITY_URL: "",
    },
  });

  assert.equal(build.status, 0, `${build.stdout}\n${build.stderr}`);

  const read = (path) => readFileSync(join(output, path), "utf8");
  const home = read("index.html");
  const robots = read("robots.txt");
  const sitemap = read("sitemap-0.xml");

  assert.match(home, /name="robots" content="index, follow"/);
  assert.match(home, /rel="canonical" href="https:\/\/qiuhai\.net\.cn\/"/);
  assert.match(robots, /Allow: \/(?:\n|$)/);
  assert.match(robots, /Sitemap: https:\/\/qiuhai\.net\.cn\/sitemap-index\.xml/);
  assert.doesNotMatch(robots, /Disallow: \/(?:\n|$)/);
  assert.doesNotMatch(home, /网站备案信息/);
  assert.doesNotMatch(sitemap, /preview\/samples|long-form-layout-sample|why-i-keep-running/);
  console.log("indexing mode verification: false and true build contracts passed");
} finally {
  rmSync(output, { recursive: true, force: true });
}
