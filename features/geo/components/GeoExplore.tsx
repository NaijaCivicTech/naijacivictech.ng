"use client";

import { GeoSelectFieldSkeleton } from "@/features/geo/components/GeoLoadingSkeletons";
import {
  useGeoLgas,
  useGeoStates,
  useGeoWards,
  useGeoZones,
} from "@/features/geo/hooks/use-geo";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect } from "react";

const selectClass =
  "w-full min-w-0 cursor-pointer rounded-md border-[1.5px] border-line bg-paper px-3 py-2.5 font-sans text-sm text-ink outline-none focus:border-brand disabled:cursor-not-allowed disabled:opacity-50";

function buildExploreQuery(parts: {
  zone?: string;
  state?: string;
  lga?: string;
  ward?: string;
}): URLSearchParams {
  const q = new URLSearchParams();
  if (parts.zone) q.set("zone", parts.zone);
  if (parts.zone && parts.state) q.set("state", parts.state);
  if (parts.zone && parts.state && parts.lga) q.set("lga", parts.lga);
  if (parts.zone && parts.state && parts.lga && parts.ward) {
    q.set("ward", parts.ward);
  }
  return q;
}

export function GeoExplore() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const zoneParam = searchParams.get("zone")?.trim() ?? "";
  const stateParam = searchParams.get("state")?.trim() ?? "";
  const lgaParam = searchParams.get("lga")?.trim() ?? "";
  const wardParam = searchParams.get("ward")?.trim() ?? "";

  const zonesQuery = useGeoZones();
  const statesQuery = useGeoStates(zoneParam);
  const lgasQuery = useGeoLgas(stateParam);
  const wardsQuery = useGeoWards(stateParam, lgaParam);

  const zones = zonesQuery.data ?? [];
  const states = statesQuery.data ?? [];
  const lgas = lgasQuery.data ?? [];
  const wards = wardsQuery.data ?? [];

  const zonesLoading = zonesQuery.isPending;
  const statesLoading = Boolean(zoneParam && statesQuery.isPending);
  const lgasLoading = Boolean(stateParam && lgasQuery.isPending);
  const wardsLoading = Boolean(lgaParam && wardsQuery.isPending);

  const loadError =
    zonesQuery.error?.message ??
    (zoneParam ? statesQuery.error?.message : undefined) ??
    (stateParam ? lgasQuery.error?.message : undefined) ??
    (lgaParam ? wardsQuery.error?.message : undefined) ??
    null;

  const replaceQuery = useCallback(
    (q: URLSearchParams) => {
      const s = q.toString();
      router.replace(s ? `${pathname}?${s}` : pathname, { scroll: false });
    },
    [pathname, router],
  );

  useEffect(() => {
    if (!zoneParam || !stateParam) return;
    if (!statesQuery.isSuccess) return;
    const list = statesQuery.data ?? [];
    if (!list.some((s) => s.slug === stateParam)) {
      replaceQuery(buildExploreQuery({ zone: zoneParam }));
    }
  }, [
    zoneParam,
    stateParam,
    statesQuery.isSuccess,
    statesQuery.data,
    replaceQuery,
  ]);

  useEffect(() => {
    if (!zoneParam || !stateParam || !lgaParam) return;
    if (!lgasQuery.isSuccess) return;
    const list = lgasQuery.data ?? [];
    if (!list.some((l) => l.slug === lgaParam)) {
      replaceQuery(buildExploreQuery({ zone: zoneParam, state: stateParam }));
    }
  }, [
    zoneParam,
    stateParam,
    lgaParam,
    lgasQuery.isSuccess,
    lgasQuery.data,
    replaceQuery,
  ]);

  useEffect(() => {
    if (!zoneParam || !stateParam || !lgaParam || !wardParam) return;
    if (!wardsQuery.isSuccess) return;
    const list = wardsQuery.data ?? [];
    if (!list.some((w) => w.slug === wardParam)) {
      replaceQuery(
        buildExploreQuery({
          zone: zoneParam,
          state: stateParam,
          lga: lgaParam,
        }),
      );
    }
  }, [
    zoneParam,
    stateParam,
    lgaParam,
    wardParam,
    wardsQuery.isSuccess,
    wardsQuery.data,
    replaceQuery,
  ]);

  const onZoneChange = (next: string) => {
    const q = new URLSearchParams();
    if (next) q.set("zone", next);
    replaceQuery(q);
  };

  const onStateChange = (next: string) => {
    const z = searchParams.get("zone")?.trim() ?? "";
    replaceQuery(buildExploreQuery({ zone: z, state: next || undefined }));
  };

  const onLgaChange = (next: string) => {
    const z = searchParams.get("zone")?.trim() ?? "";
    const s = searchParams.get("state")?.trim() ?? "";
    replaceQuery(
      buildExploreQuery({
        zone: z,
        state: s,
        lga: next || undefined,
      }),
    );
  };

  const onWardChange = (next: string) => {
    const z = searchParams.get("zone")?.trim() ?? "";
    const s = searchParams.get("state")?.trim() ?? "";
    const l = searchParams.get("lga")?.trim() ?? "";
    replaceQuery(
      buildExploreQuery({
        zone: z,
        state: s,
        lga: l,
        ward: next || undefined,
      }),
    );
  };

  return (
    <div className='mx-auto w-full max-w-3xl px-4 py-10 lg:px-0'>
      <h1 className='font-display text-2xl font-bold text-ink'>Explore</h1>
      <p className='mt-2 text-sm leading-relaxed text-muted'>
        Zone, then state, local government, and ward.
      </p>

      {loadError ? (
        <p className='mt-4 rounded-lg border border-flame/30 bg-flame/5 px-3 py-2 text-sm text-flame'>
          {loadError}
        </p>
      ) : null}

      <div className='mt-8 flex w-full flex-col gap-6'>
        {zonesLoading ? (
          <GeoSelectFieldSkeleton label='Geopolitical zone' />
        ) : (
          <label className='flex w-full min-w-0 flex-col gap-1.5'>
            <span className='text-xs font-medium text-muted'>
              Geopolitical zone
            </span>
            <select
              className={selectClass}
              value={zoneParam}
              onChange={(e) => onZoneChange(e.target.value)}
            >
              <option value=''>Select zone…</option>
              {zones.map((z) => (
                <option key={z.id} value={z.slug}>
                  {z.name}
                </option>
              ))}
            </select>
          </label>
        )}

        {!zoneParam ? (
          <label className='flex w-full min-w-0 flex-col gap-1.5'>
            <span className='text-xs font-medium text-muted'>State</span>
            <select className={selectClass} value='' disabled>
              <option value=''>Choose a zone first</option>
            </select>
          </label>
        ) : statesLoading ? (
          <GeoSelectFieldSkeleton label='State' />
        ) : (
          <label className='flex w-full min-w-0 flex-col gap-1.5'>
            <span className='text-xs font-medium text-muted'>State</span>
            <select
              className={selectClass}
              value={stateParam}
              onChange={(e) => onStateChange(e.target.value)}
            >
              <option value=''>
                {states.length === 0
                  ? "No states in this zone"
                  : "Select state…"}
              </option>
              {states.map((s) => (
                <option key={s.id} value={s.slug}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
        )}

        {!stateParam ? (
          <label className='flex w-full min-w-0 flex-col gap-1.5'>
            <span className='text-xs font-medium text-muted'>LGA</span>
            <select className={selectClass} value='' disabled>
              <option value=''>Choose a state first</option>
            </select>
          </label>
        ) : lgasLoading ? (
          <GeoSelectFieldSkeleton label='LGA' />
        ) : (
          <label className='flex w-full min-w-0 flex-col gap-1.5'>
            <span className='text-xs font-medium text-muted'>LGA</span>
            <select
              className={selectClass}
              value={lgaParam}
              onChange={(e) => onLgaChange(e.target.value)}
            >
              <option value=''>
                {lgas.length === 0 ? "No LGAs for this state" : "Select LGA…"}
              </option>
              {lgas.map((l) => (
                <option key={l.id} value={l.slug}>
                  {l.name}
                </option>
              ))}
            </select>
          </label>
        )}

        {!lgaParam ? (
          <label className='flex w-full min-w-0 flex-col gap-1.5'>
            <span className='text-xs font-medium text-muted'>Ward</span>
            <select className={selectClass} value='' disabled>
              <option value=''>Choose an LGA first</option>
            </select>
          </label>
        ) : wardsLoading ? (
          <GeoSelectFieldSkeleton label='Ward' />
        ) : (
          <label className='flex w-full min-w-0 flex-col gap-1.5'>
            <span className='text-xs font-medium text-muted'>Ward</span>
            <select
              className={selectClass}
              value={wardParam}
              onChange={(e) => onWardChange(e.target.value)}
            >
              <option value=''>
                {wards.length === 0
                  ? "No wards for this LGA"
                  : `Select ward… (${wards.length} in this LGA)`}
              </option>
              {wards.map((w) => (
                <option key={w.id} value={w.slug}>
                  {w.name}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
    </div>
  );
}
