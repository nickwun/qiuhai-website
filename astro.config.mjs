import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";

const site = process.env.SITE_URL ?? "https://qiuhai.example.com";

export default defineConfig({
  site,
  output: "static",
  trailingSlash: "always",
  integrations: [
    sitemap({
      filter: (page) => !page.endsWith("/404/"),
    }),
  ],
});
