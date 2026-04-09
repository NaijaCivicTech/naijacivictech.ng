"use client";

import { GeoOfficesBrowserSkeleton } from "@/features/geo/components/GeoLoadingSkeletons";
import { GeoTopFederalRoles } from "@/features/geo/components/GeoTopFederalRoles";
import {
  formatJurisdictionScopeForUi,
  sentenceCasePoliticalOfficePhrase,
} from "@/lib/political-office-ui";
import { useEffect, useMemo, useState } from "react";

type OfficeRow = {
  id: string;
  slug: string;
  label: string;
  defaultHeadline: string;
  tier: string;
  branch: string;
  body: string | null;
  seatType: string;
  jurisdictionScope: string;
  sortOrder: number;
};

const officeBadgeClass =
  "inline-flex items-center gap-1 rounded-full border border-line bg-paper2 px-2.5 py-0.5 font-sans text-[10px]";

export function GeoOfficesBrowser() {
  const [offices, setOffices] = useState<OfficeRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/politics/offices");
        const data = (await res.json()) as {
          offices?: OfficeRow[];
          error?: string;
        };
        if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
        if (!cancelled) setOffices(data.offices ?? []);
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof Error
              ? e.message
              : "Failed to load political offices.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const byTier = useMemo(() => {
    const m = new Map<string, OfficeRow[]>();
    for (const o of offices) {
      const k = o.tier;
      const list = m.get(k) ?? [];
      list.push(o);
      m.set(k, list);
    }
    return m;
  }, [offices]);

  const tierOrder = ["federal", "state", "lga"];

  return (
    <div className='mx-auto w-full max-w-3xl px-4 py-10 lg:px-0'>
      <h1 className='font-display text-2xl font-bold text-ink'>
        Political offices
      </h1>
      <p className='mt-3 max-w-2xl text-sm leading-relaxed text-muted'>
        A reference list of public roles in Nigeria. Who they are (president,
        governor, senator, and so on), whether they sit in the executive or
        legislature, and the level of government they belong to.
      </p>
      <GeoTopFederalRoles />
      {error ? (
        <p className='mt-4 text-sm text-flame'>{error}</p>
      ) : loading ? (
        <GeoOfficesBrowserSkeleton />
      ) : (
        <div className='mt-8 flex flex-col gap-10'>
          {tierOrder.map((tier) => {
            const rows = byTier.get(tier);
            if (!rows?.length) return null;
            return (
              <section key={tier}>
                <h2 className='font-display text-lg font-bold capitalize text-ink'>
                  {tier}
                </h2>
                <ul className='mt-3 flex flex-col gap-2'>
                  {rows.map((o) => {
                    const roleLine = [
                      sentenceCasePoliticalOfficePhrase(o.slug),
                      sentenceCasePoliticalOfficePhrase(o.branch),
                      sentenceCasePoliticalOfficePhrase(o.seatType),
                    ].join(" · ");
                    const bodyLabel = o.body
                      ? sentenceCasePoliticalOfficePhrase(o.body)
                      : null;
                    return (
                      <li
                        key={o.id}
                        className='rounded-lg border border-line bg-card px-4 py-3'
                      >
                        <p className='font-sans text-sm font-semibold text-ink'>
                          {o.label}
                        </p>
                        <div className='mt-2 flex flex-wrap gap-2'>
                          <span className={officeBadgeClass}>
                            <span className='font-medium text-muted'>
                              Scope
                            </span>
                            <span className='text-ink'>
                              {formatJurisdictionScopeForUi(
                                o.jurisdictionScope,
                              )}
                            </span>
                          </span>
                          {bodyLabel ? (
                            <span className={officeBadgeClass}>
                              <span className='font-medium text-muted'>
                                Body
                              </span>
                              <span className='text-ink'>{bodyLabel}</span>
                            </span>
                          ) : null}
                        </div>
                        <p className='mt-2 font-sans text-xs leading-relaxed text-muted'>
                          {roleLine}
                        </p>
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
