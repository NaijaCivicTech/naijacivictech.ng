"use client";

import { useCivicProjectsStats } from "@/hooks/use-civic-feeds";
import { civicModalStore } from "@/lib/civic-modal-store";
import { cn } from "@/lib/cn";
import Link from "next/link";
import { DirectoryBoard } from "@/features/civic-projects/components/DirectoryBoard";
import { MarqueeBand } from "./MarqueeBand";
import { PipelineBoard } from "@/features/civic-projects/components/PipelineBoard";
import { SiteFooter } from "./SiteFooter";

const btn =
  "inline-flex cursor-pointer items-center gap-1.5 rounded-[5px] border-[1.5px] border-line-strong px-[22px] py-[11px] font-sans text-[13px] font-medium transition-all no-underline";
const btnSm = "px-3.5 py-1.5 text-xs";

const DISCOVERY_LANDING_LIMIT = 12;

export function HomePage() {
  const statsQ = useCivicProjectsStats();
  const projectsLoading = statsQ.isPending;
  const projectsError =
    statsQ.isError && statsQ.error instanceof Error
      ? statsQ.error.message
      : statsQ.isError
        ? "Failed to load stats"
        : null;
  const stats = statsQ.data;

  return (
    <div className='flex min-h-0 flex-1 flex-col'>
      <div>
        <section className='mx-auto w-full max-w-[1200px] px-10 pb-14 pt-20 max-md:px-5 max-md:pb-8 max-md:pt-10'>
          <div className='mb-5 flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.15em] text-brand'>
            <span className='h-px w-[22px] bg-brand' aria-hidden />
            Nigerian Developer Movement
          </div>
          <h1 className='mb-6 max-w-[720px] font-display text-[clamp(40px,6vw,78px)] font-extrabold leading-none tracking-tight'>
            Building the tools
            <br />
            <em className='not-italic text-brand'>Nigeria</em>{" "}
            <span className='relative inline-block after:absolute after:bottom-[3px] after:left-0 after:right-0 after:z-1 after:block after:h-[5px] after:-skew-x-[3deg] after:bg-sun'>
              deserves
            </span>
          </h1>
          <p className='mb-10 max-w-[480px] text-base font-light leading-[1.75] text-muted'>
            A community of Nigerian in tech building open-source tools and
            prototypes to solve real Nigerian problems, together.
          </p>
          <p className='mb-8 max-w-[520px] border-s-2 border-brand/35 ps-3 text-[13px] leading-relaxed text-ink/90'>
            <span className='font-semibold text-ink'>Trending on X</span>
            {" — "}
            <a
              href='https://x.com/i/trending/2040023409233424579'
              target='_blank'
              rel='noopener noreferrer'
              className='font-semibold text-brand underline-offset-2 hover:underline'
            >
              Join the conversation
            </a>{" "}
            about crowdsourced civic tools for Nigeria.
          </p>
          {projectsError ? (
            <p className='mb-8 rounded-lg border border-flame/30 bg-flame-soft px-4 py-3 text-sm text-flame'>
              {projectsError}
            </p>
          ) : null}
          <div className='mb-10 flex flex-wrap gap-10'>
            <div>
              <div className='font-display text-[30px] font-bold leading-none'>
                {projectsLoading ? "…" : (stats?.totalListed ?? "…")}
              </div>
              <div className='mt-1 text-[10px] uppercase tracking-widest text-muted'>
                Total Projects
              </div>
            </div>
            <div>
              <div className='font-display text-[30px] font-bold leading-none'>
                {projectsLoading ? "…" : (stats?.liveListed ?? "…")}
              </div>
              <div className='mt-1 text-[10px] uppercase tracking-widest text-muted'>
                Live Tools
              </div>
            </div>
            {/* <div>
              <div className='font-display text-[30px] font-bold leading-none'>
                10+
              </div>
              <div className='mt-1 text-[10px] uppercase tracking-widest text-muted'>
                Contributors
              </div>
            </div> */}
            <div>
              <div className='font-display text-[30px] font-bold leading-none'>
                {projectsLoading ? "…" : (stats?.openSuggestions ?? "…")}
              </div>
              <div className='mt-1 text-[10px] uppercase tracking-widest text-muted'>
                Open Suggestions
              </div>
            </div>
          </div>
          <div className='flex flex-wrap gap-2.5'>
            <button
              type='button'
              className={cn(btn, "bg-ink text-paper hover:opacity-85")}
              onClick={() => civicModalStore.openChoose()}
            >
              <svg
                width='13'
                height='13'
                viewBox='0 0 16 16'
                fill='none'
                aria-hidden
              >
                <path
                  d='M8 2v12M2 8h12'
                  stroke='currentColor'
                  strokeWidth='2.2'
                  strokeLinecap='round'
                />
              </svg>
              Submit / Suggest
            </button>
            <div className='flex flex-wrap gap-2'>
              <Link
                href='/pipeline'
                className={cn(btn, "bg-transparent text-ink hover:border-ink")}
              >
                View Pipeline →
              </Link>
              <Link
                href='/directory'
                className={cn(btn, "bg-transparent text-ink hover:border-ink")}
              >
                Browse Directory →
              </Link>
            </div>
          </div>
        </section>

        <MarqueeBand />

        <section className='mx-auto max-w-[1200px] px-10 py-12 max-md:px-5'>
          <div className='mb-6 flex flex-wrap items-baseline justify-between gap-3'>
            <div>
              <h2 className='font-display text-[22px] font-extrabold tracking-tight'>
                Discovery
              </h2>
              <p className='mt-1 text-xs text-muted'>
                Tools and prototypes listed in the directory: filter, search,
                explore what&apos;s shipping for Nigeria.
              </p>
            </div>
            <Link
              href='/directory'
              className={cn(
                btn,
                btnSm,
                "bg-transparent text-ink hover:border-ink",
              )}
            >
              Browse full directory →
            </Link>
          </div>
          <DirectoryBoard previewMaxCards={DISCOVERY_LANDING_LIMIT} />
        </section>

        <section className='mx-auto max-w-[1200px] px-10 py-12 max-md:px-5'>
          <div className='mb-10 text-center'>
            <h2 className='mb-2 font-display text-[clamp(22px,3vw,34px)] font-extrabold tracking-tight'>
              Two ways to contribute
            </h2>
            <p className='mx-auto max-w-[460px] text-sm text-muted'>
              Whether you&apos;ve built something already or just have an idea,
              there&apos;s a place for you here.
            </p>
          </div>
          <div className='grid grid-cols-1 gap-px overflow-hidden rounded-[10px] border border-line bg-line md:grid-cols-2'>
            <div className='flex flex-col gap-4 bg-card p-8 transition-colors hover:bg-[#fff8ee]'>
              <div className='flex size-12 items-center justify-center rounded-[10px] border border-line bg-brand-soft text-[22px]'>
                🛠️
              </div>
              <h3 className='font-display text-xl font-bold tracking-tight'>
                Submit Your Project
              </h3>
              <p className='flex-1 text-[13px] font-light leading-[1.65] text-muted'>
                Already building something for Nigeria? List your tool,
                prototype, or repo. Earn a{" "}
                <strong>NaijaCivicTech Verified</strong> badge after a quick
                review. You own it; we amplify it.
              </p>
              <div className='mt-2 flex flex-col gap-2'>
                {[
                  "Submit your GitHub repo + description",
                  "Core team reviews: open source? Nigerian problem? Working demo?",
                  "Get listed + earn Verified badge",
                  "Community can join your team or contribute",
                ].map((text, i) => (
                  <div
                    key={text}
                    className='flex items-start gap-2.5 text-xs text-muted'
                  >
                    <div className='mt-px flex size-5 shrink-0 items-center justify-center rounded-full bg-brand-soft text-[10px] font-bold text-brand'>
                      {i + 1}
                    </div>
                    {text}
                  </div>
                ))}
              </div>
              <button
                type='button'
                className={cn(
                  btn,
                  btnSm,
                  "mt-2 bg-brand text-white hover:opacity-90",
                )}
                onClick={() => civicModalStore.openSubmit()}
              >
                Submit a Project →
              </button>
            </div>
            <div className='flex flex-col gap-4 bg-card p-8 transition-colors hover:bg-[#fff8ee]'>
              <div className='flex size-12 items-center justify-center rounded-[10px] border border-line bg-flame-soft text-[22px]'>
                💡
              </div>
              <h3 className='font-display text-xl font-bold tracking-tight'>
                Suggest an Idea
              </h3>
              <p className='flex-1 text-[13px] font-light leading-[1.65] text-muted'>
                See a problem that needs a digital solution? Drop the idea. The
                community upvotes it, we write acceptance criteria, then
                developers form a team to build it together.
              </p>
              <div className='mt-2 flex flex-col gap-2'>
                {[
                  "Describe the problem + what a solution looks like",
                  "Community upvotes; top ideas get reviewed weekly",
                  "Core team writes acceptance criteria + scope",
                  "Developers form a team and build the sprint",
                ].map((text, i) => (
                  <div
                    key={text}
                    className='flex items-start gap-2.5 text-xs text-muted'
                  >
                    <div className='mt-px flex size-5 shrink-0 items-center justify-center rounded-full bg-flame-soft text-[10px] font-bold text-flame'>
                      {i + 1}
                    </div>
                    {text}
                  </div>
                ))}
              </div>
              <button
                type='button'
                className={cn(
                  btn,
                  btnSm,
                  "mt-2 bg-flame text-white hover:opacity-90",
                )}
                onClick={() => civicModalStore.openIdea()}
              >
                Suggest an Idea →
              </button>
            </div>
          </div>
        </section>

        <section className='mx-auto max-w-[1200px] px-10 pb-12 pt-0 max-md:px-5'>
          <div className='mb-6 flex flex-wrap items-baseline justify-between gap-2'>
            <h2 className='font-display text-[22px] font-extrabold tracking-tight'>
              Active Pipeline
            </h2>
            <Link
              href='/pipeline'
              className={cn(
                btn,
                btnSm,
                "border-[1.5px] border-line-strong bg-transparent text-ink hover:border-ink",
              )}
            >
              See full pipeline →
            </Link>
          </div>
          <PipelineBoard
            maxCardsPerColumn={3}
            hideSort
            stageCounts={stats?.pipelineStageCounts}
          />
        </section>

        <div className='h-px bg-line' />

        <section className='relative z-1 bg-ink px-10 py-16 max-md:px-5 max-md:py-10'>
          <div className='mx-auto grid max-w-[1200px] grid-cols-1 items-center gap-8 md:grid-cols-[1fr_auto]'>
            <div>
              <h2 className='mb-2 font-display text-[clamp(22px,4vw,40px)] font-extrabold leading-tight tracking-tight text-paper'>
                Built something for Nigeria?
              </h2>
              <p className='max-w-[400px] text-sm font-light text-paper/50'>
                List your project and connect with other Nigerian developers who
                want to help build it.
              </p>
            </div>
            <div className='flex flex-col items-end gap-2 max-md:items-start'>
              <button
                type='button'
                className={cn(btn, "bg-sun text-ink hover:opacity-90")}
                onClick={() => civicModalStore.openSubmit()}
              >
                Submit Your Project →
              </button>
              <button
                type='button'
                className={cn(
                  btn,
                  "border-[1.5px] border-paper/25 bg-transparent text-paper/70 hover:border-paper/40",
                )}
                onClick={() => civicModalStore.openIdea()}
              >
                Suggest an Idea
              </button>
            </div>
          </div>
        </section>
      </div>

      <SiteFooter />
    </div>
  );
}
