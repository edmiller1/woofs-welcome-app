import type { RequestHandler } from "@sveltejs/kit";
import { publicProcedure } from "$lib/api-helper";

export const GET: RequestHandler = async ({ url }) => {
  const page = Number(url.searchParams.get("page") ?? "1");

  const { data } = await publicProcedure.get<
    { slug: string; locationPath: string; updatedAt: string }[]
  >("/place/sitemap", { params: { page } });

  const urls = data
    .map(
      ({ slug, locationPath, updatedAt }) => `
  <url>
    <loc>https://woofswelcome.app/location/${locationPath}/places/${slug}</loc>
    <lastmod>${new Date(updatedAt).toISOString().split("T")[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
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
