"use client";

import { DirectoryBoard } from "@/features/civic-projects/components/DirectoryBoard";
import { SiteFooter } from "@/components/civic/SiteFooter";
import { civicModalStore } from "@/lib/civic-modal-store";
import { cn } from "@/lib/cn";

const btn =
  "inline-flex cursor-pointer items-center gap-1.5 rounded-[5px] border-none px-[22px] py-[11px] font-sans text-[13px] font-medium transition-all";
const btnSm = "px-3.5 py-1.5 text-xs";

export default function DirectoryPage() {
  return (
    <div className='flex min-h-0 flex-1 flex-col'>
      <section className='flex w-full mx-auto max-w-[1200px] flex-col px-10 pb-20 pt-12 max-md:px-5'>
        <div className='mb-6 flex flex-wrap items-baseline justify-between gap-2'>
          <div>
            <h2 className='font-display text-[22px] font-extrabold tracking-tight'>
              Tool Directory
            </h2>
            <p className='text-xs text-muted'>
              All projects: submitted and community-built
            </p>
          </div>
          <button
            type='button'
            className={cn(btn, btnSm, "bg-ink text-paper hover:opacity-85")}
            onClick={() => civicModalStore.openSubmit()}
          >
            + Submit Project
          </button>
        </div>
        <DirectoryBoard />
      </section>
      <SiteFooter short />
    </div>
  );
}
