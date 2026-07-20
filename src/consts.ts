export const SITE = {
  name: "秋海",
  subtitle: "跑步、写作与普通生活",
  description: "秋海的个人博客，记录跑步、写作、作品与普通生活。",
  author: "秋海",
};

export const TOPICS = [
  {
    slug: "running",
    name: "跑步",
    description: "训练、身体感受，以及在路上慢慢想明白的事。",
    marker: "01",
  },
  {
    slug: "creation",
    name: "创作",
    description: "关于写作、内容实践和把想法变成作品的过程。",
    marker: "02",
  },
  {
    slug: "life",
    name: "生活",
    description: "普通日子里的观察、选择与阶段性记录。",
    marker: "03",
  },
] as const;

export const CATEGORY_NAMES: Record<string, string> = Object.fromEntries(
  TOPICS.map((topic) => [topic.slug, topic.name]),
);
