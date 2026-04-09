import { cn } from "@/lib/cn";

const pulse = "animate-pulse bg-line/30";

export function GeoSelectFieldSkeleton({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  return (
    <div className={cn("flex w-full min-w-0 flex-col gap-1.5", className)}>
      <span className='text-xs font-medium text-muted'>{label}</span>
      <div
        className={cn(
          "h-[42px] w-full rounded-md border border-line",
          pulse,
        )}
        role='status'
        aria-busy='true'
        aria-label={`Loading ${label}`}
      />
    </div>
  );
}

export function GeoExplorePageSkeleton() {
  return (
    <div className='mx-auto w-full max-w-lg px-4 py-10'>
      <div className={cn("h-8 w-36 rounded-md", pulse)} aria-hidden />
      <div className={cn("mt-3 h-4 max-w-sm rounded-md", pulse)} aria-hidden />
      <div className='mt-8 flex w-full flex-col gap-6'>
        <GeoSelectFieldSkeleton label='Geopolitical zone' />
        <GeoSelectFieldSkeleton label='State' />
        <GeoSelectFieldSkeleton label='LGA' />
        <GeoSelectFieldSkeleton label='Ward' />
      </div>
    </div>
  );
}

function OfficeCardSkeleton() {
  return (
    <li className='rounded-lg border border-line bg-card px-4 py-3'>
      <div className={cn("h-4 w-2/3 max-w-xs rounded", pulse)} aria-hidden />
      <div className='mt-2 flex flex-wrap gap-2'>
        <div className={cn("h-6 w-24 rounded-full", pulse)} aria-hidden />
        <div className={cn("h-6 w-28 rounded-full", pulse)} aria-hidden />
      </div>
      <div className={cn("mt-2 h-3 w-full max-w-md rounded", pulse)} aria-hidden />
    </li>
  );
}

function TierSectionSkeleton({
  titleWidth,
  cards,
}: {
  titleWidth: string;
  cards: number;
}) {
  return (
    <section>
      <div
        className={cn("h-6 rounded-md", titleWidth, pulse)}
        aria-hidden
      />
      <ul className='mt-3 flex flex-col gap-2'>
        {Array.from({ length: cards }, (_, i) => (
          <OfficeCardSkeleton key={i} />
        ))}
      </ul>
    </section>
  );
}

export function GeoOfficesBrowserSkeleton() {
  return (
    <div className='mt-8 flex flex-col gap-10' role='status' aria-busy='true' aria-label='Loading offices'>
      <TierSectionSkeleton titleWidth='w-20' cards={4} />
      <TierSectionSkeleton titleWidth='w-16' cards={3} />
      <TierSectionSkeleton titleWidth='w-14' cards={2} />
    </div>
  );
}
