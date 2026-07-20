import { readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

const projectRoot = new URL("..", import.meta.url).pathname;
const expectedTitles = [
  "低心率慢跑真的有用吗？我用两年 24 次测试回答",
  "我把判断自己的权力，交给了数据",
  "在记忆消失之前，我想多了解一点爷爷",
];

let json = false;
let contentDirectory = join(projectRoot, "src/content/articles");
for (let index = 2; index < process.argv.length; index += 1) {
  const argument = process.argv[index];
  if (argument === "--json") {
    json = true;
  } else if (argument === "--content-dir") {
    const value = process.argv[index + 1];
    if (!value) throw new Error("--content-dir requires a directory");
    contentDirectory = resolve(value);
    index += 1;
  } else {
    throw new Error(`unknown argument: ${argument}`);
  }
}

function markdownFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return markdownFiles(path);
    return entry.isFile() && entry.name.endsWith(".md") ? [path] : [];
  });
}

function frontmatterOf(content) {
  return content.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)?.[1] ?? "";
}

function scalar(frontmatter, key) {
  const value = frontmatter.match(new RegExp(`^${key}:\\s*(.+?)\\s*$`, "m"))?.[1]?.trim();
  return value?.replace(/^(["'])(.*)\1$/, "$2");
}

function isFormal(frontmatter) {
  return scalar(frontmatter, "draft") === "false" && scalar(frontmatter, "sample") === "false";
}

const rules = [
  {
    code: "remote-image",
    message: "发现外部图片热链；请改为经过授权的本地资源或移除图片。",
    pattern: /!\[[^\]]*\]\(https?:\/\/[^\s)]+\)|<img\b[^>]*\bsrc=["']https?:\/\/[^"']+["'][^>]*>/gi,
  },
  {
    code: "phone-number",
    message: "发现可能的中国大陆手机号。",
    pattern: /(?<!\d)1[3-9]\d{9}(?!\d)/g,
  },
  {
    code: "identity-number",
    message: "发现可能的身份证号码。",
    pattern: /(?<!\d)\d{17}[\dXx](?!\d)/g,
  },
  {
    code: "payment-account",
    message: "发现可能的支付或收款账号。",
    pattern: /(?:银行卡|支付宝账号|微信支付账号|收款账号)[：:\s]*[A-Za-z0-9@._-]{6,}/g,
  },
  {
    code: "contact-detail",
    message: "发现可能的私人联系方式。",
    pattern: /(?:微信号|联系微信|电子邮件|邮箱)[：:\s]*[A-Za-z0-9@._-]{4,}/g,
  },
  {
    code: "named-private-place",
    message: "发现带标签的学校、班级、住址、机构或工作单位信息。",
    pattern: /(?:孩子姓名|子女姓名|学校名称|班级|家庭地址|住址|门牌号|医院名称|养老院名称|工作单位|固定接送路线|接送路线)[：:]\s*[^\n]{2,}/g,
  },
  {
    code: "precise-address",
    message: "发现可能精确到楼栋、单元和房间的地址。",
    pattern: /\d+号楼\s*\d+单元\s*\d+室/g,
  },
];

const formalArticles = [];
const risks = [];
for (const file of markdownFiles(contentDirectory)) {
  const content = readFileSync(file, "utf8");
  const frontmatter = frontmatterOf(content);
  if (!isFormal(frontmatter)) continue;

  const title = scalar(frontmatter, "title") ?? "未命名文章";
  formalArticles.push({ file, title });
  for (const rule of rules) {
    for (const match of content.matchAll(new RegExp(rule.pattern.source, rule.pattern.flags))) {
      const line = content.slice(0, match.index).split(/\r?\n/).length;
      risks.push({ file, title, line, code: rule.code, message: rule.message });
    }
  }
}

const formalTitles = new Set(formalArticles.map(({ title }) => title));
const result = {
  formalArticleCount: formalArticles.length,
  missingTitles: expectedTitles.filter((title) => !formalTitles.has(title)),
  risks,
};

if (json) {
  process.stdout.write(`${JSON.stringify(result)}\n`);
} else {
  console.log(`公开文章检查：${result.formalArticleCount} 篇正式文章。`);
  if (result.missingTitles.length > 0) console.log(`待提供终稿：${result.missingTitles.join("；")}`);
  if (result.risks.length === 0) {
    console.log(
      result.missingTitles.length > 0
        ? "自动隐私与图片热链规则：已导入正文未发现命中项；尚未提供的正文不在检查范围内。"
        : "自动隐私与图片热链规则：未发现命中项。",
    );
  } else {
    for (const risk of result.risks)
      console.error(`${risk.file}:${risk.line} [${risk.code}] ${risk.message}`);
  }
}

process.exitCode = risks.length > 0 ? 1 : 0;
