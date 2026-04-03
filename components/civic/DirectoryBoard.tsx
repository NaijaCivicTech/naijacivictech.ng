"use client";

import { AuthorAvatar } from "@/components/civic/AuthorAvatar";
import { DirectoryBoardSkeleton } from "@/components/civic/CivicLoadingSkeletons";
import { GitHubIcon } from "@/components/GitHubIcon";
import {
  type DirectoryFeedSort,
  useDirectoryProjectsInfinite,
  useHomeDirectoryPreview,
} from "@/hooks/use-civic-feeds";
import { useCivicVote } from "@/hooks/use-civic-vote";
import {
  CATEGORIES,
  formatPostedAt,
  isListedOnDirectory,
  listingBadgeTw,
} from "@/lib/civic-utils";
import { cn } from "@/lib/cn";
import { useId, useMemo, useState } from "react";

const sortSelectTw =
  "min-w-[140px] cursor-pointer rounded-md border-[1.5px] border-line bg-paper px-2.5 py-1.5 font-sans text-xs text-ink outline-none transition-colors focus:border-brand";

const verifiedTw =
  "inline-flex shrink-0 items-center gap-1 rounded-full border border-brand/20 bg-brand-soft px-2 py-0.5 text-[10px] font-semibold text-brand";

export type DirectoryBoardProps = {
  previewMaxCards?: number;
};

export function DirectoryBoard({ previewMaxCards }: DirectoryBoardProps = {}) {
  const isPreview = typeof previewMaxCards === "number" && previewMaxCards >= 0;

  const previewQ = useHomeDirectoryPreview(isPreview);
  const [dirCat, setDirCat] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [dirSort, setDirSort] = useState<DirectoryFeedSort>("votes");
  const sortControlId = useId();
  const infiniteQ = useDirectoryProjectsInfinite(
    dirCat,
    search,
    !isPreview,
    dirSort,
  );

  const { canVote, toggleVote } = useCivicVote();

  const previewProjects = previewQ.data?.projects ?? [];
  const previewTotal = previewQ.data?.total;
  const previewLoading = previewQ.isPending;
  const previewError = previewQ.isError
    ? previewQ.error instanceof Error
      ? previewQ.error.message
      : "Failed to load projects"
    : null;

  const flatInfinite = useMemo(
    () => infiniteQ.data?.pages.flatMap((p) => p.projects) ?? [],
    [infiniteQ.data?.pages],
  );
  const infiniteTotal = infiniteQ.data?.pages[0]?.total;
  const infiniteLoading = infiniteQ.isPending;
  const infiniteError = infiniteQ.isError
    ? infiniteQ.error instanceof Error
      ? infiniteQ.error.message
      : "Failed to load projects"
    : null;

  const items = useMemo(() => {
    if (isPreview) {
      let list = previewProjects.filter(isListedOnDirectory);
      if (dirCat !== "all") list = list.filter((p) => p.category === dirCat);
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        list = list.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q),
        );
      }
      return list;
    }
    return flatInfinite;
  }, [isPreview, previewProjects, flatInfinite, dirCat, search]);

  const displayItems =
    isPreview && typeof previewMaxCards === "number" && previewMaxCards >= 0
      ? items.slice(0, previewMaxCards)
      : items;

  const totalForLabel = isPreview
    ? (previewTotal ?? items.length)
    : (infiniteTotal ?? items.length);

  const projectsLoading = isPreview ? previewLoading : infiniteLoading;
  const projectsError = isPreview ? previewError : infiniteError;

  if (projectsLoading) {
    return (
      <DirectoryBoardSkeleton
        cardCount={
          isPreview &&
          typeof previewMaxCards === "number" &&
          previewMaxCards >= 0
            ? previewMaxCards
            : 12
        }
      />
    );
  }
  if (projectsError) {
    return (
      <p className='rounded-lg border border-flame/30 bg-flame-soft px-4 py-3 text-sm text-flame'>
        {projectsError}
      </p>
    );
  }

  return (
    <div className='flex w-full flex-col gap-4'>
      <div className='flex flex-wrap items-center justify-between gap-4'>
        <div className='flex flex-wrap gap-1'>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type='button'
              className={cn(
                "cursor-pointer rounded-full border-[1.5px] border-line bg-transparent px-[13px] py-1.5 font-sans text-[11px] font-medium text-muted transition-all hover:border-ink hover:text-ink",
                dirCat === cat &&
                  "border-ink bg-ink text-paper hover:text-paper",
              )}
              onClick={() => setDirCat(cat)}
            >
              {cat === "all" ? "All Tools" : cat}
            </button>
          ))}
        </div>
        <div className='flex items-center justify-between w-full gap-2'>
          <div className='flex items-center gap-1.5 rounded-md border-[1.5px] border-line bg-card px-3 py-1.5'>
            <svg
              width='13'
              height='13'
              viewBox='0 0 16 16'
              fill='none'
              aria-hidden
            >
              <circle cx='7' cy='7' r='5' stroke='#7A7468' strokeWidth='1.5' />
              <path
                d='M11 11l3 3'
                stroke='#7A7468'
                strokeWidth='1.5'
                strokeLinecap='round'
              />
            </svg>
            <input
              type='search'
              placeholder='Search tools…'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label='Search tools'
              className='w-[180px] border-none bg-transparent font-sans text-xs text-ink outline-none placeholder:text-muted max-sm:w-[140px]'
            />
          </div>
          {!isPreview ? (
            <div className='flex flex-wrap items-center justify-end gap-2'>
              <label
                htmlFor={sortControlId}
                className='text-[11px] font-medium uppercase tracking-[0.07em] text-muted'
              >
                Sort
              </label>
              <select
                id={sortControlId}
                className={sortSelectTw}
                value={dirSort}
                onChange={(e) =>
                  setDirSort(e.target.value as DirectoryFeedSort)
                }
                aria-label='Sort directory'
              >
                <option value='latest'>Newest first</option>
                <option value='oldest'>Oldest first</option>
                <option value='votes'>Most votes</option>
              </select>
            </div>
          ) : null}
        </div>
      </div>
      <div className='mb-5 text-[11px] text-muted'>
        {isPreview ? (
          <>
            Showing {displayItems.length} of {totalForLabel} tool
            {totalForLabel !== 1 ? "s" : ""}
          </>
        ) : (
          <>
            Showing {items.length} of {totalForLabel} project
            {totalForLabel !== 1 ? "s" : ""}
            {infiniteQ.hasNextPage ? " — more available below" : null}
          </>
        )}
      </div>
      <div className='grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-[repeat(auto-fill,minmax(300px,1fr))]'>
        {items.length === 0 ? (
          <div className='col-span-full px-12 py-12 text-center text-[13px] text-muted'>
            No tools found.
          </div>
        ) : (
          displayItems.map((t) => (
            <div
              key={t.id}
              className='flex flex-col gap-2 bg-card p-[1.4rem] transition-colors hover:bg-[#fff8ee]'
            >
              <div className='flex items-start justify-between gap-2'>
                <div className='flex size-[38px] shrink-0 items-center justify-center rounded-lg border border-line bg-paper text-lg'>
                  {t.icon}
                </div>
                <div className='flex flex-wrap items-center justify-end gap-1'>
                  {t.verified ? (
                    <span className={verifiedTw}>✓ Verified</span>
                  ) : null}
                  <span className='rounded-full border border-line bg-transparent px-[7px] py-0.5 text-[9px] font-semibold uppercase tracking-wide text-muted'>
                    {t.category}
                  </span>
                  {t.listingStatus ? (
                    <span
                      className={cn(
                        "rounded-full px-[7px] py-0.5 text-[9px] font-semibold uppercase tracking-wide",
                        listingBadgeTw(t.listingStatus),
                      )}
                    >
                      {t.listingStatus}
                    </span>
                  ) : null}
                </div>
              </div>
              <div className='font-display text-[15px] font-bold tracking-tight'>
                {t.name}
              </div>
              <div className='text-xs font-light leading-snug text-muted'>
                {t.description}
              </div>
              {t.request?.trim() ? (
                <div className='rounded-md border border-line/80 bg-paper/80 px-2.5 py-2'>
                  <div className='mb-0.5 text-[9px] font-semibold uppercase tracking-wider text-muted'>
                    Request
                  </div>
                  <p className='line-clamp-3 text-[11px] leading-snug text-ink'>
                    {t.request.trim()}
                  </p>
                </div>
              ) : null}
              <div className='text-[10px] text-muted'>
                Posted {formatPostedAt(t.postedAt)}
              </div>
              <div className='mt-auto flex flex-wrap items-center justify-between gap-1.5 border-t border-line pt-2'>
                <div className='flex items-center gap-1 text-[11px] text-muted'>
                  <AuthorAvatar
                    name={t.authorName}
                    color={t.authorColor}
                    image={t.authorImage}
                  />
                  <span className='truncate max-w-[60px]'>{t.authorName}</span>
                </div>
                <div className='flex flex-wrap items-center gap-2'>
                  <div className='flex gap-2'>
                    {t.github ? (
                      <a
                        href={t.github}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='flex items-center gap-1 text-[10px] font-medium text-muted no-underline hover:text-ink'
                      >
                        <GitHubIcon /> GitHub
                      </a>
                    ) : null}
                    {t.liveUrl ? (
                      <a
                        href={t.liveUrl}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='text-[10px] font-medium text-muted no-underline hover:text-ink'
                      >
                        ↗ Live
                      </a>
                    ) : null}
                  </div>
                  <button
                    type='button'
                    disabled
                    title='Team invites are managed by the project owner (coming soon)'
                    className='cursor-not-allowed rounded border border-line bg-transparent px-[7px] py-0.5 font-sans text-[10px] font-medium text-muted opacity-60'
                  >
                    👥 Team
                  </button>
                  <button
                    type='button'
                    disabled={!canVote}
                    title={canVote ? undefined : "Sign in to vote"}
                    className={cn(
                      "rounded border border-line bg-transparent px-[7px] py-0.5 font-sans text-[11px] font-medium text-muted transition-colors",
                      canVote &&
                        "cursor-pointer hover:border-flame hover:text-flame",
                      !canVote && "cursor-not-allowed opacity-60",
                      t.viewerHasVoted === true &&
                        canVote &&
                        "border-flame bg-flame text-white hover:bg-flame/90 hover:text-white",
                    )}
                    onClick={() => {
                      if (canVote) toggleVote(t.id);
                    }}
                  >
                    ▲ {t.votes}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      {!isPreview && infiniteQ.hasNextPage ? (
        <div className='flex justify-center pt-2'>
          <button
            type='button'
            className='rounded-md border-[1.5px] border-line bg-paper px-5 py-2 font-sans text-xs font-medium text-ink transition-colors hover:border-ink disabled:cursor-wait disabled:opacity-60'
            disabled={infiniteQ.isFetchingNextPage}
            onClick={() => void infiniteQ.fetchNextPage()}
          >
            {infiniteQ.isFetchingNextPage ? "Loading…" : "Load more"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
