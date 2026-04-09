/**
 * Normalize each top-level seed row to: state, slug, geopoliticalZone?, capital, lat/lng, aliases?, lgas.
 *
 *   npx tsx scripts/normalize-nigeria-seed-shape.ts
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const fullPath = join(__dirname, "../seeds/full.json");

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
const out = raw.map((row) => ({
  state: row.state,
  slug: row.slug,
  ...(row.geopoliticalZone
    ? { geopoliticalZone: row.geopoliticalZone }
    : {}),
  capital: row.capital,
  latitude: row.latitude,
  longitude: row.longitude,
  ...(row.aliases?.length ? { aliases: row.aliases } : {}),
  lgas: row.lgas,
}));

writeFileSync(fullPath, `${JSON.stringify(out, null, 2)}\n`);
