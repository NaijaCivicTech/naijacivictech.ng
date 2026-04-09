/**
 * Upsert the six Nigerian geopolitical zones into MongoDB.
 *
 * Usage:
 *   pnpm run db:seed:zones              # load env, connect, seed zones only
 *   pnpm run db:seed:zones -- --dry-run # print planned zones, no DB
 *
 * `pnpm run db:seed:geo` also seeds zones before states/LGAs/wards.
 */
import { config as loadEnv } from "dotenv";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import mongoose, { type AnyBulkWriteOperation, type Types } from "mongoose";
import { connectMongoose } from "../lib/mongoose";
import { NigeriaGeopoliticalZoneModel } from "../lib/models/NigeriaGeopoliticalZone";

const __dirname = dirname(fileURLToPath(import.meta.url));

loadEnv({ path: join(__dirname, "../.env.development") });
loadEnv({ path: join(__dirname, "../.env") });
loadEnv({ path: join(__dirname, "../.env.local") });

/** Canonical zone slugs (match `geopoliticalZone` on each state in seeds/full.json). */
export const NIGERIA_GEOPOLITICAL_ZONE_SEED = [
  { slug: "north-central", name: "North Central", sortOrder: 0 },
  { slug: "north-east", name: "North East", sortOrder: 1 },
  { slug: "north-west", name: "North West", sortOrder: 2 },
  { slug: "south-east", name: "South East", sortOrder: 3 },
  { slug: "south-south", name: "South South", sortOrder: 4 },
  { slug: "south-west", name: "South West", sortOrder: 5 },
] as const;

export type NigeriaGeopoliticalZoneSlug =
  (typeof NIGERIA_GEOPOLITICAL_ZONE_SEED)[number]["slug"];

const ALLOWED_SLUGS: Set<string> = new Set(
  NIGERIA_GEOPOLITICAL_ZONE_SEED.map((z) => z.slug),
);

export function assertKnownGeopoliticalZoneSlug(slug: string): void {
  if (!ALLOWED_SLUGS.has(slug)) {
    throw new Error(
      `Unknown geopoliticalZone slug "${slug}". Expected one of: ${[...ALLOWED_SLUGS].join(", ")}`,
    );
  }
}

/**
 * Upsert all zones; returns slug → ObjectId for wiring states during geo seed.
 */
export async function seedNigeriaGeopoliticalZones(): Promise<
  Map<string, Types.ObjectId>
> {
  const ops: AnyBulkWriteOperation[] = NIGERIA_GEOPOLITICAL_ZONE_SEED.map(
    (z) => ({
      updateOne: {
        filter: { slug: z.slug },
        update: {
          $set: {
            slug: z.slug,
            name: z.name,
            sortOrder: z.sortOrder,
          },
        },
        upsert: true,
      },
    }),
  );

  await NigeriaGeopoliticalZoneModel.bulkWrite(ops);

  const docs = await NigeriaGeopoliticalZoneModel.find({})
    .select("_id slug")
    .lean();
  const map = new Map<string, Types.ObjectId>();
  for (const d of docs) {
    map.set(d.slug, d._id as Types.ObjectId);
  }
  if (map.size !== NIGERIA_GEOPOLITICAL_ZONE_SEED.length) {
    throw new Error(
      `Expected ${NIGERIA_GEOPOLITICAL_ZONE_SEED.length} zone documents, found ${map.size}`,
    );
  }
  return map;
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  console.log(
    `Zones seed: ${NIGERIA_GEOPOLITICAL_ZONE_SEED.length} geopolitical zones`,
  );
  if (dryRun) {
    for (const z of NIGERIA_GEOPOLITICAL_ZONE_SEED) {
      console.log(`  - ${z.slug} (${z.name})`);
    }
    console.log("Dry run — no database writes.");
    return;
  }

  await connectMongoose();
  try {
    await seedNigeriaGeopoliticalZones();
    console.log("Upserted geopolitical zones.");
    console.log("Done.");
  } finally {
    await mongoose.disconnect();
  }
}

const isZonesCli =
  typeof process.argv[1] === "string" &&
  process.argv[1].replace(/\\/g, "/").endsWith("seed-nigeria-zones.ts");

if (isZonesCli) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
