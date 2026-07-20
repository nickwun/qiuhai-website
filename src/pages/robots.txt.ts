import { SITE_CONFIG } from "../config";

export function GET(context: { site: URL }) {
  if (!SITE_CONFIG.indexing) {
    return new Response("User-agent: *\nDisallow: /\n", {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const sitemap = new URL("sitemap-index.xml", context.site);
  return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${sitemap.href}\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
