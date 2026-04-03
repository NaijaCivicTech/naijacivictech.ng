"use client";

import {
  PolitilogAvatar,
  PolitilogPartyBadge,
  PolitilogStars,
} from "@/components/civic/politilog/PolitilogPersonPieces";
import { usePolitilogLocalContext } from "@/hooks/use-politilog-local-context";
import { cn } from "@/lib/cn";
import {
  ALL_POLITICIANS,
  POLITILOG_LGA_OPTIONS,
  POLITILOG_PARTIES,
  PRESIDENT,
  filterPoliticians,
  getLocalSpotlight,
  officeLabel,
  partyFullName,
  type PolitilogPartyFilter,
  type PolitilogPolitician,
  type PolitilogScopeFilter,
} from "@/lib/politilog-data";
import { politilogRateStore } from "@/lib/politilog-rate-store";
import {
  getPrimaryRateableSegmentId,
  getRollupRatingForPolitician,
} from "@/lib/politilog-timeline";
import Link from "next/link";
import { useMemo, useState } from "react";

const btn =
  "inline-flex cursor-pointer items-center gap-1.5 rounded-[5px] border-[1.5px] border-line-strong px-[18px] py-2 font-sans text-[12px] font-medium transition-all";
const chip =
  "cursor-pointer rounded-full border-[1.5px] border-line bg-transparent px-3 py-1.5 font-sans text-[11px] font-medium text-muted transition-all hover:border-ink hover:text-ink";

function PoliticianCard({ p }: { p: PolitilogPolitician }) {
  const profileHref = `/politilog/${p.id}`;
  const rollup = useMemo(() => getRollupRatingForPolitician(p.id), [p.id]);
  const primarySegId = useMemo(() => getPrimaryRateableSegmentId(p.id), [p.id]);

  const textBlock = (
    <>
      <p className='text-[10px] font-semibold uppercase tracking-[0.12em] text-brand'>
        {officeLabel(p.office)}
      </p>
      <h3 className='mt-1 font-display text-[17px] font-bold leading-snug tracking-tight text-ink'>
        <Link
          href={profileHref}
          className='text-ink no-underline transition-opacity hover:opacity-75'
        >
          {p.name}
        </Link>
      </h3>
      <p className='mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-muted'>
        {p.jurisdiction}
      </p>
    </>
  );

  const ratingRow = (
    <div className='flex flex-wrap items-center gap-x-2 gap-y-1'>
      <PolitilogStars value={rollup.count > 0 ? rollup.avg : 0} />
      <span className='font-display text-lg font-bold tabular-nums text-ink'>
        {rollup.count > 0 ? rollup.avg.toFixed(1) : "—"}
      </span>
      <span className='text-[11px] text-muted'>
        {rollup.count > 0
          ? `(${rollup.count.toLocaleString()} across roles)`
          : "(no scores yet)"}
      </span>
    </div>
  );

  return (
    <article className='group relative flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-card shadow-[0_1px_0_rgba(0,0,0,0.03)] transition-[border-color,box-shadow] hover:border-ink/12 hover:shadow-md'>
      <PolitilogPartyBadge
        party={p.party}
        className='absolute end-5 top-5 z-10 text-[9px] sm:text-[10px]'
      />
      <div className='flex flex-1 gap-4 p-5 pe-18'>
        <Link
          href={profileHref}
          className='shrink-0 self-start no-underline'
          aria-label={`Open profile: ${p.name}`}
        >
          <PolitilogAvatar
            seed={p.imageSeed}
            name={p.name}
            size='md'
            imageUrl={p.imageUrl}
          />
        </Link>
        <div className='min-w-0 flex-1 pt-0.5'>{textBlock}</div>
      </div>
      <div className='border-t border-line bg-paper2/60 px-5 py-4'>
        <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4'>
          {ratingRow}
          <button
            type='button'
            disabled={!primarySegId}
            className='inline-flex shrink-0 cursor-pointer items-center justify-center rounded-lg border-[1.5px] border-ink/15 bg-paper px-4 py-2 font-sans text-[12px] font-semibold text-ink transition-colors hover:border-ink/35 hover:bg-card disabled:cursor-not-allowed disabled:opacity-45'
            onClick={() => {
              if (primarySegId) politilogRateStore.open(p.id, primarySegId);
            }}
          >
            Rate current role
          </button>
        </div>
      </div>
    </article>
  );
}

/** President: larger frame; party top-end; community rating + rate. */
function PresidentInfoCard({ p }: { p: PolitilogPolitician }) {
  const rollup = useMemo(() => getRollupRatingForPolitician(p.id), [p.id]);
  const primarySegId = useMemo(() => getPrimaryRateableSegmentId(p.id), [p.id]);

  const ratePrimary = cn(
    btn,
    "w-full max-w-xs justify-center border-ink bg-ink text-paper hover:opacity-90 sm:max-w-none sm:w-auto",
  );

  return (
    <article className='relative w-full rounded-2xl border-[1.5px] border-brand/30 bg-brand-soft/25 px-6 py-7 shadow-sm sm:px-10 sm:py-8'>
      <PolitilogPartyBadge
        party={p.party}
        className='absolute end-6 top-6 z-10 px-3 py-1 text-[11px] sm:end-10 sm:top-8'
      />
      <div className='flex flex-col items-center text-center'>
        <Link
          href={`/politilog/${p.id}`}
          className='no-underline'
          aria-label={`Open profile: ${p.name}`}
        >
          <PolitilogAvatar
            seed={p.imageSeed}
            name={p.name}
            size='xl'
            imageUrl={p.imageUrl}
          />
        </Link>
        <p className='mt-5 text-[10px] font-semibold uppercase tracking-[0.14em] text-brand'>
          {officeLabel(p.office)}
        </p>
        <h3 className='mt-1.5 font-display text-[clamp(1.45rem,3.8vw,1.85rem)] font-extrabold leading-tight tracking-tight text-ink'>
          <Link
            href={`/politilog/${p.id}`}
            className='text-ink no-underline hover:opacity-80'
          >
            {p.name}
          </Link>
        </h3>
        <p className='mt-2 max-w-xl text-sm leading-relaxed text-muted sm:text-[15px]'>
          {p.jurisdiction}
        </p>
      </div>

      <div className='mt-8 border-t border-line/80 pt-6'>
        {/* <p className='text-center text-[10px] font-medium uppercase tracking-wider text-muted'>
          Performance (community)
        </p> */}
        <div className='mt- flex flex-col items-center gap-3 sm:flex-ro sm:flex-wrap sm:justify-center sm:gap-4'>
          <div className='flex flex-wrap items-center justify-center gap-x-2 gap-y-1'>
            <div className='flex flex-col items-center gap-x-2 gap-y-1'>
              <PolitilogStars value={rollup.count > 0 ? rollup.avg : 0} />
              <span className='font-display text-xl font-bold tabular-nums text-ink'>
                {rollup.count > 0 ? rollup.avg.toFixed(1) : "—"}
              </span>
              <span className='text-[12px] text-muted'>
                {rollup.count > 0
                  ? `(${rollup.count.toLocaleString()} ratings)`
                  : "(no scores yet)"}
              </span>
            </div>
          </div>
          <button
            type='button'
            disabled={!primarySegId}
            className={cn(
              ratePrimary,
              "disabled:cursor-not-allowed disabled:opacity-45",
            )}
            onClick={() => {
              if (primarySegId) politilogRateStore.open(p.id, primarySegId);
            }}
          >
            Rate current role
          </button>
        </div>
      </div>
    </article>
  );
}

function InsightCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className='rounded-xl border-[1.5px] border-line bg-paper2/80 p-4'>
      <p className='text-[10px] font-semibold uppercase tracking-widest text-muted'>
        {label}
      </p>
      <p className='mt-2 font-display text-2xl font-bold tabular-nums text-ink'>
        {value}
      </p>
      <p className='mt-1 text-xs leading-snug text-muted'>{hint}</p>
    </div>
  );
}

export function PolitilogBoard() {
  const { localContext, setLocalContext, clearLocalContext } =
    usePolitilogLocalContext();
  const [party, setParty] = useState<PolitilogPartyFilter>("all");
  const [scope, setScope] = useState<PolitilogScopeFilter>("all");
  const [locationOpen, setLocationOpen] = useState(false);
  const [pickState, setPickState] = useState("");
  const [pickLga, setPickLga] = useState("");

  const locals = useMemo(
    () => (localContext ? getLocalSpotlight(localContext.key) : []),
    [localContext],
  );

  const filtered = useMemo(
    () =>
      filterPoliticians(ALL_POLITICIANS, {
        party,
        scope,
        lgaKey: localContext?.key ?? null,
        stateName: localContext?.state ?? null,
      }),
    [party, scope, localContext],
  );

  /** Browse grid excludes the President (shown above). */
  const browseRows = useMemo(
    () => filtered.filter((p) => p.id !== PRESIDENT.id),
    [filtered],
  );

  const directorySnapshot = useMemo(() => {
    const total = ALL_POLITICIANS.length;
    const inLga = localContext
      ? ALL_POLITICIANS.filter((p) => p.lgaKey === localContext.key).length
      : null;
    const partyLabels = POLITILOG_PARTIES.filter((x) => x !== "all");
    return {
      total,
      inLga,
      partyCount: partyLabels.length,
    };
  }, [localContext]);

  const states = useMemo(
    () => [...new Set(POLITILOG_LGA_OPTIONS.map((o) => o.state))].sort(),
    [],
  );

  const lgasForState = useMemo(
    () => POLITILOG_LGA_OPTIONS.filter((o) => o.state === pickState),
    [pickState],
  );

  return (
    <div className='flex w-full flex-col gap-10'>
      {/* Intro + location */}
      <div className='flex flex-col gap-6 border-b border-line pb-6'>
        <div className='flex flex-wrap items-start justify-between gap-12'>
          <div>
            <p className='flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.15em] text-brand'>
              <span className='h-px w-5 bg-brand' aria-hidden />
              PolitiLog NG
            </p>

            <h1 className='font-display text-[clamp(26px,4vw,36px)] font-extrabold tracking-tight text-ink'>
              Political ledger
            </h1>
            <p className='mt-2 max-w-xl text-sm leading-relaxed text-muted'>
              Office, jurisdiction, and party for public roles we track.
            </p>
          </div>
          <div className='flex flex-col items-stretch gap-2 sm:items-end'>
            {localContext ? (
              <div className='flex flex-wrap items-center gap-2'>
                <span className='rounded-full border border-brand/30 bg-brand-soft px-3 py-1.5 text-xs font-medium text-ink'>
                  {localContext.lga}, {localContext.state}
                </span>
                <button
                  type='button'
                  className={cn(chip, "border-dashed")}
                  onClick={() => {
                    setPickState(localContext.state);
                    setPickLga(localContext.lga);
                    setLocationOpen(true);
                  }}
                >
                  Change LGA
                </button>
                <button
                  type='button'
                  className={cn(
                    chip,
                    "text-flame hover:border-flame hover:text-flame",
                  )}
                  onClick={() => clearLocalContext()}
                >
                  Clear
                </button>
              </div>
            ) : (
              <button
                type='button'
                className={cn(
                  btn,
                  "border-brand bg-brand-soft text-ink hover:bg-brand-soft/80",
                )}
                onClick={() => {
                  setPickState(states[0] ?? "");
                  setPickLga("");
                  setLocationOpen(true);
                }}
              >
                Set my LGA
              </button>
            )}
          </div>
          {/* <Link
              href='/politilog/my-ratings'
              className='font-sans text-[13px] font-semibold text-brand underline-offset-2 hover:underline'
            >
              View my ratings →
            </Link> */}
        </div>

        {locationOpen ? (
          <div
            className='rounded-xl border border-line bg-card p-4 shadow-sm'
            role='region'
            aria-label='Choose local government'
          >
            <p className='mb-2 text-sm font-medium text-ink'>
              Choose state and local government area
            </p>
            <div className='mb-4 space-y-2.5 text-xs leading-relaxed text-muted'>
              <p>
                Each profile lists office, jurisdiction, and party. The
                President stays at the top for everyone.
              </p>
              <p>
                When you save your LGA, we surface local chairpersons,
                councillors, and representatives in{" "}
                <span className='font-medium text-ink/80'>In focus</span> and
                turn on{" "}
                <span className='font-medium text-ink/80'>My state</span> and{" "}
                <span className='font-medium text-ink/80'>My LGA</span> in the
                directory filters below.
              </p>
              <p className='text-muted/90'>
                The LGA list here grows as we expand national coverage.
              </p>
            </div>
            <div className='flex flex-wrap gap-3'>
              <label className='flex flex-col gap-1 text-xs font-medium text-muted'>
                State
                <select
                  className='min-w-[160px] cursor-pointer rounded-md border-[1.5px] border-line bg-paper px-2.5 py-2 font-sans text-sm text-ink outline-none focus:border-brand'
                  value={pickState}
                  onChange={(e) => {
                    setPickState(e.target.value);
                    setPickLga("");
                  }}
                >
                  <option value=''>Select…</option>
                  {states.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>
              <label className='flex flex-col gap-1 text-xs font-medium text-muted'>
                LGA
                <select
                  className='min-w-[180px] cursor-pointer rounded-md border-[1.5px] border-line bg-paper px-2.5 py-2 font-sans text-sm text-ink outline-none focus:border-brand'
                  value={pickLga}
                  onChange={(e) => setPickLga(e.target.value)}
                  disabled={!pickState}
                >
                  <option value=''>Select…</option>
                  {lgasForState.map((o) => (
                    <option key={o.key} value={o.lga}>
                      {o.lga}
                    </option>
                  ))}
                </select>
              </label>
              <div className='flex flex-wrap items-end gap-2'>
                <button
                  type='button'
                  className={cn(btn, "bg-ink text-paper hover:opacity-90")}
                  disabled={!pickState || !pickLga}
                  onClick={() => {
                    const row = POLITILOG_LGA_OPTIONS.find(
                      (o) => o.state === pickState && o.lga === pickLga,
                    );
                    if (row) {
                      setLocalContext({
                        state: row.state,
                        lga: row.lga,
                        key: row.key,
                      });
                      setLocationOpen(false);
                    }
                  }}
                >
                  Save
                </button>
                <button
                  type='button'
                  className={cn(btn, "bg-transparent hover:border-ink")}
                  onClick={() => setLocationOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* President + local spotlight */}
      <section aria-labelledby='politilog-featured-heading'>
        <h2 id='politilog-featured-heading' className='sr-only'>
          In focus
        </h2>
        <div className='flex flex-col gap-4'>
          <PresidentInfoCard p={PRESIDENT} />
          {localContext && locals.length > 0 ? (
            <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
              {locals.map((p) => (
                <PoliticianCard key={p.id} p={p} />
              ))}
            </div>
          ) : null}
        </div>
      </section>

      {/* Directory snapshot — counts only */}
      <section aria-labelledby='politilog-insights-heading'>
        <h2
          id='politilog-insights-heading'
          className='mb-4 font-display text-lg font-bold text-ink'
        >
          Directory snapshot
        </h2>
        <p className='mb-4 text-sm text-muted'>
          Numbers from the profiles we currently list—no scores or votes.
        </p>
        <div className='grid gap-4 sm:grid-cols-3'>
          <InsightCard
            label='Profiles in ledger'
            value={String(directorySnapshot.total)}
            hint='Total officeholders in this release of the directory.'
          />
          <InsightCard
            label='In your LGA'
            value={
              directorySnapshot.inLga != null
                ? String(directorySnapshot.inLga)
                : "—"
            }
            hint={
              localContext
                ? `Rows tagged to ${localContext.lga}.`
                : "Set your LGA to see how many entries match your area."
            }
          />
          <InsightCard
            label='Party filters'
            value={String(directorySnapshot.partyCount)}
            hint='Major parties available in the party filter chips.'
          />
        </div>
      </section>

      {/* Filters + directory */}
      <section
        id='politilog-browse'
        className='scroll-mt-28'
        aria-labelledby='politilog-browse-heading'
      >
        <h2
          id='politilog-browse-heading'
          className='mb-2 font-display text-lg font-bold text-ink'
        >
          Browse politicians
        </h2>
        <p className='mb-6 text-sm text-muted'>
          Filter by scope and party. Use <strong>My LGA</strong> or{" "}
          <strong>My state</strong> after setting your LGA above.
        </p>

        <div className='mb-4'>
          <p className='mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted'>
            Scope
          </p>
          <div className='flex flex-wrap gap-2'>
            {(
              [
                ["all", "All politicians"],
                ["national", "National / federal"],
                ["state", "My state"],
                ["lga", "My LGA"],
              ] as const
            ).map(([key, label]) => {
              const disabled =
                (key === "state" || key === "lga") && !localContext;
              return (
                <button
                  key={key}
                  type='button'
                  disabled={disabled}
                  className={cn(
                    chip,
                    scope === key &&
                      "border-ink bg-ink text-paper hover:text-paper",
                    disabled &&
                      "cursor-not-allowed opacity-45 hover:border-line hover:text-muted",
                  )}
                  onClick={() => setScope(key)}
                  title={
                    disabled
                      ? "Set your LGA to enable state and LGA filters"
                      : undefined
                  }
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <div className='mb-8'>
          <p className='mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted'>
            Party
          </p>
          <div className='flex flex-wrap gap-2'>
            {POLITILOG_PARTIES.map((p) => (
              <button
                key={p}
                type='button'
                className={cn(
                  chip,
                  party === p &&
                    "border-ink bg-ink text-paper hover:text-paper",
                )}
                title={p === "all" ? "Show every party" : partyFullName(p)}
                onClick={() => setParty(p)}
              >
                {p === "all" ? "All parties" : p}
              </button>
            ))}
          </div>
        </div>

        <div className='grid items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-3'>
          {browseRows.map((p) => (
            <PoliticianCard key={p.id} p={p} />
          ))}
        </div>
        {browseRows.length === 0 ? (
          <p className='rounded-lg border border-line bg-paper2 px-4 py-6 text-center text-sm text-muted'>
            No officeholders match these filters. Try a wider scope or another
            party.
          </p>
        ) : null}
      </section>
    </div>
  );
}
