import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const articles = defineCollection({
  loader: glob({ base: "./src/content/articles", pattern: "**/*.md" }),
  schema: z.object({
    title: z.string().min(1),
    description: z.string().min(1).max(180),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    category: z.enum(["running", "creation", "life"]),
    tags: z.array(z.string().min(1)).default([]),
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    featured: z.boolean().default(false),
    draft: z.boolean().default(true),
    sample: z.boolean().default(false),
    originalPlatform: z.string().min(1).optional(),
    originalUrl: z.url().optional(),
    cover: z.string().min(1).optional(),
    purchaseQr: z.string().startsWith("/").optional(),
  }),
});

export const collections = { articles };
