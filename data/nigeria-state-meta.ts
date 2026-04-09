/**
 * Nigerian states: capitals, coordinates, aliases — sourced from seeds/full.json.
 * Import this only from server code, API routes, or seed scripts; the JSON is large.
 */

import fullSeed from "../seeds/full.json";

export type NigeriaGeoSeedWard = {
  name: string;
  latitude: number;
  longitude: number;
};

export type NigeriaGeoSeedLga = {
  name: string;
  wards: NigeriaGeoSeedWard[];
};

export type NigeriaGeoSeedStateRow = {
  state: string;
  slug: string;
  /** Slug of the six standard geopolitical zones (see seed + `NigeriaGeopoliticalZone`). */
  geopoliticalZone: string;
  capital: string;
  latitude: number;
  longitude: number;
  aliases?: string[];
  lgas: NigeriaGeoSeedLga[];
};

export type NigeriaStateMeta = {
  name: string;
  slug: string;
  geopoliticalZone: string;
  capital: string;
  latitude: number;
  longitude: number;
  aliases?: string[];
};

const rows = fullSeed as unknown as NigeriaGeoSeedStateRow[];

/** Full hierarchical seed (states → LGAs → wards). */
export const NIGERIA_GEO_FULL_SEED: NigeriaGeoSeedStateRow[] = rows;

/** State-level rows only (no lgas), derived from the seed file. */
export const NIGERIA_STATE_META: NigeriaStateMeta[] = rows.map((r) => ({
  name: r.state,
  slug: r.slug,
  geopoliticalZone: r.geopoliticalZone,
  capital: r.capital,
  latitude: r.latitude,
  longitude: r.longitude,
  ...(r.aliases?.length ? { aliases: r.aliases } : {}),
}));

const _lookup = new Map<string, string>();
for (const row of NIGERIA_STATE_META) {
  _lookup.set(row.name.trim().toLowerCase(), row.name);
  for (const a of row.aliases ?? []) {
    _lookup.set(a.trim().toLowerCase(), row.name);
  }
}

/** Resolve user/API string to canonical state name, or null. */
export function resolveNigeriaStateName(input: string): string | null {
  const k = input.trim().toLowerCase();
  return _lookup.get(k) ?? null;
}

export function getNigeriaStateMetaByName(input: string): NigeriaStateMeta | undefined {
  const canonical = resolveNigeriaStateName(input);
  if (!canonical) return undefined;
  return NIGERIA_STATE_META.find((s) => s.name === canonical);
}

export function getNigeriaStateMetaBySlug(slug: string): NigeriaStateMeta | undefined {
  const s = slug.trim().toLowerCase();
  return NIGERIA_STATE_META.find((row) => row.slug === s);
}

/** GeoJSON Point for Mongo 2dsphere (lng, lat). */
export function nigeriaStateLocationPoint(
  m: Pick<NigeriaStateMeta, "longitude" | "latitude">,
): { type: "Point"; coordinates: [number, number] } {
  return { type: "Point", coordinates: [m.longitude, m.latitude] };
}
