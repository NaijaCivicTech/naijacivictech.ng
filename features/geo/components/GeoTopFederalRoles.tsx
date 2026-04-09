"use client";

import { POLITILOG_POLITICAL_ROLE_CATALOG } from "@/features/politilog/lib/politilog-political-role-catalog";
import { formatJurisdictionScopeForUi } from "@/lib/political-office-ui";

const TOP_TIER_IDS = ["president", "vice_president", "senate_president"] as const;

function branchLabel(branch: string) {
  if (branch === "executive") return "Executive";
  if (branch === "legislature") return "Legislature";
  return branch;
}

export function GeoTopFederalRoles() {
  const roles = TOP_TIER_IDS.map((id) =>
    POLITILOG_POLITICAL_ROLE_CATALOG.find((o) => o.id === id),
  ).filter(Boolean);

  const [president, vicePresident, senatePresident] = roles;

  if (!president || !vicePresident || !senatePresident) return null;

  return (
    <section
      className='mt-8'
      aria-labelledby='geo-top-federal-roles-heading'
    >
      <div className='flex flex-wrap items-end justify-between gap-2'>
        <h2
          id='geo-top-federal-roles-heading'
          className='font-display text-sm font-bold uppercase tracking-[0.14em] text-muted'
        >
          Top federal offices
        </h2>
        <p className='max-w-md text-right text-[11px] leading-snug text-muted'>
          National roles at the apex of the executive and the Senate.
        </p>
      </div>

      <div className='mt-4 grid gap-3 md:grid-cols-2 md:gap-4'>
        <article
          className='group relative overflow-hidden rounded-2xl border-2 border-brand/20 bg-linear-to-br from-brand-soft via-card to-paper2 p-6 shadow-[0_1px_0_rgb(13_13_11/0.06)] md:col-span-2 md:flex md:min-h-38 md:items-stretch md:gap-8 md:p-7'
        >
          <div
            className='pointer-events-none absolute -inset-e-8 -top-12 size-40 rounded-full bg-brand/10 blur-2xl md:end-auto md:inset-s-1/2 md:-translate-x-1/2'
            aria-hidden
          />
          <div className='relative flex min-w-0 flex-1 flex-col justify-center'>
            <span className='inline-flex w-fit rounded-full border border-brand/25 bg-card/80 px-2.5 py-0.5 font-sans text-[10px] font-semibold uppercase tracking-wider text-brand'>
              {branchLabel(president.branch)}
            </span>
            <h3 className='mt-3 font-display text-[clamp(1.35rem,3.5vw,1.85rem)] font-bold leading-tight tracking-tight text-ink'>
              {president.label}
            </h3>
            <p className='mt-2 max-w-xl font-sans text-sm leading-relaxed text-muted'>
              Head of the federal executive and armed forces. One officeholder
              for the whole federation.
            </p>
          </div>
          <div className='relative mt-5 flex shrink-0 flex-col justify-center border-t border-line-strong/40 pt-5 font-sans text-xs text-muted md:mt-0 md:w-44 md:border-s md:border-t-0 md:ps-8 md:pt-0'>
            <span className='font-semibold uppercase tracking-wider text-ink/70'>
              Jurisdiction
            </span>
            <span className='mt-1 text-sm font-medium text-ink'>
              {formatJurisdictionScopeForUi(president.jurisdictionScope)}
            </span>
          </div>
        </article>

        <article className='relative overflow-hidden rounded-xl border border-line bg-card p-5 shadow-[0_1px_0_rgb(13_13_11/0.04)] transition-colors hover:border-brand/25'>
          <span
            className='absolute inset-s-0 top-0 h-full w-1 rounded-s-xl bg-brand'
            aria-hidden
          />
          <div className='ps-1'>
            <span className='font-sans text-[10px] font-semibold uppercase tracking-wider text-brand'>
              {branchLabel(vicePresident.branch)}
            </span>
            <h3 className='mt-2 font-display text-lg font-bold text-ink'>
              {vicePresident.label}
            </h3>
            <p className='mt-2 text-xs leading-relaxed text-muted'>
              Second in the line of succession; supports the President and
              chairs the National Economic Council by convention.
            </p>
            <p className='mt-3 text-[11px] text-muted'>
              <span className='font-semibold text-ink/70'>Scope · </span>
              {formatJurisdictionScopeForUi(vicePresident.jurisdictionScope)}
            </p>
          </div>
        </article>

        <article className='relative overflow-hidden rounded-xl border border-line bg-card p-5 shadow-[0_1px_0_rgb(13_13_11/0.04)] transition-colors hover:border-civic-blue/30'>
          <span
            className='absolute inset-s-0 top-0 h-full w-1 rounded-s-xl bg-civic-blue'
            aria-hidden
          />
          <div className='ps-1'>
            <span className='font-sans text-[10px] font-semibold uppercase tracking-wider text-civic-blue'>
              {branchLabel(senatePresident.branch)} · Senate
            </span>
            <h3 className='mt-2 font-display text-lg font-bold text-ink'>
              {senatePresident.label}
            </h3>
            <p className='mt-2 text-xs leading-relaxed text-muted'>
              Presides over the upper chamber; third in line of succession after
              the Vice President.
            </p>
            <p className='mt-3 text-[11px] text-muted'>
              <span className='font-semibold text-ink/70'>Scope · </span>
              {formatJurisdictionScopeForUi(senatePresident.jurisdictionScope)}
            </p>
          </div>
        </article>
      </div>
    </section>
  );
}
