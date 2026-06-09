/**
 * Seed locations: uploads images to Cloudflare Images, inserts image rows,
 * and inserts location rows into the database.
 *
 * Setup:
 *   1. Create apps/api/.env with: DATABASE_URL=<your-neon-connection-string>
 *      (or export it in your shell)
 *   2. Fill in the LOCATIONS array below.
 *   3. Run from apps/api/:  pnpm tsx scripts/upload-location-images.ts
 */

import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { ilike } from "drizzle-orm";
import * as schema from "../src/db/schema";

const CF_ACCOUNT_ID = "08e981cecb92746f1f2cf59ac9969f40";
const CF_IMAGES_API_TOKEN = "hGaxkRAVgMhk0yT-gebvNHVSga8-G3cfkl_jkHBW";
const CF_API = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/images/v1`;

interface LocationEntry {
  // Required
  name: string;
  slug: string;
  path: string; // e.g. "new-zealand/north-island/wellington"
  type: string; // "country" | "island" | "region" | "city" | "suburb"
  level: number; // 0=country, 1=island/state, 2=region, 3=city
  countryCode: string; // "NZ" | "AU" | "US" etc.
  imageUrl?: string; // any publicly accessible image URL (omit to inherit parent's image)

  // Optional
  parentPath?: string; // path of the parent location (to auto-resolve parentId)
  latitude?: number;
  longitude?: number;
  isPopular?: boolean;
  description?: string;
  metaTitle?: string;
  metaDescription?: string;
}

// ─── Add your locations here ─────────────────────────────────────────────────
const LOCATIONS: LocationEntry[] = [
  {
    name: "Oban",
    slug: "oban",
    path: "new-zealand/stewart-island/oban",
    type: "city",
    level: 3,
    countryCode: "NZ",
    imageUrl: "",
    parentPath: "new-zealand/stewart-island",
    latitude: -46.9,
    longitude: 168.133333,
    isPopular: false,
  },
  {
    name: "Invercargill",
    slug: "invercargill",
    path: "new-zealand/south-island/southland/invercargill",
    type: "city",
    level: 3,
    countryCode: "NZ",
    imageUrl:
      "https://images.unsplash.com/photo-1583221953317-949514407dd0?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    parentPath: "new-zealand/south-island/southland",
    latitude: -46.413056,
    longitude: 168.3475,
    isPopular: false,
  },
  {
    name: "Riverton/Aparima",
    slug: "riverton",
    path: "new-zealand/south-island/southland/riverton",
    type: "city",
    level: 3,
    countryCode: "NZ",
    imageUrl: "",
    parentPath: "new-zealand/south-island/southland",
    latitude: -46.35,
    longitude: 168.016667,
    isPopular: false,
  },
  {
    name: "Otautau",
    slug: "otautau",
    path: "new-zealand/south-island/southland/otautau",
    type: "city",
    level: 3,
    countryCode: "NZ",
    imageUrl: "",
    parentPath: "new-zealand/south-island/southland",
    latitude: -46.142778,
    longitude: 167.999722,
    isPopular: false,
  },
  {
    name: "Tuatapere",
    slug: "tuatapere",
    path: "new-zealand/south-island/southland/tuatapere",
    type: "city",
    level: 3,
    countryCode: "NZ",
    imageUrl: "",
    parentPath: "new-zealand/south-island/southland",
    latitude: -46.133333,
    longitude: 167.683333,
    isPopular: false,
  },
  {
    name: "Clifden",
    slug: "clifden",
    path: "new-zealand/south-island/southland/clifden",
    type: "city",
    level: 3,
    countryCode: "NZ",
    imageUrl: "",
    parentPath: "new-zealand/south-island/southland",
    latitude: -46.033333,
    longitude: 167.716667,
    isPopular: false,
  },
  {
    name: "Edendale",
    slug: "edendale",
    path: "new-zealand/south-island/southland/edendale",
    type: "city",
    level: 3,
    countryCode: "NZ",
    imageUrl: "",
    parentPath: "new-zealand/south-island/southland",
    latitude: -46.316667,
    longitude: 168.783333,
    isPopular: false,
  },
  {
    name: "Mataura",
    slug: "mataura",
    path: "new-zealand/south-island/southland/mataura",
    type: "city",
    level: 3,
    countryCode: "NZ",
    imageUrl: "",
    parentPath: "new-zealand/south-island/southland",
    latitude: -46.183333,
    longitude: 168.866667,
    isPopular: false,
  },
  {
    name: "Winton",
    slug: "winton",
    path: "new-zealand/south-island/southland/winton",
    type: "city",
    level: 3,
    countryCode: "NZ",
    imageUrl: "",
    parentPath: "new-zealand/south-island/southland",
    latitude: -46.143056,
    longitude: 168.323611,
    isPopular: false,
  },
  {
    name: "Ohai",
    slug: "ohai",
    path: "new-zealand/south-island/southland/ohai",
    type: "city",
    level: 3,
    countryCode: "NZ",
    imageUrl: "",
    parentPath: "new-zealand/south-island/southland",
    latitude: -45.933056,
    longitude: 167.955833,
    isPopular: false,
  },
  {
    name: "Nightcaps",
    slug: "nightcaps",
    path: "new-zealand/south-island/southland/nightcaps",
    type: "city",
    level: 3,
    countryCode: "NZ",
    imageUrl: "",
    parentPath: "new-zealand/south-island/southland",
    latitude: -45.966667,
    longitude: 168.033333,
    isPopular: false,
  },
  {
    name: "Gore",
    slug: "gore",
    path: "new-zealand/south-island/southland/gore",
    type: "city",
    level: 3,
    countryCode: "NZ",
    imageUrl: "",
    parentPath: "new-zealand/south-island/southland",
    latitude: -46.099167,
    longitude: 168.946389,
    isPopular: false,
  },
  {
    name: "Lumsden",
    slug: "lumsden",
    path: "new-zealand/south-island/southland/lumsden",
    type: "city",
    level: 3,
    countryCode: "NZ",
    imageUrl: "",
    parentPath: "new-zealand/south-island/southland",
    latitude: -45.733333,
    longitude: 168.45,
    isPopular: false,
  },
  {
    name: "Te Anau",
    slug: "te-anau",
    path: "new-zealand/south-island/southland/te-anau",
    type: "city",
    level: 3,
    countryCode: "NZ",
    imageUrl: "",
    parentPath: "new-zealand/south-island/southland",
    latitude: -45.416667,
    longitude: 167.716667,
    isPopular: false,
  },
  {
    name: "Wallacetown",
    slug: "wallacetown",
    path: "new-zealand/south-island/southland/wallacetown",
    type: "city",
    level: 3,
    countryCode: "NZ",
    imageUrl: "",
    parentPath: "new-zealand/south-island/southland",
    latitude: -46.335,
    longitude: 168.288,
    isPopular: false,
  },
  {
    name: "Manapouri",
    slug: "manapouri",
    path: "new-zealand/south-island/southland/manapouri",
    type: "city",
    level: 3,
    countryCode: "NZ",
    imageUrl: "",
    parentPath: "new-zealand/south-island/southland",
    latitude: -45.5669,
    longitude: 167.6115,
    isPopular: false,
  },
  {
    name: "Milford Sound",
    slug: "milford-sound",
    path: "new-zealand/south-island/southland/milford-sound",
    type: "city",
    level: 3,
    countryCode: "NZ",
    imageUrl: "",
    parentPath: "new-zealand/south-island/southland",
    latitude: -44.648056,
    longitude: 167.905556,
    isPopular: false,
  },
  {
    name: "Riversdale",
    slug: "riversdale",
    path: "new-zealand/south-island/otago/rivesdale",
    type: "city",
    level: 3,
    countryCode: "NZ",
    imageUrl: "",
    parentPath: "new-zealand/south-island/otago",
    latitude: -45.9,
    longitude: 168.733333,
    isPopular: false,
  },
  {
    name: "Clinton",
    slug: "clinton",
    path: "new-zealand/south-island/otago/clinton",
    type: "city",
    level: 3,
    countryCode: "NZ",
    imageUrl: "",
    parentPath: "new-zealand/south-island/otago",
    latitude: -46.202611,
    longitude: 169.374889,
    isPopular: false,
  },
  {
    name: "Owaka",
    slug: "owaka",
    path: "new-zealand/south-island/otago/owaka",
    type: "city",
    level: 3,
    countryCode: "NZ",
    imageUrl: "",
    parentPath: "new-zealand/south-island/otago",
    latitude: -46.45,
    longitude: 169.666667,
    isPopular: false,
  },
  {
    name: "Balclutha",
    slug: "balclutha",
    path: "new-zealand/south-island/otago/balclutha",
    type: "city",
    level: 3,
    countryCode: "NZ",
    imageUrl: "",
    parentPath: "new-zealand/south-island/otago",
    latitude: -46.233333,
    longitude: 169.75,
    isPopular: false,
  },
  {
    name: "Tapanui",
    slug: "tapanui",
    path: "new-zealand/south-island/otago/tapanui",
    type: "city",
    level: 3,
    countryCode: "NZ",
    imageUrl: "",
    parentPath: "new-zealand/south-island/otago",
    latitude: -45.95,
    longitude: 169.266667,
    isPopular: false,
  },
  {
    name: "Milton",
    slug: "milton",
    path: "new-zealand/south-island/otago/milton",
    type: "city",
    level: 3,
    countryCode: "NZ",
    imageUrl: "",
    parentPath: "new-zealand/south-island/otago",
    latitude: -46.116667,
    longitude: 169.966667,
    isPopular: false,
  },
  {
    name: "Lawrence",
    slug: "lawrence",
    path: "new-zealand/south-island/otago/lawrence",
    type: "city",
    level: 3,
    countryCode: "NZ",
    imageUrl: "",
    parentPath: "new-zealand/south-island/otago",
    latitude: -45.913,
    longitude: 169.689,
    isPopular: false,
  },
  {
    name: "Roxburgh",
    slug: "roxburgh",
    path: "new-zealand/south-island/otago/roxburgh",
    type: "city",
    level: 3,
    countryCode: "NZ",
    imageUrl: "",
    parentPath: "new-zealand/south-island/otago",
    latitude: -45.533333,
    longitude: 169.316667,
    isPopular: false,
  },
  {
    name: "Alexandra",
    slug: "alexandra",
    path: "new-zealand/south-island/otago/alexandra",
    type: "city",
    level: 3,
    countryCode: "NZ",
    imageUrl:
      "https://images.pexels.com/photos/17824160/pexels-photo-17824160.jpeg",
    parentPath: "new-zealand/south-island/otago",
    latitude: -45.249167,
    longitude: 169.379722,
    isPopular: false,
  },
  {
    name: "Clyde",
    slug: "clyde",
    path: "new-zealand/south-island/otago/clyde",
    type: "city",
    level: 3,
    countryCode: "NZ",
    imageUrl: "",
    parentPath: "new-zealand/south-island/otago",
    latitude: -45.183333,
    longitude: 169.316667,
    isPopular: false,
  },
  {
    name: "Cromwell",
    slug: "cromwell",
    path: "new-zealand/south-island/otago/cromwell",
    type: "city",
    level: 3,
    countryCode: "NZ",
    imageUrl: "",
    parentPath: "new-zealand/south-island/otago",
    latitude: -45.045944,
    longitude: 169.195556,
    isPopular: false,
  },
  {
    name: "Arrowtown",
    slug: "arrowtown",
    path: "new-zealand/south-island/otago/arrowtown",
    type: "city",
    level: 3,
    countryCode: "NZ",
    imageUrl:
      "https://images.pexels.com/photos/32099872/pexels-photo-32099872.jpeg",
    parentPath: "new-zealand/south-island/otago",
    latitude: -44.9425,
    longitude: 168.835833,
    isPopular: false,
  },
  {
    name: "Cardrona",
    slug: "cardrona",
    path: "new-zealand/south-island/otago/cardrona",
    type: "city",
    level: 3,
    countryCode: "NZ",
    imageUrl:
      "https://images.pexels.com/photos/16507021/pexels-photo-16507021.jpeg",
    parentPath: "new-zealand/south-island/otago",
    latitude: -44.916667,
    longitude: 169,
    isPopular: false,
  },
  {
    name: "Wanaka",
    slug: "wanaka",
    path: "new-zealand/south-island/otago/wanaka",
    type: "city",
    level: 3,
    countryCode: "NZ",
    imageUrl:
      "https://images.pexels.com/photos/15066031/pexels-photo-15066031.jpeg",
    parentPath: "new-zealand/south-island/otago",
    latitude: -45.466667,
    longitude: 169.666667,
    isPopular: false,
  },
  {
    name: "Makarora",
    slug: "makarora",
    path: "new-zealand/south-island/otago/makarora",
    type: "city",
    level: 3,
    countryCode: "NZ",
    imageUrl: "",
    parentPath: "new-zealand/south-island/otago",
    latitude: -44.233333,
    longitude: 169.233333,
    isPopular: false,
  },
  {
    name: "Omakau",
    slug: "omakau",
    path: "new-zealand/south-island/otago/omakau",
    type: "city",
    level: 3,
    countryCode: "NZ",
    imageUrl: "",
    parentPath: "new-zealand/south-island/otago",
    latitude: -45.116667,
    longitude: 169.6,
    isPopular: false,
  },
  {
    name: "St Bathans",
    slug: "st-bathans",
    path: "new-zealand/south-island/otago/st-bathans",
    type: "city",
    level: 3,
    countryCode: "NZ",
    imageUrl: "",
    parentPath: "new-zealand/south-island/otago",
    latitude: -44.869444,
    longitude: 169.808333,
    isPopular: false,
  },
  {
    name: "Ranfurly",
    slug: "ranfurly",
    path: "new-zealand/south-island/otago/ranfurly",
    type: "city",
    level: 3,
    countryCode: "NZ",
    imageUrl: "",
    parentPath: "new-zealand/south-island/otago",
    latitude: -45.133333,
    longitude: 170.1,
    isPopular: false,
  },
  {
    name: "Mosgiel",
    slug: "mosgiel",
    path: "new-zealand/south-island/otago/mosgiel",
    type: "city",
    level: 3,
    countryCode: "NZ",
    imageUrl: "",
    parentPath: "new-zealand/south-island/otago",
    latitude: -45.875,
    longitude: 170.348611,
    isPopular: false,
  },
  {
    name: "Dunedin",
    slug: "dunedin",
    path: "new-zealand/south-island/otago/dunedin",
    type: "city",
    level: 3,
    countryCode: "NZ",
    imageUrl:
      "https://images.pexels.com/photos/913523/pexels-photo-913523.jpeg",
    parentPath: "new-zealand/south-island/otago",
    latitude: -45.874167,
    longitude: 170.503611,
    isPopular: false,
  },
  {
    name: "Karitane",
    slug: "karitane",
    path: "new-zealand/south-island/otago/karitane",
    type: "city",
    level: 3,
    countryCode: "NZ",
    imageUrl: "",
    parentPath: "new-zealand/south-island/otago",
    latitude: -45.638889,
    longitude: 170.655556,
    isPopular: false,
  },
  {
    name: "Waikouaiti",
    slug: "waikouaiti",
    path: "new-zealand/south-island/otago/waikouaiti",
    type: "city",
    level: 3,
    countryCode: "NZ",
    imageUrl: "",
    parentPath: "new-zealand/south-island/otago",
    latitude: -45.594444,
    longitude: 170.672222,
    isPopular: false,
  },
  {
    name: "Palmerston",
    slug: "palmerston",
    path: "new-zealand/south-island/otago/palmerston",
    type: "city",
    level: 3,
    countryCode: "NZ",
    imageUrl: "",
    parentPath: "new-zealand/south-island/otago",
    latitude: -45.484026,
    longitude: 170.715265,
    isPopular: false,
  },
];
// ─────────────────────────────────────────────────────────────────────────────

async function uploadImageToCloudflare(
  name: string,
  imageUrl: string,
): Promise<string> {
  const imageRes = await fetch(imageUrl);
  if (!imageRes.ok)
    throw new Error(`Failed to fetch image: ${imageRes.statusText}`);

  const blob = await imageRes.blob();
  const contentType = imageRes.headers.get("content-type") ?? "image/jpeg";
  const ext = contentType.split("/")[1]?.split(";")[0] ?? "jpg";
  const filename = `${name.toLowerCase().replace(/\s+/g, "-")}.${ext}`;

  const form = new FormData();
  form.append("file", new File([blob], filename, { type: contentType }));
  form.append("metadata", JSON.stringify({ name }));

  const res = await fetch(CF_API, {
    method: "POST",
    headers: { Authorization: `Bearer ${CF_IMAGES_API_TOKEN}` },
    body: form,
  });

  const json = (await res.json()) as {
    success: boolean;
    result?: { id: string };
    errors?: { message: string }[];
  };

  if (!json.success || !json.result?.id) {
    throw new Error(
      json.errors?.map((e) => e.message).join(", ") ?? "Unknown CF error",
    );
  }

  return json.result.id;
}

async function main() {
  if (LOCATIONS.length === 0) {
    console.log(
      "No locations defined. Add entries to the LOCATIONS array in this script.",
    );
    process.exit(0);
  }

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) throw new Error("DATABASE_URL is not set");

  const sql = neon(dbUrl);
  const db = drizzle(sql, { schema });

  console.log(`Processing ${LOCATIONS.length} location(s)...\n`);

  const results: { name: string; locationId: string; cfImageId: string }[] = [];
  const errors: { name: string; error: string }[] = [];

  // Pre-load all existing locations for fast lookup (path → id)
  const existingLocations = await db.query.Location.findMany({
    columns: { id: true, path: true },
  });
  const existingByPath = new Map(
    existingLocations.map((l) => [l.path.trim().toLowerCase(), l.id]),
  );

  for (const loc of LOCATIONS) {
    const normalizedPath = loc.path.trim().toLowerCase();

    // Skip if location already exists
    if (existingByPath.has(normalizedPath)) {
      console.log(`  [${loc.name}] Already exists — skipping.\n`);
      results.push({
        name: loc.name,
        locationId: existingByPath.get(normalizedPath)!,
        cfImageId: "(existing)",
      });
      continue;
    }

    try {
      // 1. Resolve parentId — case-insensitive match using ilike
      let parentId: string | null = null;
      if (loc.parentPath) {
        const normalizedParent = loc.parentPath.trim().toLowerCase();
        parentId = existingByPath.get(normalizedParent) ?? null;

        if (!parentId) {
          // Fallback: query DB with ilike in case of whitespace/case mismatch
          const parent = await db.query.Location.findFirst({
            where: ilike(schema.Location.path, loc.parentPath.trim()),
            columns: { id: true, path: true },
          });
          if (parent) {
            console.log(
              `  [${loc.name}] Parent found via ilike: "${parent.path}"`,
            );
            parentId = parent.id;
          } else {
            throw new Error(
              `Parent location not found for path: "${loc.parentPath}" (tried eq and ilike)`,
            );
          }
        }
      }

      // 2. Upload image if provided, otherwise leave image null
      let imageRowId: string | null = null;
      if (loc.imageUrl) {
        process.stdout.write(`  [${loc.name}] Uploading image... `);
        const cfImageId = await uploadImageToCloudflare(loc.name, loc.imageUrl);
        console.log(`✓ ${cfImageId}`);

        process.stdout.write(`  [${loc.name}] Inserting image row... `);
        const imageRows = await db
          .insert(schema.Image)
          .values({
            cfImageId,
            filename: `${loc.slug}.jpg`,
            mimeType: "image/jpeg",
            fileSize: 0,
            imageType: "place_hero",
            source: "admin_upload",
            altText: loc.name,
          })
          .returning({ id: schema.Image.id });
        const imageRow = imageRows[0];
        if (!imageRow) throw new Error("Image insert returned no row");
        imageRowId = imageRow.id;
        console.log(`✓ ${imageRow.id}`);
      } else {
        console.log(`  [${loc.name}] No image provided — will be null.`);
      }

      // 3. Insert location record
      process.stdout.write(`  [${loc.name}] Inserting location row... `);
      const locationRows = await db
        .insert(schema.Location)
        .values({
          name: loc.name,
          slug: loc.slug,
          path: loc.path,
          type: loc.type,
          level: loc.level,
          countryCode: loc.countryCode,
          image: imageRowId,
          parentId,
          latitude: loc.latitude?.toString(),
          longitude: loc.longitude?.toString(),
          isPopular: loc.isPopular ?? false,
          description: loc.description ?? null,
          metaTitle: loc.metaTitle ?? null,
          metaDescription: loc.metaDescription ?? null,
        })
        .onConflictDoNothing()
        .returning({ id: schema.Location.id });
      const locationRow = locationRows[0];
      if (!locationRow)
        throw new Error(
          "Location insert returned no row (possible duplicate path)",
        );
      console.log(`✓ ${locationRow.id}\n`);

      existingByPath.set(normalizedPath, locationRow.id);
      results.push({
        name: loc.name,
        locationId: locationRow.id,
        cfImageId: imageRowId ?? "(none)",
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      errors.push({ name: loc.name, error: message });
      console.log(`✗ ${message}\n`);
    }
  }

  console.log(
    "─── Summary ───────────────────────────────────────────────────────",
  );
  console.log("Name".padEnd(25), "Location ID".padEnd(38), "CF Image ID");
  console.log("─".repeat(90));
  for (const r of results) {
    console.log(r.name.padEnd(25), r.locationId.padEnd(38), r.cfImageId);
  }

  if (errors.length > 0) {
    console.log(
      "\n─── Errors ────────────────────────────────────────────────────────",
    );
    for (const e of errors) console.log(`  ${e.name}: ${e.error}`);
  }

  console.log(`\nDone. ${results.length} inserted, ${errors.length} failed.`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
