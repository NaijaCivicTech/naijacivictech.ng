"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const linkClass =
  "font-sans text-[13px] font-medium text-muted underline-offset-2 hover:text-ink hover:underline";

export function GeoSubNav() {
  const pathname = usePathname() ?? "";

  const items: { href: string; label: string }[] = [
    { href: "/geo", label: "Home" },
    { href: "/geo/explore", label: "Explore" },
    { href: "/geo/offices", label: "Political offices" },
  ];

  return (
    <nav
      className='border-b border-line bg-paper2/50 px-4 py-3'
      aria-label='Geo tools'
    >
      <ul className='mx-auto flex max-w-3xl flex-wrap gap-x-4 gap-y-2'>
        {items.map((item) => {
          const active =
            item.href === "/geo"
              ? pathname === "/geo"
              : pathname.startsWith(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={
                  active
                    ? `${linkClass} text-ink underline`
                    : linkClass
                }
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
