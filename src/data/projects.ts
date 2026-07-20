export interface Project {
  title: string;
  description: string;
  status: "已发布" | "持续更新" | "建设中";
  link: string | null;
  linkLabel: string | null;
  featured: boolean;
  order: number;
  purchaseControlled?: boolean;
}

export const PROJECTS: readonly Project[] = [
  {
    title: "低心率慢跑手册",
    description: "基于两年低心率训练和 24 次 MAF 测试整理的个人实践手册。",
    status: "已发布",
    link: null,
    linkLabel: null,
    featured: true,
    order: 1,
    purchaseControlled: true,
  },
  {
    title: "Hui in Small Town China",
    description: "用英文旁白记录中国县级市里的普通家庭、公共生活与日常变化。",
    status: "持续更新",
    link: null,
    linkLabel: null,
    featured: true,
    order: 2,
  },
  {
    title: "秋海的个人网站",
    description: "用于归档文章、展示作品和练习独立建站的长期项目。",
    status: "建设中",
    link: "/about/",
    linkLabel: "了解这个网站",
    featured: true,
    order: 3,
  },
];

export const getProjects = () => [...PROJECTS].sort((a, b) => a.order - b.order);
