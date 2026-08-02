import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

const root = new URL("..", import.meta.url).pathname;
const read = (path) => readFileSync(join(root, path), "utf8");

const expectedArticles = [
  "低心率慢跑真的有用吗？我用两年 24 次测试回答",
  "我把判断自己的权力，交给了数据",
  "在记忆消失之前，我想多了解一点爷爷",
];

test("homepage and footer use the approved personal copy", () => {
  const home = read("dist/index.html");

  assert.match(home, /我是一名长期跑者和写作者。/);
  assert.match(home, /这里收录我关于跑步、创作和普通生活的长期记录/);
  assert.match(home, /也展示正在进行的作品与项目。/);
  assert.match(home, /我是秋海，一名长期跑者和写作者。/);
  assert.match(home, /我跑步十多年，也持续用文字记录训练、家庭和生活中的变化。/);
  assert.match(home, /最近开始学习视频创作和 AI 编程/);
  assert.match(home, /长期记录，诚实表达。/);
  assert.doesNotMatch(home, /个人内容实验/);
});

test("three typed projects render in order with honest link states", () => {
  assert.equal(existsSync(join(root, "src/data/projects.ts")), true, "missing project data module");
  const projects = read("src/data/projects.ts");
  for (const field of ["title", "description", "status", "link", "linkLabel", "featured", "order"])
    assert.match(projects, new RegExp(`\\b${field}\\b`), `project field missing: ${field}`);

  const home = read("dist/index.html");
  const works = read("dist/works/index.html");
  const titles = ["低心率慢跑手册", "Hui in Small Town China", "秋海的个人网站"];
  const statuses = ["已发布", "持续更新", "建设中"];

  for (const output of [home, works]) {
    for (const title of titles) assert.match(output, new RegExp(title));
    for (const status of statuses) assert.match(output, new RegExp(status));
    assert.doesNotMatch(output, /href=""/);
    assert.ok(titles.every((title, index) => output.indexOf(title) < (titles[index + 1] ? output.indexOf(titles[index + 1]) : Infinity)), "projects are out of order");
  }

  assert.match(works, /链接待补充/);
  assert.match(works, /href="\/about\/"/);
});

test("the import report records all formal sources, dates, cleanup, and privacy review", () => {
  assert.equal(existsSync(join(root, "docs/content-import-report.md")), true, "missing content import report");
  const report = read("docs/content-import-report.md");
  for (const title of expectedArticles) {
    assert.match(report, new RegExp(title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  for (const date of ["2026-06-05", "2026-06-14", "2026-06-17"]) assert.match(report, new RegExp(date));
  for (const source of ["JukCjvuoM9XvV8RyQHIkdQ", "Y-lFQ0f0I4AKL7WR8DolQg", "69Ewdpi8g_zX366qmfCG9A"])
    assert.match(report, new RegExp(source));
  assert.match(report, /成功导入文章数为 3/);
  assert.match(report, /二维码/);
  assert.match(report, /人工确认/);
  assert.doesNotMatch(report, /未提供终稿/);
});

test("privacy scanner reports fifteen formal articles without automated high-risk matches", () => {
  const result = spawnSync("node", ["scripts/check-public-content.mjs", "--json"], { cwd: root, encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
  const output = JSON.parse(result.stdout);
  assert.equal(output.formalArticleCount, 15);
  assert.deepEqual(output.missingTitles, []);
  assert.deepEqual(output.risks, []);
});

test("importing a source title never deletes the same words from a real opening sentence", () => {
  const article = read("src/content/articles/i-gave-data-the-power-to-judge-me.md");
  assert.match(article, /今天被 AI 跑步教练批评了。事情是这样的。/);
  assert.doesNotMatch(article, /今天。事情是这样的。/);
});

test("the approved handbook QR image remains local and is declared as controlled metadata", () => {
  const imagePath = "public/images/articles/does-low-heart-rate-running-work/handbook-qr.png";
  const markdownPath = "/images/articles/does-low-heart-rate-running-work/handbook-qr.png";
  const article = read("src/content/articles/does-low-heart-rate-running-work.md").trim();

  assert.equal(existsSync(join(root, imagePath)), true, "missing approved handbook QR image");
  assert.match(article, new RegExp(`^purchaseQr: ${markdownPath.replaceAll("/", "\\/")}$`, "m"));
  assert.doesNotMatch(article, /!\[低心率慢跑手册二维码\]/);
  assert.doesNotMatch(article, /关注我/);
});

test("privacy scanner rejects high-risk data and remote image hotlinks", () => {
  assert.equal(existsSync(join(root, "scripts/check-public-content.mjs")), true, "missing privacy scanner");
  const fixtureRoot = mkdtempSync(join(tmpdir(), "qiuhai-privacy-fixture-"));
  const riskyArticle = [
    "---",
    "title: 临时检查文件",
    "draft: false",
    "sample: false",
    "---",
    "联系电话：" + "138" + "0013" + "8000",
    "![远程图片](https://mmbiz.qpic.cn/example.jpg)",
  ].join("\n");
  writeFileSync(join(fixtureRoot, "risky.md"), riskyArticle);

  try {
    const result = spawnSync("node", ["scripts/check-public-content.mjs", "--json", "--content-dir", fixtureRoot], {
      cwd: root,
      encoding: "utf8",
    });
    assert.equal(result.status, 1);
    const output = JSON.parse(result.stdout);
    assert.ok(output.risks.some((risk) => risk.code === "phone-number"));
    assert.ok(output.risks.some((risk) => risk.code === "remote-image"));
  } finally {
    rmSync(fixtureRoot, { recursive: true, force: true });
  }
});
