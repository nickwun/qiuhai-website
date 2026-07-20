import rss from "@astrojs/rss";
import { SITE } from "../consts";
import { getPublicArticles } from "../lib/articles";

export async function GET(context: { site: URL }) {
  const posts = await getPublicArticles();

  return rss({
    title: `${SITE.name}｜${SITE.subtitle}`,
    description: SITE.description,
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.publishedAt,
      link: `/articles/${post.data.slug}/`,
      categories: post.data.tags,
    })),
    customData: "<language>zh-CN</language>",
  });
}
