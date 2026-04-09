"use client";

import {
  PolitilogAvatar,
  PolitilogPartyBadge,
  PolitilogStars,
} from "@/features/politilog/components/PolitilogPersonPieces";
import { usePolitilogLocalContext } from "@/features/politilog/hooks/use-politilog-local-context";
import {
  ALL_POLITICIANS,
  POLITILOG_LGA_OPTIONS,
  POLITILOG_PARTIES,
  PRESIDENT,
  SENATE_PRESIDENT,
  VICE_PRESIDENT,
  filterPoliticians,
  getLocalSpotlight,
  officeLabel,
  partyFullName,
  type PolitilogPartyFilter,
  type PolitilogPolitician,
  type PolitilogScopeFilter,
} from "@/features/politilog/lib/politilog-data";
import { politilogRateStore } from "@/features/politilog/lib/politilog-rate-store";
import {
  getPrimaryRateableSegmentId,
  getRollupRatingForPolitician,
} from "@/features/politilog/lib/politilog-timeline";
import { lockBodyScroll, unlockBodyScroll } from "@/lib/body-scroll-lock";
import { cn } from "@/lib/cn";
import {
  clearMyResidence,
  fetchMyResidence,
  saveMyResidence,
} from "@/lib/services/client/me-residence";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useCallback, useEffect, useId, useMemo, useState } from "react";

const btn =
  "inline-flex cursor-pointer items-center gap-1.5 rounded-[5px] border-[1.5px] border-line-strong px-[18px] py-2 font-sans text-[12px] font-medium transition-all";
const chip =
  "cursor-pointer rounded-full border-[1.5px] border-line bg-transparent px-3 py-1.5 font-sans text-[11px] font-medium text-muted transition-all hover:border-ink hover:text-ink";

/** Centered hero card for the President only (legacy PolitiLog spotlight). */
function PresidentSpotlightCard({ p }: { p: PolitilogPolitician }) {
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
        <div className='flex flex-col items-center gap-3 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-4'>
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

/** Compact ledger row: VP, Senate President, browse grid, and local spotlight. */
function PolitilogLedgerCard({
  p,
  className,
  badgeUnderPhoto = false,
}: {
  p: PolitilogPolitician;
  className?: string;
  badgeUnderPhoto?: boolean;
}) {
  const rollup = useMemo(() => getRollupRatingForPolitician(p.id), [p.id]);
  const primarySegId = useMemo(() => getPrimaryRateableSegmentId(p.id), [p.id]);

  const rateCompact = cn(
    btn,
    "shrink-0 border-ink/90 bg-ink px-3 py-2 text-[11px] font-semibold text-paper hover:opacity-90",
  );

  return (
    <article
      className={cn(
        "relative h-full overflow-hidden rounded-xl border border-line bg-card shadow-[0_1px_0_rgb(13_13_11/0.04)] transition-[border-color,box-shadow] hover:border-ink/12",
        "ps-4 pe-4 py-4 sm:ps-5 sm:pe-5",
        className,
      )}
    >
      {/* <span
        className='absolute inset-y-3 inset-s-0 w-px rounded-full bg-brand/50'
        aria-hidden
      /> */}

      <div className='relative flex h-full min-h-0 flex-col gap-3 sm:gap-3.5'>
        <div className='flex gap-3 sm:gap-4'>
          <Link
            href={`/politilog/${p.id}`}
            className='shrink-0 self-start no-underline flex flex-col items-center gap-2'
            aria-label={`Open profile: ${p.name}`}
          >
            <PolitilogAvatar
              seed={p.imageSeed}
              name={p.name}
              size='md'
              imageUrl={p.imageUrl}
            />

            {badgeUnderPhoto && (
              <PolitilogPartyBadge
                party={p.party}
                className='px-2 py-0.5 text-[9px]'
              />
            )}
          </Link>
          <div className='min-w-0 flex-1 pt-0.5'>
            <div className='flex flex-wrap items-center justify-between gap-x-2 gap-y-1'>
              <p className='text-[10px] font-semibold uppercase tracking-[0.12em] text-muted'>
                {officeLabel(p.office)}
              </p>
              {!badgeUnderPhoto && (
                <PolitilogPartyBadge
                  party={p.party}
                  className='px-2 py-0.5 text-[9px]'
                />
              )}
            </div>
            <h3 className='mt-1.5 font-sans text-[1.0625rem] font-bold leading-snug tracking-tight text-ink sm:text-lg'>
              <Link
                href={`/politilog/${p.id}`}
                className='text-ink no-underline transition-opacity hover:opacity-75'
              >
                {p.name}
              </Link>
            </h3>
            <p className='mt-1 text-xs leading-snug text-muted'>
              {p.jurisdiction}
            </p>
          </div>
        </div>

        <div className='mt-auto flex flex-col gap-2.5 border-t border-line pt-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3'>
          <div className='flex flex-wrap items-center gap-x-2 gap-y-1'>
            <PolitilogStars value={rollup.count > 0 ? rollup.avg : 0} />
            <span className='font-sans text-sm font-bold tabular-nums text-ink'>
              {rollup.count > 0 ? rollup.avg.toFixed(1) : "—"}
            </span>
            <span className='text-[11px] text-muted'>
              {rollup.count > 0
                ? `${rollup.count.toLocaleString()} ratings`
                : "No scores yet"}
            </span>
          </div>
          <button
            type='button'
            disabled={!primarySegId}
            className={cn(
              rateCompact,
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
  const { data: session, status } = useSession();
  const { localContext, setLocalContext, clearLocalContext } =
    usePolitilogLocalContext();
  const [party, setParty] = useState<PolitilogPartyFilter>("all");
  const [scope, setScope] = useState<PolitilogScopeFilter>("all");
  const [locationOpen, setLocationOpen] = useState(false);
  const [pickState, setPickState] = useState("");
  const [pickLga, setPickLga] = useState("");
  const [locationSaveError, setLocationSaveError] = useState<string | null>(
    null,
  );
  const [locationSaving, setLocationSaving] = useState(false);
  const [locationClearing, setLocationClearing] = useState(false);
  const lgaDialogTitleId = useId();

  const closeLocationModal = useCallback(() => {
    setLocationOpen(false);
    setLocationSaveError(null);
  }, []);

  useEffect(() => {
    if (status !== "authenticated") return;
    let cancelled = false;
    void (async () => {
      try {
        const r = await fetchMyResidence();
        if (!cancelled && r) setLocalContext(r);
      } catch {
        /* keep existing local choice */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [status, session?.user?.id, setLocalContext]);

  useEffect(() => {
    if (!locationOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLocationModal();
    };
    window.addEventListener("keydown", onKey);
    lockBodyScroll();
    return () => {
      window.removeEventListener("keydown", onKey);
      unlockBodyScroll();
    };
  }, [locationOpen, closeLocationModal]);

  const onSaveLga = useCallback(async () => {
    const row = POLITILOG_LGA_OPTIONS.find(
      (o) => o.state === pickState && o.lga === pickLga,
    );
    if (!row) return;
    setLocationSaveError(null);
    if (status === "authenticated") {
      setLocationSaving(true);
      try {
        const saved = await saveMyResidence({
          state: row.state,
          lga: row.lga,
          key: row.key,
        });
        setLocalContext(saved);
        closeLocationModal();
      } catch (e) {
        setLocationSaveError(
          e instanceof Error ? e.message : "Could not save to your profile.",
        );
      } finally {
        setLocationSaving(false);
      }
    } else {
      setLocalContext({
        state: row.state,
        lga: row.lga,
        key: row.key,
      });
      closeLocationModal();
    }
  }, [pickState, pickLga, status, setLocalContext, closeLocationModal]);

  const onClearLga = useCallback(async () => {
    if (status === "authenticated") {
      setLocationClearing(true);
      try {
        await clearMyResidence();
      } catch {
        /* still clear device preference */
      } finally {
        setLocationClearing(false);
      }
    }
    clearLocalContext();
  }, [status, clearLocalContext]);

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

  /** Browse grid excludes top federal trio (featured above). */
  const browseRows = useMemo(
    () =>
      filtered.filter(
        (p) =>
          p.id !== PRESIDENT.id &&
          p.id !== VICE_PRESIDENT.id &&
          p.id !== SENATE_PRESIDENT.id,
      ),
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
    <>
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
                      setLocationSaveError(null);
                      setPickState(localContext.state);
                      setPickLga(localContext.lga);
                      setLocationOpen(true);
                    }}
                  >
                    Change LGA
                  </button>
                  <button
                    type='button'
                    disabled={locationClearing}
                    className={cn(
                      chip,
                      "text-flame hover:border-flame hover:text-flame",
                      locationClearing && "cursor-wait opacity-60",
                    )}
                    onClick={() => void onClearLga()}
                  >
                    {locationClearing ? "Clearing…" : "Clear"}
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
                    setLocationSaveError(null);
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
        </div>

        {/* President + local spotlight */}
        <section aria-labelledby='politilog-featured-heading'>
          <h2 id='politilog-featured-heading' className='sr-only'>
            In focus
          </h2>
          <div className='flex flex-col gap-4'>
            <div>
              <p className='text-[10px] font-semibold uppercase tracking-[0.14em] text-muted'>
                Federal leadership
              </p>
              <div className='mt-3 flex flex-col gap-3'>
                <PresidentSpotlightCard p={PRESIDENT} />
                <div className='grid gap-3 sm:grid-cols-2 sm:items-stretch'>
                  <PolitilogLedgerCard p={VICE_PRESIDENT} />
                  <PolitilogLedgerCard p={SENATE_PRESIDENT} />
                </div>
              </div>
            </div>
            {/* {localContext && locals.length > 0 ? (
              <div className='grid gap-3 md:grid-cols-2 lg:grid-cols-3'>
                {locals.map((p) => (
                  <PolitilogLedgerCard key={p.id} p={p} />
                ))}
              </div>
            ) : null} */}
          </div>
        </section>

        {/* Directory snapshot — counts only */}
        {/* <section aria-labelledby='politilog-insights-heading'>
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
        </section> */}

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

          <div className='grid items-stretch gap-3 sm:grid-cols-2 lg:grid-cols-3'>
            {browseRows.map((p) => (
              <PolitilogLedgerCard key={p.id} p={p} />
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

      {locationOpen ? (
        <div
          className='fixed inset-0 z-400 flex items-center justify-center p-4'
          role='presentation'
        >
          <button
            type='button'
            className='absolute inset-0 cursor-default bg-ink/40'
            aria-label='Close dialog'
            onClick={closeLocationModal}
          />
          <div
            role='dialog'
            aria-modal='true'
            aria-labelledby={lgaDialogTitleId}
            className='relative z-10 max-h-[min(90vh,720px)] w-full max-w-lg overflow-y-auto overscroll-y-contain rounded-xl border-[1.5px] border-line bg-card p-6 shadow-xl [-webkit-overflow-scrolling:touch]'
          >
            <button
              type='button'
              className='absolute end-4 top-4 cursor-pointer border-none bg-transparent font-sans text-lg leading-none text-muted hover:text-ink'
              aria-label='Close'
              onClick={closeLocationModal}
            >
              ×
            </button>

            <p className='text-[10px] font-semibold uppercase tracking-[0.12em] text-brand'>
              PolitiLog
            </p>
            <h2
              id={lgaDialogTitleId}
              className='mt-1 font-display text-xl font-bold tracking-tight text-ink'
            >
              Set your LGA
            </h2>
            {status === "authenticated" ? (
              <p className='mt-2 text-xs leading-relaxed text-muted'>
                Signed in — we save this to your profile so it follows you
                across devices.
              </p>
            ) : (
              <p className='mt-2 text-xs leading-relaxed text-muted'>
                This device only until you sign in — then you can save it to
                your profile.
              </p>
            )}

            <div className='mt-5 space-y-2.5 text-xs leading-relaxed text-muted'>
              <p>
                When you save your LGA, we surface local chairpersons,
                councillors, and representatives in{" "}
                <span className='font-medium text-ink/80'>In focus</span> and
                turn on{" "}
                <span className='font-medium text-ink/80'>My state</span> and{" "}
                <span className='font-medium text-ink/80'>My LGA</span> in the
                directory filters below.
              </p>
            </div>

            <div className='mt-5 flex flex-wrap gap-3'>
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
              <div className='flex w-full flex-wrap items-end gap-2'>
                <button
                  type='button'
                  className={cn(btn, "bg-ink text-paper hover:opacity-90")}
                  disabled={
                    !pickState || !pickLga || locationSaving || locationClearing
                  }
                  onClick={() => void onSaveLga()}
                >
                  {locationSaving ? "Saving…" : "Save"}
                </button>
                <button
                  type='button'
                  className={cn(btn, "bg-transparent hover:border-ink")}
                  disabled={locationSaving}
                  onClick={closeLocationModal}
                >
                  Cancel
                </button>
              </div>
            </div>
            {locationSaveError ? (
              <p className='mt-3 text-xs text-flame'>{locationSaveError}</p>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
