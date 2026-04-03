"use client";

import { PolitilogStars } from "@/components/civic/politilog/PolitilogPersonPieces";
import { cn } from "@/lib/cn";
import { getPoliticianById } from "@/lib/politilog-data";
import { politilogRateStore } from "@/lib/politilog-rate-store";
import {
  POLITILOG_SEGMENT_RATINGS_STORAGE_KEY,
  listAllMySegmentRatings,
} from "@/lib/politilog-ratings-storage";
import { getSegmentById } from "@/lib/politilog-timeline";
import Link from "next/link";
import { useEffect, useState } from "react";

function looksLikeHttpUrl(s: string): boolean {
  return /^https?:\/\//i.test(s.trim());
}

function formatSubmitted(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

function segmentSubtitle(
  politicianId: string,
  segmentId: string,
): { title: string; detail: string } | null {
  const seg = getSegmentById(politicianId, segmentId);
  if (!seg) return null;
  const range =
    seg.endYear === null
      ? `${seg.startYear} — present`
      : seg.startYear === seg.endYear
        ? `${seg.startYear}`
        : `${seg.startYear} — ${seg.endYear}`;
  const org = seg.organization ? ` · ${seg.organization}` : "";
  return { title: seg.title + org, detail: range };
}

export function PolitilogMyRatingsView() {
  const [, setRefresh] = useState(0);

  useEffect(() => {
    const unsub = politilogRateStore.subscribe(() => {
      if (!politilogRateStore.getSnapshot().open) {
        setRefresh((x) => x + 1);
      }
    });
    const onStorage = (e: StorageEvent) => {
      if (e.key === POLITILOG_SEGMENT_RATINGS_STORAGE_KEY) {
        setRefresh((x) => x + 1);
      }
    };
    window.addEventListener("storage", onStorage);
    const onFocus = () => setRefresh((x) => x + 1);
    window.addEventListener("focus", onFocus);
    return () => {
      unsub();
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  const entries = listAllMySegmentRatings();

  return (
    <div className='mx-auto max-w-[800px]'>
      <p className='mb-6'>
        <Link
          href='/politilog'
          className='group inline-flex items-center gap-1.5 font-sans text-[13px] font-semibold text-brand no-underline transition-colors hover:text-ink'
        >
          <span
            className='inline-block transition-transform group-hover:-translate-x-0.5'
            aria-hidden
          >
            ←
          </span>
          PolitiLog directory
        </Link>
      </p>

      <header className='mb-10'>
        <p className='mb-2 text-[10px] font-medium uppercase tracking-[0.15em] text-brand'>
          PolitiLog
        </p>
        <h1 className='font-display text-[clamp(1.5rem,4vw,2rem)] font-extrabold tracking-tight text-ink'>
          My ratings
        </h1>
        <p className='mt-2 max-w-xl text-sm leading-relaxed text-muted'>
          Every role you&apos;ve scored is listed here.
        </p>
      </header>

      {entries.length === 0 ? (
        <div className='rounded-2xl border border-dashed border-line bg-paper2/50 px-6 py-14 text-center'>
          <p className='text-sm text-muted'>
            You haven&apos;t submitted any ratings yet. Open a profile and use{" "}
            <span className='font-semibold text-ink'>Rate this role</span> on the
            timeline or{" "}
            <span className='font-semibold text-ink'>Rate current role</span>{" "}
            from the directory.
          </p>
          <Link
            href='/politilog'
            className='mt-5 inline-flex font-sans text-[13px] font-bold text-brand underline-offset-2 hover:underline'
          >
            Browse officeholders →
          </Link>
        </div>
      ) : (
        <ul className='flex flex-col gap-5'>
          {entries.map(({ politicianId, segmentId, rating: r }) => {
            const p = getPoliticianById(politicianId);
            const segInfo = segmentSubtitle(politicianId, segmentId);
            const profileHref = `/politilog/${politicianId}`;

            return (
              <li
                key={`${politicianId}::${segmentId}`}
                className='rounded-2xl border border-line bg-card p-5 shadow-sm sm:p-6'
              >
                <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
                  <div className='min-w-0 flex-1'>
                    <p className='font-sans text-[11px] font-semibold uppercase tracking-wider text-muted'>
                      {formatSubmitted(r.submittedAt)}
                    </p>
                    <h2 className='mt-1 font-display text-lg font-bold text-ink'>
                      <Link
                        href={profileHref}
                        className='text-ink no-underline hover:underline'
                      >
                        {p?.name ?? politicianId}
                      </Link>
                    </h2>
                    {segInfo ? (
                      <p className='mt-1 text-[13px] font-medium text-ink/85'>
                        {segInfo.title}
                      </p>
                    ) : (
                      <p className='mt-1 font-mono text-[12px] text-muted'>
                        Segment {segmentId}
                      </p>
                    )}
                    {segInfo ? (
                      <p className='mt-0.5 font-sans text-xs tabular-nums text-muted'>
                        {segInfo.detail}
                      </p>
                    ) : null}
                  </div>
                  <div className='flex shrink-0 flex-wrap items-center gap-2 rounded-xl border border-line bg-paper/80 px-3 py-2'>
                    <PolitilogStars value={r.stars} />
                    <span className='text-[15px] font-bold tabular-nums text-ink'>
                      {r.stars} / 5
                    </span>
                  </div>
                </div>

                {r.note ? (
                  <p className='mt-4 border-s-2 border-brand/30 ps-3 text-[13px] leading-relaxed text-ink/90'>
                    {r.note}
                  </p>
                ) : null}

                {(r.sources?.length || r.mediaUrl || r.imageDataUrl) ? (
                  <div className='mt-4 flex flex-col gap-3 border-t border-line/80 pt-4'>
                    {r.sources && r.sources.length > 0 ? (
                      <div>
                        <p className='text-[10px] font-bold uppercase tracking-wider text-muted'>
                          Sources
                        </p>
                        <ul className='mt-1.5 flex list-none flex-col gap-2 ps-0'>
                          {r.sources.map((src, i) => (
                            <li key={i}>
                              {looksLikeHttpUrl(src) ? (
                                <a
                                  href={src.trim()}
                                  target='_blank'
                                  rel='noopener noreferrer'
                                  className='inline-block break-all text-[13px] font-medium text-brand underline-offset-2 hover:underline'
                                >
                                  {src.trim()}
                                </a>
                              ) : (
                                <p className='text-[13px] text-ink/90'>
                                  {src}
                                </p>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                    {r.mediaUrl ? (
                      <div>
                        <p className='text-[10px] font-bold uppercase tracking-wider text-muted'>
                          Video / media link
                        </p>
                        <a
                          href={r.mediaUrl.trim()}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='mt-1 inline-block break-all text-[13px] font-medium text-brand underline-offset-2 hover:underline'
                        >
                          {r.mediaUrl.trim()}
                        </a>
                      </div>
                    ) : null}
                    {r.imageDataUrl ? (
                      <div>
                        <p className='text-[10px] font-bold uppercase tracking-wider text-muted'>
                          Photo
                        </p>
                        {/* eslint-disable-next-line @next/next/no-img-element -- stored data URL */}
                        <img
                          src={r.imageDataUrl}
                          alt=''
                          className={cn(
                            "mt-2 max-h-48 max-w-full rounded-lg border border-line object-contain",
                          )}
                        />
                      </div>
                    ) : null}
                  </div>
                ) : null}

                <p className='mt-4'>
                  <Link
                    href={profileHref}
                    className='font-sans text-[12px] font-semibold text-brand underline-offset-2 hover:underline'
                  >
                    Open profile →
                  </Link>
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
