"use client";

import { cn } from "@/lib/cn";
import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", label: "Overview", match: (p: string) => p === "/" },
  {
    href: "/pipeline",
    label: "Pipeline",
    match: (p: string) => p === "/pipeline",
  },
  {
    href: "/directory",
    label: "Directory",
    match: (p: string) => p === "/directory",
  },
  {
    href: "/about",
    label: "About",
    match: (p: string) => p === "/about",
  },
] as const;

export function SiteTabs() {
  const pathname = usePathname();

  return (
    <div className='relative z-1 flex w-full bg-ink'>
      {TABS.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={cn(
            "flex min-h-[42px] min-w-0 flex-1 items-center justify-center border-b-2 border-transparent px-2 py-2.5 font-sans text-xs font-medium text-paper/50 no-underline transition-all hover:text-paper sm:px-4",
            tab.match(pathname) && "border-sun text-paper",
          )}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
