import type { RequestHandler } from "@sveltejs/kit";

const STATIC_PAGES = [
  { url: "https://woofswelcome.app", priority: "1.0", changefreq: "weekly" },
  { url: "https://woofswelcome.app/explore", priority: "0.9", changefreq: "daily" },
  { url: "https://woofswelcome.app/directory", priority: "0.8", changefreq: "weekly" },
  { url: "https://woofswelcome.app/about", priority: "0.6", changefreq: "monthly" },
  { url: "https://woofswelcome.app/contact", priority: "0.5", changefreq: "monthly" },
];

export const GET: RequestHandler = async () => {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://woofswelcome.app/sitemap-static.xml</loc>
  </sitemap>
  <sitemap>
    <loc>https://woofswelcome.app/sitemap-locations.xml</loc>
  </sitemap>
  <sitemap>
    <loc>https://woofswelcome.app/sitemap-places.xml</loc>
  </sitemap>
</sitemapindex>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=86400",
    },
  });
};
