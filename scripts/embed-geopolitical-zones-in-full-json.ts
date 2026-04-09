/**
 * One-off / idempotent: set `geopoliticalZone` (slug) on each top-level state row in
 * seeds/full.json. Run after adding new states to the seed file.
 *
 *   pnpm exec tsx scripts/embed-geopolitical-zones-in-full-json.ts
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const fullPath = join(__dirname, "../seeds/full.json");

/** State slug → zone slug (six standard zones; FCT → north-central). */
const ZONE_BY_STATE_SLUG: Record<string, string> = {
  // South East
  abia: "south-east",
  anambra: "south-east",
  ebonyi: "south-east",
  enugu: "south-east",
  imo: "south-east",
  // South South
  "akwa-ibom": "south-south",
  bayelsa: "south-south",
  "cross-river": "south-south",
  delta: "south-south",
  edo: "south-south",
  rivers: "south-south",
  // South West
  ekiti: "south-west",
  lagos: "south-west",
  ogun: "south-west",
  ondo: "south-west",
  osun: "south-west",
  oyo: "south-west",
  // North Central
  benue: "north-central",
  fct: "north-central",
  kogi: "north-central",
  kwara: "north-central",
  nasarawa: "north-central",
  niger: "north-central",
  plateau: "north-central",
  // North East
  adamawa: "north-east",
  bauchi: "north-east",
  borno: "north-east",
  gombe: "north-east",
  taraba: "north-east",
  yobe: "north-east",
  // North West
  jigawa: "north-west",
  kaduna: "north-west",
  kano: "north-west",
  katsina: "north-west",
  kebbi: "north-west",
  sokoto: "north-west",
  zamfara: "north-west",
};

type Row = {
  state: string;
  slug: string;
  geopoliticalZone?: string;
  capital: string;
  latitude: number;
  longitude: number;
  aliases?: string[];
  lgas: unknown;
};

const raw = JSON.parse(readFileSync(fullPath, "utf8")) as Row[];
const out = raw.map((row) => {
  const z = ZONE_BY_STATE_SLUG[row.slug];
  if (!z) {
    throw new Error(`No geopolitical zone mapping for state slug: ${row.slug}`);
  }
  return {
    state: row.state,
    slug: row.slug,
    geopoliticalZone: z,
    capital: row.capital,
    latitude: row.latitude,
    longitude: row.longitude,
    ...(row.aliases?.length ? { aliases: row.aliases } : {}),
    lgas: row.lgas,
  };
});

writeFileSync(fullPath, `${JSON.stringify(out, null, 2)}\n`);
console.log(`Wrote geopoliticalZone on ${raw.length} states → ${fullPath}`);
