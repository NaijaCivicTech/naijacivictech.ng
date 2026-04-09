/** Client-side Nigeria geo API types and fetchers (browser / React Query). */

export type GeoZoneRow = {
  id: string;
  slug: string;
  name: string;
  sortOrder: number;
};

export type GeoStateRow = {
  id: string;
  slug: string;
  name: string;
  capital: string;
};

export type GeoLgaRow = { id: string; slug: string; name: string };

export type GeoWardRow = { id: string; slug: string; name: string };

export const geoQueryKeys = {
  all: ["geo"] as const,
  zones: () => [...geoQueryKeys.all, "zones"] as const,
  states: (zoneSlug: string) =>
    [...geoQueryKeys.all, "states", zoneSlug] as const,
  lgas: (stateSlug: string) =>
    [...geoQueryKeys.all, "lgas", stateSlug] as const,
  wards: (stateSlug: string, lgaSlug: string) =>
    [...geoQueryKeys.all, "wards", stateSlug, lgaSlug] as const,
};

export async function fetchGeoZones(): Promise<GeoZoneRow[]> {
  const res = await fetch("/api/geo/zones");
  const data = (await res.json()) as { zones?: GeoZoneRow[]; error?: string };
  if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
  return data.zones ?? [];
}

export async function fetchGeoStates(zoneSlug: string): Promise<GeoStateRow[]> {
  const res = await fetch(
    `/api/geo/states?zone=${encodeURIComponent(zoneSlug)}`,
  );
  const data = (await res.json()) as {
    states?: GeoStateRow[];
    error?: string;
  };
  if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
  return data.states ?? [];
}

export async function fetchGeoLgas(stateSlug: string): Promise<GeoLgaRow[]> {
  const res = await fetch(
    `/api/geo/lgas?state=${encodeURIComponent(stateSlug)}`,
  );
  const data = (await res.json()) as { lgas?: GeoLgaRow[]; error?: string };
  if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
  return data.lgas ?? [];
}

export async function fetchGeoWards(
  stateSlug: string,
  lgaSlug: string,
): Promise<GeoWardRow[]> {
  const q = new URLSearchParams({ state: stateSlug, lga: lgaSlug });
  const res = await fetch(`/api/geo/wards?${q.toString()}`);
  const data = (await res.json()) as { wards?: GeoWardRow[]; error?: string };
  if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
  return data.wards ?? [];
}
