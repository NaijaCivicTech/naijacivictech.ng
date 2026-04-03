import { cn } from "@/lib/cn";
import { GITHUB_ORG_URL } from "@/lib/site-urls";
import Link from "next/link";

export function SiteFooter({ short }: { short?: boolean }) {
  return (
    <footer
      className={cn(
        "relative z-1 mt-auto flex w-full shrink-0 flex-wrap items-center justify-between gap-4 border-t border-line bg-paper px-10",
        short ? "py-5 max-md:py-4" : "py-7 max-md:py-5",
        "max-md:flex-col max-md:items-start max-md:px-5",
      )}
    >
      <div className='font-display text-sm font-extrabold'>NaijaCivicTech</div>
      <p className='text-[11px] text-muted'>
        Open source. Built by Nigerians, for Nigeria.
      </p>
      <div className='flex flex-wrap gap-6'>
        <Link
          href='/about'
          className='text-[11px] text-muted no-underline hover:text-ink'
        >
          About
        </Link>
        <a
          href={GITHUB_ORG_URL}
          target='_blank'
          rel='noopener noreferrer'
          className='text-[11px] text-muted no-underline hover:text-ink'
        >
          GitHub
        </a>
        <a
          href='https://x.com/unclebigbay143'
          className='text-[11px] text-muted no-underline hover:text-ink'
        >
          Twitter / X
        </a>
        {/* {!short ? (
          <a href="#" className="text-[11px] text-muted no-underline hover:text-ink">
            WhatsApp Community
          </a>
        ) : null} */}
      </div>
    </footer>
  );
}
