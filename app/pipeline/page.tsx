"use client";

import { PipelineBoard } from "@/features/civic-projects/components/PipelineBoard";
import { SiteFooter } from "@/components/civic/SiteFooter";
import { useCivicProjectsStats } from "@/hooks/use-civic-feeds";
import { civicModalStore } from "@/lib/civic-modal-store";
import { cn } from "@/lib/cn";

const btn =
  "inline-flex cursor-pointer items-center gap-1.5 rounded-[5px] border-none px-[22px] py-[11px] font-sans text-[13px] font-medium transition-all";
const btnSm = "px-3.5 py-1.5 text-xs";

export default function PipelinePage() {
  const { data: stats } = useCivicProjectsStats();
  return (
    <div className='flex min-h-0 flex-1 flex-col'>
      <section className='mx-auto flex w-full max-w-[1200px] flex-1 min-h-0 flex-col px-10 pb-8 pt-12 max-md:px-5'>
        <div className='mb-6 flex shrink-0 flex-wrap items-baseline justify-between gap-2'>
          <div>
            <h2 className='font-display text-[22px] font-extrabold tracking-tight'>
              Project Pipeline
            </h2>
            <p className='text-xs text-muted'>
              From raw idea to live tool: track every project&apos;s journey
            </p>
          </div>
          <button
            type='button'
            className={cn(btn, btnSm, "bg-ink text-paper hover:opacity-85")}
            onClick={() => civicModalStore.openIdea()}
          >
            + Add to Pipeline
          </button>
        </div>
        <div className='min-h-0 flex-1 max-lg:max-h-[70dvh]'>
          <PipelineBoard
            fillViewport
            stageCounts={stats?.pipelineStageCounts}
          />
        </div>
      </section>
      <SiteFooter short />
    </div>
  );
}
