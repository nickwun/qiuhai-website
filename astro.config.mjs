import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";

const site = process.env.SITE_URL ?? "https://qiuhai.net.cn";
const outDir = process.env.BUILD_OUT_DIR ?? "./dist";

export default defineConfig({
  site,
  outDir,
  output: "static",
  trailingSlash: "always",
  integrations: [
    sitemap({
      filter: (page) => !page.endsWith("/404/") && !page.includes("/preview/"),
    }),
  ],
});
