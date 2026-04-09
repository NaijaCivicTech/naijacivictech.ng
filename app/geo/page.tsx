import Link from "next/link";

const cardClass =
  "block rounded-xl border border-line bg-card p-5 shadow-sm transition-colors hover:border-brand/30 hover:bg-paper2";

export default function GeoHomePage() {
  return (
    <div className='mx-auto w-full max-w-3xl px-4 py-10 lg:px-0'>
      <h1 className='font-display text-[clamp(1.5rem,3vw,2rem)] font-bold text-ink'>
        Geo reference
      </h1>
      <p className='mt-3 text-sm leading-relaxed text-muted'>
        Browse Nigeria by zone, state, local government, and ward, or browse
        political offices for PolitiLog.
      </p>

      <ul className='mt-10 grid gap-4 sm:grid-cols-2'>
        <li>
          <Link href='/geo/explore' className={cardClass}>
            <span className='text-[10px] font-semibold uppercase tracking-wider text-brand'>
              Geo
            </span>
            <span className='mt-2 block font-display text-lg font-bold text-ink'>
              Explore
            </span>
            <span className='mt-1 block text-xs text-muted'>
              Zone → state → LGA → ward in one flow.
            </span>
          </Link>
        </li>
        <li>
          <Link href='/geo/offices' className={cardClass}>
            <span className='text-[10px] font-semibold uppercase tracking-wider text-brand'>
              PolitiLog
            </span>
            <span className='mt-2 block font-display text-lg font-bold text-ink'>
              Political offices
            </span>
            <span className='mt-1 block text-xs text-muted'>
              Federal, state, and local government roles.
            </span>
          </Link>
        </li>
      </ul>
    </div>
  );
}
