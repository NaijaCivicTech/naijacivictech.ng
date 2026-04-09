/**
 * Upsert Nigeria geopolitical zones, states, LGAs, and wards from seeds/full.json.
 *
 * Usage:
 *   pnpm run db:seed:geo              # load .env.local then .env, connect and seed
 *   pnpm run db:seed:geo -- --dry-run # print counts only (no DB)
 *
 * Loads env: `.env.development`, then `.env`, then `.env.local` (later files override).
 * Requires MONGODB_URI (and optional MONGODB_DB) like the Next.js app.
 *
 * Re-seed after schema changes: existing documents used `stateId`/`lgaId` on LGAs/wards;
 * this version uses `state`/`lga`/`zone` and requires `geopoliticalZone` on each state row.
 */
import { config as loadEnv } from "dotenv";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import mongoose, { type AnyBulkWriteOperation, type Types } from "mongoose";
import { connectMongoose } from "../lib/mongoose";
import { NigeriaLgaModel } from "../lib/models/NigeriaLga";
import { NigeriaStateModel } from "../lib/models/NigeriaState";
import { NigeriaWardModel } from "../lib/models/NigeriaWard";
import {
  assertKnownGeopoliticalZoneSlug,
  seedNigeriaGeopoliticalZones,
} from "./seed-nigeria-zones";

const __dirname = dirname(fileURLToPath(import.meta.url));

loadEnv({ path: join(__dirname, "../.env.development") });
loadEnv({ path: join(__dirname, "../.env") });
loadEnv({ path: join(__dirname, "../.env.local") });

type SeedWard = { name: string; latitude: number; longitude: number };
type SeedLga = { name: string; wards: SeedWard[] };
type SeedStateRow = {
  state: string;
  slug: string;
  geopoliticalZone: string;
  capital: string;
  latitude: number;
  longitude: number;
  aliases?: string[];
  lgas: SeedLga[];
};

const BATCH = 1000;

function slugify(raw: string): string {
  const s = raw
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return s || "unknown";
}

function uniqueSlug(base: string, used: Set<string>): string {
  let s = base;
  let n = 2;
  while (used.has(s)) {
    s = `${base}-${n}`;
    n += 1;
  }
  used.add(s);
  return s;
}

function expandLgasForState(row: SeedStateRow): {
  lgaSlug: string;
  lgaName: string;
  wards: SeedWard[];
}[] {
  const used = new Set<string>();
  return row.lgas.map((lga) => {
    const base = slugify(lga.name);
    const lgaSlug = uniqueSlug(base, used);
    return { lgaSlug, lgaName: lga.name, wards: lga.wards };
  });
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size));
  }
  return out;
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const fullPath = join(__dirname, "../seeds/full.json");
  const raw = JSON.parse(readFileSync(fullPath, "utf8")) as SeedStateRow[];

  for (const row of raw) {
    if (!row.geopoliticalZone || typeof row.geopoliticalZone !== "string") {
      throw new Error(
        `State "${row.slug}" missing geopoliticalZone. Run: pnpm exec tsx scripts/embed-geopolitical-zones-in-full-json.ts`,
      );
    }
    assertKnownGeopoliticalZoneSlug(row.geopoliticalZone);
  }

  let lgaTotal = 0;
  let wardTotal = 0;
  for (const row of raw) {
    lgaTotal += row.lgas.length;
    for (const l of row.lgas) {
      wardTotal += l.wards.length;
    }
  }

  console.log(
    `Geo seed: ${raw.length} states, ${lgaTotal} LGAs, ${wardTotal} wards (from ${fullPath})`,
  );

  if (dryRun) {
    console.log("Dry run — no database writes.");
    return;
  }

  await connectMongoose();
  try {
    const zoneIdBySlug = await seedNigeriaGeopoliticalZones();
    console.log("Upserted geopolitical zones.");

    const stateOps: AnyBulkWriteOperation[] = raw.map((row) => {
      const zoneId = zoneIdBySlug.get(row.geopoliticalZone);
      if (!zoneId) {
        throw new Error(`Missing zone id for slug: ${row.geopoliticalZone}`);
      }
      return {
        updateOne: {
          filter: { slug: row.slug },
          update: {
            $set: {
              zone: zoneId,
              slug: row.slug,
              name: row.state,
              capital: row.capital,
              latitude: row.latitude,
              longitude: row.longitude,
              aliases: row.aliases ?? [],
            },
          },
          upsert: true,
        },
      };
    });

    await NigeriaStateModel.bulkWrite(stateOps);
    console.log(`Upserted ${raw.length} states.`);

    const states = await NigeriaStateModel.find({}).select("_id slug").lean();
    const stateOidBySlug = new Map(
      states.map((s) => [s.slug, s._id as Types.ObjectId]),
    );

    const lgaOps: AnyBulkWriteOperation[] = [];
    for (const row of raw) {
      const stateOid = stateOidBySlug.get(row.slug);
      if (!stateOid) {
        throw new Error(`Missing state id for slug: ${row.slug}`);
      }
      const expanded = expandLgasForState(row);
      for (const { lgaSlug, lgaName } of expanded) {
        lgaOps.push({
          updateOne: {
            filter: { state: stateOid, slug: lgaSlug },
            update: {
              $set: {
                state: stateOid,
                slug: lgaSlug,
                name: lgaName,
              },
            },
            upsert: true,
          },
        });
      }
    }

    for (const part of chunk(lgaOps, BATCH)) {
      await NigeriaLgaModel.bulkWrite(part);
    }
    console.log(`Upserted ${lgaOps.length} LGAs.`);

    const lgas = await NigeriaLgaModel.find({}).select("_id state slug").lean();
    const lgaOidByStateAndSlug = new Map<string, Types.ObjectId>();
    for (const l of lgas) {
      lgaOidByStateAndSlug.set(
        `${String(l.state)}:${l.slug}`,
        l._id as Types.ObjectId,
      );
    }

    const wardOps: AnyBulkWriteOperation[] = [];
    for (const row of raw) {
      const stateOid = stateOidBySlug.get(row.slug);
      if (!stateOid) continue;
      const expanded = expandLgasForState(row);
      for (const { lgaSlug, wards } of expanded) {
        const key = `${String(stateOid)}:${lgaSlug}`;
        const lgaOid = lgaOidByStateAndSlug.get(key);
        if (!lgaOid) {
          throw new Error(`Missing LGA for state ${row.slug} slug ${lgaSlug}`);
        }
        const wardUsed = new Set<string>();
        for (const w of wards) {
          const wBase = slugify(w.name);
          const wSlug = uniqueSlug(wBase, wardUsed);
          wardOps.push({
            updateOne: {
              filter: { lga: lgaOid, slug: wSlug },
              update: {
                $set: {
                  lga: lgaOid,
                  slug: wSlug,
                  name: w.name,
                  latitude: Number.isFinite(w.latitude) ? w.latitude : null,
                  longitude: Number.isFinite(w.longitude) ? w.longitude : null,
                },
              },
              upsert: true,
            },
          });
        }
      }
    }

    for (const part of chunk(wardOps, BATCH)) {
      await NigeriaWardModel.bulkWrite(part);
    }
    console.log(`Upserted ${wardOps.length} wards.`);
    console.log("Done.");
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
