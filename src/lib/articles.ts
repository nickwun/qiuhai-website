import { getCollection, type CollectionEntry } from "astro:content";

type Article = CollectionEntry<"articles">;

const newestFirst = (a: Article, b: Article) =>
  b.data.publishedAt.valueOf() - a.data.publishedAt.valueOf();

export const isPublicArticle = ({ data }: Article) => !data.draft && !data.sample;

export const isPreviewSample = ({ data }: Article) => !data.draft && data.sample;

export async function getPublicArticles() {
  return (await getCollection("articles", isPublicArticle)).sort(newestFirst);
}

export async function getPreviewSamples() {
  return (await getCollection("articles", isPreviewSample)).sort(newestFirst);
}
