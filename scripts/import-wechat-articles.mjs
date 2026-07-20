import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";

const sourceRoot = process.argv[2] ? resolve(process.argv[2]) : null;
if (!sourceRoot) {
  console.error("用法：node scripts/import-wechat-articles.mjs <微信文章下载目录>");
  process.exit(1);
}

const projectRoot = new URL("..", import.meta.url).pathname;
const articleDirectory = join(projectRoot, "src/content/articles");
const imageDirectory = join(projectRoot, "public/images/articles");

const articles = [
  {
    sourceTitle: "低心率慢跑真的有用吗？我用两年 24 次 MAF 测试回答这个问题",
    title: "低心率慢跑真的有用吗？我用两年 24 次测试回答",
    description: "用两年 24 次 MAF 测试记录，观察低心率训练中的长期变化、季节波动和比赛表现。",
    publishedAt: "2026-06-05",
    category: "running",
    tags: ["低心率跑", "MAF", "跑步训练"],
    slug: "does-low-heart-rate-running-work",
    sourceUrl: "https://mp.weixin.qq.com/s/JukCjvuoM9XvV8RyQHIkdQ",
    removeTailFrom: "如果你也想认真练低心率慢跑",
    images: [
      ["001.jpg", "maf-test-table.jpg", "两年 24 次 MAF 测试记录表"],
      ["002.png", "maf-test-trend.png", "两年 MAF 测试配速趋势图"],
    ],
  },
  {
    sourceTitle: "被 AI 跑步教练批评了",
    title: "我把判断自己的权力，交给了数据",
    description: "一次临时加量后的恢复选择，让我重新审视训练数据究竟是在帮助决策，还是在替自己找理由。",
    publishedAt: "2026-06-14",
    category: "running",
    tags: ["跑步训练", "数据", "恢复"],
    slug: "i-gave-data-the-power-to-judge-me",
    sourceUrl: "https://mp.weixin.qq.com/s/Y-lFQ0f0I4AKL7WR8DolQg",
    images: [
      ["001.png", "running-data.png", "25 公里长距离与 12 公里恢复跑数据"],
      ["002.png", "sleep-data.png", "跑后当晚的睡眠记录"],
    ],
  },
  {
    sourceTitle: "爷爷演过皇帝",
    title: "在记忆消失之前，我想多了解一点爷爷",
    description: "探望九十一岁的爷爷时，我第一次认真询问他的过去，想在记忆消失之前多留下一点。",
    publishedAt: "2026-06-17",
    category: "life",
    tags: ["家庭", "记忆", "生活记录"],
    slug: "before-memory-fades-understanding-grandfather",
    sourceUrl: "https://mp.weixin.qq.com/s/69Ewdpi8g_zX366qmfCG9A",
    images: [["001.png", "grandfather-story.png", "与爷爷谈起往事的主题插画"]],
  },
];

function proseParagraphs(text) {
  const sentences = text.match(/[^。！？]+[。！？]+|[^。！？]+$/gu) ?? [];
  const paragraphs = [];
  for (let index = 0; index < sentences.length; index += 3) {
    paragraphs.push(sentences.slice(index, index + 3).join("").trim());
  }
  return paragraphs.filter(Boolean).join("\n\n");
}

function formatBody(raw, article) {
  let body = raw.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "");
  if (article.slug === "does-low-heart-rate-running-work") {
    body = body.replace(`${article.sourceTitle}练低心率慢跑以后`, "练低心率慢跑以后");
  }
  if (article.removeTailFrom) {
    const tailIndex = body.lastIndexOf(article.removeTailFrom);
    if (tailIndex >= 0) body = body.slice(0, tailIndex);
  }

  let imageIndex = 0;
  body = body.replace(/!\[[^\]]*\]\([^\r\n]+\)/g, () => `\n\n__IMAGE_${imageIndex++}__\n\n`);

  return body
    .split(/\n{2,}/)
    .map((block) => {
      const marker = block.trim().match(/^__IMAGE_(\d+)__$/);
      if (!marker) return proseParagraphs(block.trim());
      const image = article.images[Number(marker[1])];
      return image ? `![${image[2]}](/images/articles/${article.slug}/${image[1]})` : "";
    })
    .filter(Boolean)
    .join("\n\n")
    .trim();
}

for (const article of articles) {
  const sourceFile = join(sourceRoot, "articles", `${article.sourceTitle}.md`);
  const raw = readFileSync(sourceFile, "utf8");
  const body = formatBody(raw, article);
  const frontmatter = [
    "---",
    `title: ${article.title}`,
    `description: ${article.description}`,
    `publishedAt: ${article.publishedAt}`,
    `category: ${article.category}`,
    "tags:",
    ...article.tags.map((tag) => `  - ${tag}`),
    `slug: ${article.slug}`,
    "featured: true",
    "draft: false",
    "sample: false",
    "originalPlatform: 微信公众号",
    `originalUrl: ${article.sourceUrl}`,
    "---",
    "",
    "",
  ].join("\n");

  mkdirSync(articleDirectory, { recursive: true });
  writeFileSync(join(articleDirectory, `${article.slug}.md`), `${frontmatter}${body}\n`);

  const targetImages = join(imageDirectory, article.slug);
  mkdirSync(targetImages, { recursive: true });
  const sourceImages = join(sourceRoot, "images", article.sourceTitle);
  for (const [sourceName, targetName] of article.images) {
    copyFileSync(join(sourceImages, sourceName), join(targetImages, targetName));
  }

  console.log(`已导入：${article.title} -> ${basename(article.slug)}.md`);
}
