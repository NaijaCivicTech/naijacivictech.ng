"use client";

import {
  PolitilogPartyBadge,
  PolitilogStars,
} from "@/components/civic/politilog/PolitilogPersonPieces";
import { cn } from "@/lib/cn";
import { politilogRateStore } from "@/lib/politilog-rate-store";
import {
  getSegmentRatingsListModel,
  type SegmentRatingListItem,
} from "@/lib/politilog-segment-ratings-display";
import {
  filterTimelineByMode,
  isPoliticalSegment,
  isRateableSegment,
  segmentTypeLabel,
  type PolitilogSegmentType,
  type PolitilogTimelineSegment,
} from "@/lib/politilog-timeline";
import { ChevronsUpDown } from "lucide-react";
import { useMemo, useState, useSyncExternalStore } from "react";

function looksLikeHttpUrl(s: string): boolean {
  return /^https?:\/\//i.test(s.trim());
}

function formatSubmittedShort(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

/** Custom chevron so padding controls spacing; native arrows ignore inset. */
const TIMELINE_SELECT_CHEVRON =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%237a7468' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")";

function typeAccent(type: PolitilogSegmentType): string {
  switch (type) {
    case "political_office":
    case "appointment":
      return "bg-brand";
    case "education":
      return "bg-civic-blue";
    case "employment":
      return "bg-muted";
    case "business":
      return "bg-sun";
    case "civil_society":
      return "bg-flame";
    default:
      return "bg-ink/25";
  }
}

function typeBorderLeft(type: PolitilogSegmentType): string {
  switch (type) {
    case "political_office":
    case "appointment":
      return "border-l-brand hover:border-l-brand/80";
    case "education":
      return "border-l-civic-blue hover:border-l-civic-blue/80";
    case "employment":
      return "border-l-muted hover:border-l-muted/80";
    case "business":
      return "border-l-sun hover:border-l-sun/80";
    case "civil_society":
      return "border-l-flame hover:border-l-flame/80";
    default:
      return "border-l-ink/20 hover:border-l-ink/30";
  }
}

function typeSoftBg(type: PolitilogSegmentType): string {
  switch (type) {
    case "political_office":
    case "appointment":
      return "bg-brand-soft/80";
    case "education":
      return "bg-civic-blue-soft/90";
    case "employment":
      return "bg-paper2";
    case "business":
      return "bg-sun-soft/80";
    case "civil_society":
      return "bg-flame-soft/70";
    default:
      return "bg-paper2";
  }
}

function SegmentRatingEntry({ item }: { item: SegmentRatingListItem }) {
  const badge =
    item.origin === "you"
      ? null
      : item.origin === "seed"
        ? "Community"
        : "Community (sample)";

  return (
    <article
      className='border-b border-line/70 py-4 last:border-b-0 last:pb-0 first:pt-0'
      aria-label={`Rating by ${item.authorLabel}`}
    >
      <div className='flex flex-wrap items-start justify-between gap-2'>
        <div className='min-w-0'>
          <p className='font-sans text-[11px] font-semibold text-ink'>
            {item.authorLabel}
          </p>
          {badge ? (
            <p className='mt-0.5 text-[10px] font-medium uppercase tracking-wider text-muted'>
              {badge}
            </p>
          ) : (
            <p className='mt-0.5 text-[10px] font-medium uppercase tracking-wider text-muted'>
              Your rating
            </p>
          )}
        </div>
        <div className='flex shrink-0 flex-wrap items-center gap-2'>
          <PolitilogStars value={item.stars} />
          <span className='text-[13px] font-bold tabular-nums text-ink'>
            {item.stars} / 5
          </span>
        </div>
      </div>
      <p className='mt-1 font-sans text-[11px] tabular-nums text-muted'>
        {formatSubmittedShort(item.submittedAt)}
      </p>
      {item.note ? (
        <p className='mt-2 border-s-2 border-brand/25 ps-2.5 text-[13px] leading-relaxed text-ink/90'>
          {item.note}
        </p>
      ) : null}
      {item.sources.length > 0 ? (
        <div className='mt-2'>
          <p className='text-[10px] font-bold uppercase tracking-wider text-muted'>
            Sources
          </p>
          <ul className='mt-1 flex list-none flex-col gap-1 ps-0'>
            {item.sources.map((src, i) => (
              <li key={i}>
                {looksLikeHttpUrl(src) ? (
                  <a
                    href={src.trim()}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='break-all text-[12px] font-medium text-brand underline-offset-2 hover:underline'
                  >
                    {src.trim()}
                  </a>
                ) : (
                  <span className='text-[12px] text-ink/85'>{src}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {item.mediaUrl?.trim() ? (
        <div className='mt-2'>
          <p className='text-[10px] font-bold uppercase tracking-wider text-muted'>
            Video / media
          </p>
          <a
            href={item.mediaUrl.trim()}
            target='_blank'
            rel='noopener noreferrer'
            className='mt-1 inline-block break-all text-[12px] font-medium text-brand underline-offset-2 hover:underline'
          >
            {item.mediaUrl.trim()}
          </a>
        </div>
      ) : null}
      {item.imageDataUrl ? (
        <div className='mt-2'>
          <p className='text-[10px] font-bold uppercase tracking-wider text-muted'>
            Photo
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element -- stored data URL */}
          <img
            src={item.imageDataUrl}
            alt=''
            className='mt-2 max-h-36 max-w-full rounded-lg border border-line object-contain'
          />
        </div>
      ) : null}
    </article>
  );
}

function SegmentCard({
  politicianId,
  segment: s,
  index,
}: {
  politicianId: string;
  segment: PolitilogTimelineSegment;
  index: number;
}) {
  useSyncExternalStore(
    politilogRateStore.subscribe,
    politilogRateStore.getSnapshot,
    politilogRateStore.getServerSnapshot,
  );

  const range =
    s.endYear === null
      ? `${s.startYear} — present`
      : s.startYear === s.endYear
        ? `${s.startYear}`
        : `${s.startYear} — ${s.endYear}`;

  const rateable = isRateableSegment(s);
  const ratingsModel = rateable
    ? getSegmentRatingsListModel(politicianId, s)
    : null;
  const hasCommunity =
    rateable &&
    typeof s.ratingAvg === "number" &&
    typeof s.ratingCount === "number" &&
    s.ratingCount > 0;
  const minePresent = Boolean(
    ratingsModel?.items.some((i) => i.origin === "you"),
  );

  return (
    <li
      className='animate-politilog-rise relative'
      style={{ animationDelay: `${Math.min(index, 12) * 55}ms` }}
    >
      <div
        className={cn(
          "relative rounded-2xl border border-line/80 hover:border-line/90 border-l-[5px] p-4 shadow-[0_1px_0_rgb(0_0_0/0.04)] transition-[transform,box-shadow] duration-300", // hover:-translate-y-0.5 hover:shadow-md
          typeSoftBg(s.type),
          typeBorderLeft(s.type),
        )}
      >
        <div className='flex flex-wrap items-start justify-between gap-3'>
          <div className='min-w-0 flex-1'>
            <div className='flex flex-wrap items-center gap-2'>
              <span
                className={cn(
                  "inline-flex rounded-md px-2 py-0.5 font-sans text-[10px] font-bold uppercase tracking-wider text-paper",
                  typeAccent(s.type),
                )}
              >
                {segmentTypeLabel(s.type)}
              </span>
              {s.party ? (
                <PolitilogPartyBadge party={s.party} className='text-[9px]' />
              ) : s.partyFreeText ? (
                <span
                  className='inline-flex rounded-full border border-line bg-card px-2.5 py-0.5 font-sans text-[9px] font-semibold text-muted'
                  title='Party label for that period (may differ from current INEC acronym)'
                >
                  {s.partyFreeText}
                </span>
              ) : null}
            </div>
            <h3 className='mt-2 font-display text-lg font-bold leading-snug tracking-tight text-ink'>
              {s.title}
            </h3>
            {s.organization ? (
              <p className='mt-1 font-sans text-[13px] font-medium text-ink/85'>
                {s.organization}
              </p>
            ) : null}
            {s.jurisdiction ? (
              <p className='mt-1.5 text-[12px] text-muted'>{s.jurisdiction}</p>
            ) : null}
            {s.sourceLabel ? (
              <p className='mt-2 border-s-2 border-brand/35 ps-2.5 text-[11px] leading-relaxed text-muted'>
                <span className='font-semibold text-ink/70'>Source: </span>
                {s.sourceLabel}
              </p>
            ) : null}
          </div>
          <time
            className='shrink-0 rounded-lg border border-line-strong bg-card px-3 py-1.5 font-sans text-[13px] font-semibold tabular-nums tracking-wide text-ink'
            dateTime={`${s.startYear}`}
          >
            {range}
          </time>
        </div>

        {rateable ? (
          <div className='mt-4 flex w-full min-w-0 flex-col gap-3 border-t border-line/60 pt-4'>
            <div className='flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between'>
              <div className='min-w-0 space-y-1'>
                {hasCommunity ? (
                  <div className='flex flex-wrap items-center gap-x-2 gap-y-1'>
                    <PolitilogStars value={s.ratingAvg!} />
                    <span className='text-[13px] font-bold tabular-nums text-ink'>
                      {s.ratingAvg!.toFixed(1)}
                    </span>
                  </div>
                ) : (
                  <p className='text-[11px] text-muted'>
                    No community score yet.
                  </p>
                )}
              </div>
              <button
                type='button'
                className='text-xs text-ink hover:text-ink/80'
                // className='inline-flex w-full shrink-0 cursor-pointer items-center justify-center rounded-lg border-[1.5px] border-ink/15 bg-paper px-4 py-2 font-sans text-[12px] font-semibold text-ink transition-colors hover:border-ink/35 hover:bg-card sm:w-auto'
                onClick={() => politilogRateStore.open(politicianId, s.id)}
              >
                {minePresent ? "Update rating" : "Rate this role"}
              </button>
            </div>
            {ratingsModel && ratingsModel.items.length > 0 ? (
              <details className='group w-full min-w-0 rounded-xl border border-line bg-card/90 text-start shadow-sm'>
                <summary className='flex w-full cursor-pointer list-none flex-wrap items-center justify-between gap-x-3 gap-y-1.5 rounded-xl px-3 py-2.5 font-sans text-[12px] text-ink marker:hidden [&::-webkit-details-marker]:hidden'>
                  <span className='min-w-0 font-semibold text-ink'>
                    All ratings
                    <span className='ms-1 font-normal text-muted'>
                      · {s.ratingCount!.toLocaleString()} ratings
                    </span>
                  </span>
                  <span
                    className='inline-flex shrink-0 items-center justify-center text-brand transition-transform duration-200 ease-out group-open:rotate-180'
                    aria-hidden
                  >
                    <ChevronsUpDown className='size-4.5' strokeWidth={2.25} />
                  </span>
                </summary>
                <div className='w-full border-t border-line/80'>
                  <div className='max-h-[min(50vh,22rem)] w-full overflow-y-auto overscroll-y-contain px-3 pt-1 pb-3 [-webkit-overflow-scrolling:touch]'>
                    {ratingsModel.communityIsSample &&
                    ratingsModel.listedCommunityCount > 0 ? (
                      <p className='mb-2 border-b border-line/60 pb-2 text-[11px] leading-relaxed text-muted'>
                        Showing{" "}
                        {ratingsModel.listedCommunityCount.toLocaleString()}{" "}
                        illustrative voices that match the aggregate above.
                        Account-backed identities and a full feed ship later.
                      </p>
                    ) : null}
                    {ratingsModel.items.map((item) => (
                      <SegmentRatingEntry key={item.id} item={item} />
                    ))}
                  </div>
                </div>
              </details>
            ) : null}
          </div>
        ) : null}
      </div>
    </li>
  );
}

export function PolitilogProfileTimeline({
  politicianId,
  segments,
  className,
}: {
  politicianId: string;
  segments: PolitilogTimelineSegment[];
  className?: string;
}) {
  const [mode, setMode] = useState<"political" | "full">("political");

  const visible = useMemo(
    () => filterTimelineByMode(segments, mode),
    [segments, mode],
  );

  const politicalCount = useMemo(
    () => segments.filter(isPoliticalSegment).length,
    [segments],
  );

  const selectCls = cn(
    "min-w-0 max-sm:w-full cursor-pointer appearance-none rounded-lg border-[1.5px] border-line-strong bg-card py-2.5 ps-3 pe-12 font-sans text-[13px] font-medium text-ink shadow-sm outline-none transition-colors focus:border-brand",
    "bg-[length:1rem_1rem] bg-[position:right_14px_center] bg-no-repeat sm:min-w-[220px]",
  );

  return (
    <section className={cn(className)} aria-labelledby='politilog-timeline-h'>
      <div className='flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between'>
        <div>
          <h2
            id='politilog-timeline-h'
            className='font-display text-2xl font-extrabold tracking-tight text-ink'
          >
            Career timeline
          </h2>
          <p className='mt-1 max-w-xl text-[13px] leading-relaxed text-muted'>
            Newest entries at the bottom, oldest at the top. Filter by view
            specific to your interests.
          </p>
        </div>
        <div className='flex flex-col gap-1.5 sm:items-end'>
          <label
            htmlFor='politilog-timeline-mode'
            className='font-sans text-[10px] font-bold uppercase tracking-wider text-muted max-sm:sr-only'
          >
            Timeline view
          </label>
          <select
            id='politilog-timeline-mode'
            className={selectCls}
            style={{ backgroundImage: TIMELINE_SELECT_CHEVRON }}
            value={mode}
            onChange={(e) => setMode(e.target.value as "political" | "full")}
          >
            <option value='full'>Full career ({segments.length})</option>
            <option value='political'>Political ({politicalCount})</option>
          </select>
        </div>
      </div>

      {segments.length === 0 ? (
        <p className='mt-8 rounded-2xl border border-dashed border-line bg-paper2/50 px-6 py-10 text-center text-sm text-muted'>
          No timeline entries yet. When people propose updates and they pass
          review, they&apos;ll show up here.
        </p>
      ) : (
        <div className='relative mt-10'>
          <ul className='relative flex flex-col gap-6 md:gap-7'>
            {visible.length === 0 ? (
              <li className='rounded-2xl border border-line bg-card px-5 py-8 text-center text-sm text-muted'>
                No segments in this view. Switch to{" "}
                <button
                  type='button'
                  className='font-semibold text-brand underline-offset-2 hover:underline'
                  onClick={() => setMode("full")}
                >
                  Full career
                </button>{" "}
                to see education and work history.
              </li>
            ) : (
              visible.map((s, i) => (
                <SegmentCard
                  key={s.id}
                  politicianId={politicianId}
                  segment={s}
                  index={i}
                />
              ))
            )}
          </ul>
        </div>
      )}
    </section>
  );
}
