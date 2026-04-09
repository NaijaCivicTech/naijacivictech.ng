"use client";

import {
  PolitilogAvatar,
  PolitilogPartyBadge,
  PolitilogStars,
} from "@/features/politilog/components/PolitilogPersonPieces";
import { PolitilogProfileTimeline } from "@/features/politilog/components/PolitilogProfileTimeline";
import { cn } from "@/lib/cn";
import {
  ageFromBirthYear,
  getPoliticianById,
  officeLabel,
  type PolitilogPolitician,
} from "@/features/politilog/lib/politilog-data";
import { politilogProposeStore } from "@/features/politilog/lib/politilog-propose-store";
import { politilogRateStore } from "@/features/politilog/lib/politilog-rate-store";
import { countMyRatedRolesForPolitician } from "@/features/politilog/lib/politilog-ratings-storage";
import {
  getPrimaryRateableSegmentId,
  getRollupRatingForPolitician,
  isRateableSegment,
  type PolitilogTimelineSegment,
} from "@/features/politilog/lib/politilog-timeline";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useEffect,
  useId,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";

const PROFILE_GUIDE_STORAGE_KEY = "naijacivic:politilog-profile-guide";

const profileGuideListeners = new Set<() => void>();

function subscribeProfileGuide(cb: () => void) {
  profileGuideListeners.add(cb);
  return () => void profileGuideListeners.delete(cb);
}

function getProfileGuideHiddenSnapshot(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(PROFILE_GUIDE_STORAGE_KEY) === "hidden";
}

function getProfileGuideHiddenServerSnapshot(): boolean {
  return false;
}

function setProfileGuideHidden(hidden: boolean) {
  if (typeof window === "undefined") return;
  if (hidden) localStorage.setItem(PROFILE_GUIDE_STORAGE_KEY, "hidden");
  else localStorage.removeItem(PROFILE_GUIDE_STORAGE_KEY);
  for (const l of profileGuideListeners) l();
}

function PolitilogProfileBiography({ paragraphs }: { paragraphs: string[] }) {
  const [expanded, setExpanded] = useState(false);
  const bodyId = useId();
  const needsToggle =
    paragraphs.length > 1 ||
    (paragraphs.length === 1 && paragraphs[0].length > 320);

  return (
    <section
      className='rounded-2xl border-[1.5px] border-line bg-card p-6 shadow-[0_12px_40px_-28px_rgb(13_13_11/0.18)] sm:p-8'
      aria-labelledby='politilog-about-h'
    >
      <h2
        id='politilog-about-h'
        className='font-display text-xl font-extrabold tracking-tight text-ink'
      >
        Biography
      </h2>
      <div
        id={bodyId}
        className={cn(
          "mt-4 space-y-4 font-sans text-[14px] leading-[1.75] text-ink/90",
          !expanded && paragraphs.length === 1 && needsToggle && "line-clamp-6",
        )}
      >
        {(expanded || !needsToggle ? paragraphs : [paragraphs[0]]).map(
          (paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ),
        )}
      </div>
      {needsToggle ? (
        <button
          type='button'
          className='mt-3 cursor-pointer border-none bg-transparent p-0 font-sans text-[13px] font-bold text-brand underline decoration-brand/35 underline-offset-[3px] transition-colors hover:text-ink hover:decoration-ink/30'
          aria-expanded={expanded}
          aria-controls={bodyId}
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? "View less" : "View more"}
        </button>
      ) : null}
    </section>
  );
}

export function PolitilogProfileView({
  politician: p,
  timeline,
}: {
  politician: PolitilogPolitician;
  timeline: PolitilogTimelineSegment[];
}) {
  const pathname = usePathname() ?? `/politilog/${p.id}`;
  const rollup = useMemo(() => getRollupRatingForPolitician(p.id), [p.id]);
  const primarySegId = useMemo(() => getPrimaryRateableSegmentId(p.id), [p.id]);
  const politicalSteps = useMemo(
    () => timeline.filter(isRateableSegment).length,
    [timeline],
  );
  const bioParagraphs = useMemo(() => {
    // Resolve from catalog on the client so the About section still shows if the
    // serialized `politician` prop omits optional fields across the RSC boundary.
    const raw = (p.bio ?? getPoliticianById(p.id)?.bio)?.trim() ?? "";
    if (!raw) return [];
    return raw
      .split(/\n\s*\n+/)
      .map((s) => s.trim())
      .filter(Boolean);
  }, [p.id, p.bio]);
  const age = ageFromBirthYear(p.birthYear);

  const [myRatedRoleCount, setMyRatedRoleCount] = useState(() =>
    countMyRatedRolesForPolitician(p.id),
  );

  const guideHidden = useSyncExternalStore(
    subscribeProfileGuide,
    getProfileGuideHiddenSnapshot,
    getProfileGuideHiddenServerSnapshot,
  );
  const guideOpen = !guideHidden;

  const dismissGuide = () => setProfileGuideHidden(true);
  const openGuide = () => setProfileGuideHidden(false);

  useEffect(() => {
    return politilogRateStore.subscribe(() => {
      if (politilogRateStore.getSnapshot().open) return;
      setMyRatedRoleCount(countMyRatedRolesForPolitician(p.id));
    });
  }, [p.id]);

  const loginContributeHref = `/login?callbackUrl=${encodeURIComponent(pathname)}`;

  return (
    <div className='relative mx-auto max-w-[1100px]'>
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

      <div className='grid gap-10 lg:grid-cols-[1fr_minmax(260px,300px)] lg:items-start lg:gap-12'>
        <div className='min-w-0 space-y-12'>
          <header
            className={cn(
              "relative overflow-hidden rounded-[1.75rem] border-[1.5px] border-line bg-card shadow-[0_20px_50px_-24px_rgb(13_13_11/0.2)]",
            )}
          >
            <div
              className='pointer-events-none absolute -end-24 -top-24 size-[22rem] rounded-full bg-gradient-to-br from-brand/25 via-transparent to-civic-blue/15 blur-2xl'
              aria-hidden
            />
            <div
              className='pointer-events-none absolute -bottom-16 start-1/4 size-48 rounded-full bg-sun-soft/80 blur-3xl'
              aria-hidden
            />

            <div className='relative z-10 p-6 sm:p-8'>
              <div className='flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:gap-5'>
                <div className='relative shrink-0'>
                  <div
                    className='absolute inset-0 rounded-full bg-brand/12 blur-lg'
                    aria-hidden
                  />
                  <PolitilogAvatar
                    seed={p.imageSeed}
                    name={p.name}
                    size='xl'
                    imageUrl={p.imageUrl ?? getPoliticianById(p.id)?.imageUrl}
                  />
                </div>

                <div className='min-w-0 w-full flex-1 space-y-4 text-center sm:text-start'>
                  <div className='space-y-2'>
                    <div className='flex flex-col items-center gap-1 sm:items-start'>
                      <h1 className='font-display text-[clamp(1.65rem,4.5vw,2.35rem)] font-extrabold leading-[1.1] tracking-tight text-ink'>
                        {p.name}
                      </h1>
                      <p className='font-sans text-[13px] text-muted'>
                        Age {age} · (b. {p.birthYear})
                      </p>
                    </div>
                    <p className='text-[15px] font-medium leading-relaxed text-ink/85'>
                      {p.jurisdiction}
                    </p>
                    <div className='flex flex-wrap justify-center gap-2 pt-1 sm:justify-start'>
                      <span className='rounded-full bg-ink px-3 py-1 font-sans text-[10px] font-bold uppercase tracking-widest text-paper'>
                        {officeLabel(p.office)}
                      </span>
                      <PolitilogPartyBadge
                        party={p.party}
                        className='text-[9px]'
                      />
                    </div>
                  </div>

                  <div className='flex flex-wrap items-center justify-center gap-4 sm:justify-start'>
                    <div className='flex flex-wrap items-center gap-2 rounded-xl border border-line bg-paper/80 px-4 py-2.5'>
                      <PolitilogStars
                        value={rollup.count > 0 ? rollup.avg : 0}
                      />
                      <span className='text-[14px] font-bold tabular-nums text-ink'>
                        {rollup.count > 0 ? rollup.avg.toFixed(1) : "—"}
                      </span>
                      <span className='text-[12px] mt-[2.5px] -ml-1 text-muted'>
                        ·{" "}
                        {rollup.count > 0
                          ? `${rollup.count.toLocaleString()} ratings`
                          : "No scores yet"}
                      </span>
                    </div>
                  </div>

                  {politicalSteps > 0 ? (
                    <p className='text-[12px] text-muted'>
                      {myRatedRoleCount > 0 ? (
                        <>
                          You&apos;ve rated{" "}
                          <span className='font-bold text-ink'>
                            {myRatedRoleCount}
                          </span>{" "}
                          of {politicalSteps} role
                          {politicalSteps === 1 ? "" : "s"}.
                        </>
                      ) : (
                        <>Rate each office or appointment separately below.</>
                      )}
                    </p>
                  ) : null}

                  <div className='flex flex-wrap justify-center gap-3 pt-1 sm:justify-start'>
                    {primarySegId ? (
                      <button
                        type='button'
                        className='inline-flex cursor-pointer items-center justify-center rounded-lg border-[1.5px] border-ink bg-ink px-6 py-2.5 font-sans text-[13px] font-semibold text-paper shadow-sm transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-md'
                        onClick={() =>
                          politilogRateStore.open(p.id, primarySegId)
                        }
                      >
                        Rate current role
                      </button>
                    ) : null}
                    <Link
                      href={loginContributeHref}
                      className='inline-flex items-center justify-center rounded-lg border-[1.5px] border-line-strong bg-transparent px-6 py-2.5 font-sans text-[13px] font-semibold text-ink transition-colors hover:border-ink/30 hover:bg-paper2/80'
                    >
                      Sign in to contribute
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {bioParagraphs.length > 0 ? (
            <PolitilogProfileBiography key={p.id} paragraphs={bioParagraphs} />
          ) : null}

          <PolitilogProfileTimeline politicianId={p.id} segments={timeline} />

          <section
            className='rounded-2xl border-[1.5px] border-dashed border-civic-blue/35 bg-civic-blue-soft/30 p-6 sm:p-8'
            aria-labelledby='politilog-contribute-h'
          >
            <h2
              id='politilog-contribute-h'
              className='font-display text-xl font-extrabold tracking-tight text-ink'
            >
              Shape this record
            </h2>
            <p className='mt-2 max-w-2xl text-[13px] leading-relaxed text-muted'>
              Spot a gap? Propose a timeline update on this profile — choose
              segment type (political, education, etc.), office role from our
              list when it applies, where it was held, and dates. Link sources
              when you can. Edits go through review before they appear publicly.
            </p>
            <div className='mt-5 flex flex-wrap gap-3'>
              <button
                type='button'
                className='inline-flex cursor-pointer items-center rounded-lg border-none bg-civic-blue px-5 py-2.5 font-sans text-[13px] font-semibold text-paper transition-opacity hover:opacity-90'
                onClick={() => politilogProposeStore.open(p.id)}
              >
                Propose an update
              </button>
              <span className='inline-flex items-center rounded-lg border border-line bg-card px-5 py-2.5 font-sans text-[12px] text-muted'>
                Comments on individual timeline steps — coming soon
              </span>
            </div>
          </section>
        </div>

        <aside className='flex min-w-0 flex-col gap-6 lg:sticky lg:top-24'>
          {guideOpen ? (
            <div className='relative rounded-2xl border border-brand/25 bg-brand-soft/40 p-5 shadow-sm'>
              <button
                type='button'
                className='absolute end-3 top-3 cursor-pointer border-none bg-transparent font-sans text-lg leading-none text-muted hover:text-ink'
                aria-label='Dismiss profile guide'
                onClick={dismissGuide}
              >
                ×
              </button>
              <h3 className='font-display text-sm font-extrabold uppercase tracking-wider text-brand'>
                How to read this profile
              </h3>
              <div className='mt-3 space-y-3 font-sans text-[12px] leading-relaxed text-muted'>
                <p>
                  <span className='font-semibold text-ink'>
                    Party on the card:
                  </span>{" "}
                  reflects their current role. Earlier or different party
                  affiliations appear on each timeline entry when they changed
                  over time.
                </p>
                <p>
                  <span className='font-semibold text-ink'>
                    Headline score:
                  </span>{" "}
                  blended across every office and appointment on the timeline,
                  weighted by how many people rated each role.
                </p>
                <p className='rounded-lg border border-line/80 bg-card/80 px-3 py-2 text-[11px] text-ink/90'>
                  <span className='font-semibold text-ink'>
                    {timeline.length}
                  </span>{" "}
                  timeline segment
                  {timeline.length === 1 ? "" : "s"} ·{" "}
                  <span className='font-semibold text-ink'>
                    {politicalSteps}
                  </span>{" "}
                  role
                  {politicalSteps === 1 ? "" : "s"} you can rate
                </p>
              </div>
            </div>
          ) : (
            <button
              type='button'
              onClick={openGuide}
              className='w-full rounded-2xl border border-dashed border-line bg-paper2/60 px-4 py-3 text-start font-sans text-[12px] font-semibold text-brand transition-colors hover:border-brand/30 hover:bg-brand-soft/30'
            >
              Show profile guide (party, scores, timeline)
            </button>
          )}

          <div className='rounded-2xl border border-line bg-card p-5 shadow-sm'>
            <h3 className='font-display text-sm font-extrabold uppercase tracking-wider text-brand'>
              Trust & scores
            </h3>
            <p className='mt-3 font-sans text-[12px] leading-relaxed text-muted'>
              <span className='font-semibold text-ink'>Transparency:</span> If
              something published here is later challenged, it may stay visible
              with a clear flag and won&apos;t count toward live totals while
              it&apos;s disputed.
            </p>
          </div>

          <div className='rounded-2xl border border-line bg-gradient-to-b from-paper to-paper2/80 p-5'>
            <h3 className='font-display text-sm font-extrabold text-ink'>
              Location context
            </h3>
            <p className='mt-2 text-[12px] leading-relaxed text-muted'>
              Your saved state and LGA help us show who represents you. In the
              future, some ratings may only count when your area matches the
              office you&apos;re scoring. Use filters on the directory to start
              from your locality.
            </p>
            <Link
              href='/politilog'
              className='mt-4 inline-flex font-sans text-[12px] font-bold text-brand underline-offset-2 hover:underline'
            >
              Browse by your LGA →
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
