import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../src/db/schema";

const CF_ACCOUNT_ID = "08e981cecb92746f1f2cf59ac9969f40";
const CF_IMAGES_API_TOKEN = "hGaxkRAVgMhk0yT-gebvNHVSga8-G3cfkl_jkHBW";

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) throw new Error("DATABASE_URL is not set");

  const sql = neon(dbUrl);
  const db = drizzle(sql, { schema });

  // Find image rows with no location referencing them
  const orphans = await sql`
    SELECT i.id, i.cf_image_id, i.alt_text, i.created_at
    FROM image i
    LEFT JOIN location l ON l.image = i.id::text
    WHERE i.image_type = 'place_hero'
      AND i.source = 'admin_upload'
      AND l.id IS NULL
    ORDER BY i.created_at DESC
  `;

  if (orphans.length === 0) {
    console.log("No orphaned image rows found.");
    process.exit(0);
  }

  console.log(`Found ${orphans.length} orphaned image row(s):\n`);
  for (const r of orphans) {
    console.log(`  DB id: ${r.id}`);
    console.log(`  CF id: ${r.cf_image_id}`);
    console.log(`  Name:  ${r.alt_text}`);
    console.log();
  }

  // Delete from Cloudflare Images
  console.log("Deleting from Cloudflare Images...");
  for (const r of orphans) {
    const res = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/images/v1/${r.cf_image_id}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${CF_IMAGES_API_TOKEN}` },
      },
    );
    const json = (await res.json()) as { success: boolean; errors?: { message: string }[] };
    if (json.success) {
      console.log(`  ✓ Deleted CF image ${r.cf_image_id}`);
    } else {
      console.log(`  ✗ CF delete failed for ${r.cf_image_id}: ${json.errors?.map((e) => e.message).join(", ")}`);
    }
  }

  // Delete from DB
  console.log("\nDeleting from DB...");
  const ids = orphans.map((r) => r.id as string);
  await sql`DELETE FROM image WHERE id = ANY(${ids}::uuid[])`;
  console.log(`  ✓ Deleted ${orphans.length} image row(s) from DB`);

  console.log(`\nDone. ${orphans.length} orphan(s) cleaned up.`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
