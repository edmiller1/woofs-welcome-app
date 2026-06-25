import type { RequestHandler } from "@sveltejs/kit";
import { publicProcedure } from "$lib/api-helper";

export const GET: RequestHandler = async () => {
  const { data } = await publicProcedure.get<{ path: string; updatedAt: string }[]>(
    "/location/sitemap",
  );

  const urls = data
    .map(
      ({ path, updatedAt }) => `
  <url>
    <loc>https://woofswelcome.app/location/${path}</loc>
    <lastmod>${new Date(updatedAt).toISOString().split("T")[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`,
    )
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=86400",
    },
  });
};
