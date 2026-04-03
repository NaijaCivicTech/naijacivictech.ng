"use client";

import { avatarColorFromSeed, initials } from "@/lib/civic-utils";
import { cn } from "@/lib/cn";
import { partyFullName, type PolitilogPolitician } from "@/lib/politilog-data";
import Image from "next/image";
import { useId } from "react";

export function PolitilogAvatar({
  seed,
  name,
  size = "md",
  imageUrl,
}: {
  seed: string;
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  imageUrl?: string | null;
}) {
  const bg = avatarColorFromSeed(seed);
  const letter = initials(name);
  const sizeCls =
    size === "sm"
      ? "size-11 text-[11px] ring-1"
      : size === "lg"
        ? "size-[4.25rem] text-base ring-2 sm:size-[4.5rem] sm:text-lg"
        : size === "xl"
          ? "size-[4.75rem] text-xl ring-2 sm:size-20 sm:text-2xl"
          : "size-14 text-sm ring-2 sm:size-16 sm:text-base";
  const src = imageUrl?.trim();
  if (src) {
    return (
      <div
        className={cn(
          "relative shrink-0 overflow-hidden rounded-full shadow-sm ring-paper",
          sizeCls,
        )}
      >
        <Image
          src={src}
          alt=''
          fill
          className='object-cover'
          sizes='96px'
          referrerPolicy='no-referrer'
        />
      </div>
    );
  }
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-bold text-white shadow-sm ring-paper",
        sizeCls,
      )}
      style={{ background: bg }}
      aria-hidden
    >
      {letter}
    </div>
  );
}

export function PolitilogStars({ value, max = 5 }: { value: number; max?: number }) {
  const full = Math.floor(value);
  const partial = value - full >= 0.5;
  const id = useId();
  return (
    <div
      className='flex items-center gap-0.5 text-sun'
      role='img'
      aria-label={`${value.toFixed(1)} out of ${max} average rating`}
    >
      {Array.from({ length: max }, (_, i) => {
        const filled = i < full || (i === full && partial);
        return (
          <span key={`${id}-${i}`} className='text-[13px] leading-none'>
            {filled ? "★" : "☆"}
          </span>
        );
      })}
    </div>
  );
}

export function PolitilogPartyBadge({
  party,
  className,
}: {
  party: PolitilogPolitician["party"];
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full border border-line bg-paper px-2.5 py-1 text-[10px] font-semibold tracking-wide text-ink",
        className,
      )}
      title={partyFullName(party)}
    >
      {party}
    </span>
  );
}
