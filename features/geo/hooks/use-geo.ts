"use client";

import { useQuery } from "@tanstack/react-query";
import {
  fetchGeoLgas,
  fetchGeoStates,
  fetchGeoWards,
  fetchGeoZones,
  geoQueryKeys,
} from "@/features/geo/lib/geo-client";

/** All geopolitical zones (static list for Nigeria). */
export function useGeoZones() {
  return useQuery({
    queryKey: geoQueryKeys.zones(),
    queryFn: fetchGeoZones,
  });
}

/** States in a zone (`zoneSlug` from e.g. `north-central`). */
export function useGeoStates(
  zoneSlug: string | null | undefined,
  options?: { enabled?: boolean },
) {
  const z = zoneSlug?.trim() ?? "";
  const enabled = options?.enabled ?? true;
  return useQuery({
    queryKey: geoQueryKeys.states(z),
    queryFn: () => fetchGeoStates(z),
    enabled: enabled && Boolean(z),
  });
}

/** LGAs in a state (`stateSlug` e.g. `lagos`). */
export function useGeoLgas(
  stateSlug: string | null | undefined,
  options?: { enabled?: boolean },
) {
  const s = stateSlug?.trim() ?? "";
  const enabled = options?.enabled ?? true;
  return useQuery({
    queryKey: geoQueryKeys.lgas(s),
    queryFn: () => fetchGeoLgas(s),
    enabled: enabled && Boolean(s),
  });
}

/** Wards in an LGA (needs both state and LGA slugs; LGA is scoped per state in the API). */
export function useGeoWards(
  stateSlug: string | null | undefined,
  lgaSlug: string | null | undefined,
  options?: { enabled?: boolean },
) {
  const s = stateSlug?.trim() ?? "";
  const l = lgaSlug?.trim() ?? "";
  const enabled = options?.enabled ?? true;
  return useQuery({
    queryKey: geoQueryKeys.wards(s, l),
    queryFn: () => fetchGeoWards(s, l),
    enabled: enabled && Boolean(s) && Boolean(l),
  });
}
