"use client";

import { civicModalStore } from "@/lib/civic-modal-store";
import { avatarColorFromSeed, initials } from "@/lib/civic-utils";
import { cn } from "@/lib/cn";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

function SessionAvatar({
  className,
  image,
  name,
  email,
  userId,
}: {
  className?: string;
  image?: string | null;
  name?: string | null;
  email?: string | null;
  userId?: string | null;
}) {
  const display = (name?.trim() || email?.trim() || "Member") as string;
  const seed = userId ?? email ?? name ?? "user";
  const bg = avatarColorFromSeed(seed);
  const letter = initials(display);

  if (image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- remote OAuth avatars
      <img
        src={image}
        alt=''
        className={cn(
          "size-7 shrink-0 rounded-full object-cover ring-2 ring-paper/15",
          className,
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex size-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white ring-2 ring-paper/15",
        className,
      )}
      style={{ background: bg }}
      aria-hidden
    >
      {letter}
    </div>
  );
}

const navLinkTopBase =
  "inline-flex items-center border-b-2 border-transparent px-0 pb-1 pt-2 text-[13px] font-medium leading-none no-underline transition-colors";

type SessionUser = NonNullable<ReturnType<typeof useSession>["data"]>["user"];

function DesktopAccountMenu({
  user,
}: {
  user: SessionUser & { isAdmin?: boolean };
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const display = user.name?.trim() || user.email?.trim() || "Member";

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      const el = wrapRef.current;
      if (el && !el.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown, true);
    return () =>
      document.removeEventListener("pointerdown", onPointerDown, true);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className='relative hidden md:flex md:items-center' ref={wrapRef}>
      <button
        type='button'
        className='flex cursor-pointer h-[27px] items-center rounded-full border-none bg-transparent p-0 py-2 ring-offset-2 ring-offset-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sun'
        aria-expanded={open}
        aria-haspopup='menu'
        aria-label='Account menu'
        id='header-account-trigger'
        onClick={() => setOpen((v) => !v)}
      >
        <SessionAvatar
          image={user.image}
          name={user.name}
          email={user.email}
          userId={user.id}
        />
      </button>
      {open ? (
        <div
          id='header-account-menu'
          role='menu'
          aria-labelledby='header-account-trigger'
          className='absolute inset-e-0 top-[calc(100%+6px)] z-250 min-w-[220px] rounded-lg border border-line bg-card py-1 shadow-lg'
        >
          <p
            className='border-b border-line px-4 py-3 font-sans text-[13px] font-medium wrap-break-word text-ink'
            role='presentation'
          >
            {display}
          </p>
          {user.isAdmin ? (
            <Link
              href='/admin'
              role='menuitem'
              className='block px-4 py-2.5 font-sans text-[13px] font-medium text-ink no-underline hover:bg-paper2'
              onClick={() => setOpen(false)}
            >
              Admin
            </Link>
          ) : null}
          <button
            type='button'
            role='menuitem'
            className='w-full cursor-pointer border-none bg-transparent px-4 py-2.5 text-left font-sans text-[13px] font-medium text-ink hover:bg-paper2'
            onClick={() => {
              setOpen(false);
              void signOut({ callbackUrl: "/" });
            }}
          >
            Sign out
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function SiteHeader() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileAccountOpen, setMobileAccountOpen] = useState(false);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    setMobileAccountOpen(false);
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => closeMenu(), 0);
    return () => window.clearTimeout(t);
  }, [pathname, closeMenu]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen, closeMenu]);

  const topNavActive = (match: boolean) =>
    match ? "border-sun text-paper" : "text-paper/50 hover:text-paper";

  const mobileMainNavClass = (match: boolean) =>
    cn(
      "block border-b border-paper/10 py-3 text-[14px] font-medium no-underline last:border-b-0",
      match ? "text-paper" : "text-paper/85 hover:text-paper",
    );

  /** Invisible copy of Sign in + Register; lives in fixed-width row (below) to avoid CLS */
  const desktopAuthPlaceholder = (
    <div
      className='flex items-center justify-end gap-5 lg:gap-7'
      aria-busy='true'
      aria-label='Loading account'
    >
      <span
        className={cn(
          navLinkTopBase,
          "pointer-events-none select-none text-transparent",
        )}
      >
        Sign in
      </span>
    </div>
  );

  const mobileAuthPlaceholder = (
    <div aria-busy='true' aria-label='Loading account'>
      <span
        className={cn(
          mobileMainNavClass(false),
          "pointer-events-none select-none text-transparent",
        )}
      >
        Sign in
      </span>
      <span
        className={cn(
          mobileMainNavClass(false),
          "pointer-events-none select-none text-transparent",
        )}
      >
        Register
      </span>
    </div>
  );

  return (
    <header className='sticky top-0 z-200 bg-ink'>
      {/* Row 1: logo + actions */}
      <div className='flex items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-10'>
        <Link
          href='/'
          className='flex min-w-0 shrink items-center gap-1.5 font-display text-[15px] font-extrabold tracking-tight text-paper no-underline sm:text-base'
          onClick={closeMenu}
        >
          <span className='size-1.5 shrink-0 rounded-full bg-sun' />
          <span className='truncate'>NaijaCivicTech</span>
        </Link>

        <div className='hidden items-center gap-4 md:flex lg:gap-5'>
          <nav
            className='flex items-center gap-5 lg:gap-7'
            aria-label='Quick links'
          >
            <Link
              href='/'
              className={cn(navLinkTopBase, topNavActive(pathname === "/"))}
              onClick={closeMenu}
            >
              Overview
            </Link>
            <Link
              href='/pipeline'
              className={cn(
                navLinkTopBase,
                topNavActive(pathname === "/pipeline"),
              )}
              onClick={closeMenu}
            >
              Pipeline
            </Link>
            <Link
              href='/directory'
              className={cn(
                navLinkTopBase,
                topNavActive(pathname === "/directory"),
              )}
              onClick={closeMenu}
            >
              Directory
            </Link>
            <Link
              href='/politilog'
              className={cn(
                navLinkTopBase,
                topNavActive(pathname === "/politilog"),
              )}
              onClick={closeMenu}
            >
              PolitiLog
            </Link>
            <Link
              href='/about'
              className={cn(
                navLinkTopBase,
                topNavActive(pathname === "/about"),
              )}
              onClick={closeMenu}
            >
              About
            </Link>
            {session?.user?.isAdmin ? (
              <Link
                href='/admin'
                className={cn(
                  navLinkTopBase,
                  topNavActive(pathname === "/admin"),
                )}
                onClick={closeMenu}
              >
                Admin
              </Link>
            ) : null}
          </nav>
          {/* Full literal class strings (no cn merge) so SSR and client match byte-for-byte */}
          <div
            className={
              session?.user
                ? "flex w-auto shrink-0 justify-end"
                : "flex shrink-0 justify-end"
              // : "flex w-44 shrink-0 justify-end lg:w-50"
            }
          >
            {status === "loading" ? (
              desktopAuthPlaceholder
            ) : session?.user ? (
              <DesktopAccountMenu key={pathname} user={session.user} />
            ) : (
              <div className='flex items-center justify-end gap-5 lg:gap-7'>
                <Link
                  href='/login'
                  className={cn(
                    navLinkTopBase,
                    topNavActive(pathname === "/login"),
                  )}
                >
                  Sign in
                </Link>
                {/* <Link
                  href='/register'
                  className={cn(
                    navLinkTopBase,
                    topNavActive(pathname === "/register"),
                  )}
                >
                  Register
                </Link> */}
              </div>
            )}
          </div>
          <button
            type='button'
            className='shrink-0 cursor-pointer rounded bg-sun px-3 py-2 font-sans text-[12px] font-medium leading-none text-ink lg:px-4 lg:text-[13px]'
            onClick={() => {
              civicModalStore.openChoose();
              closeMenu();
            }}
          >
            <span className='hidden sm:inline'>+ Suggest / Submit</span>
            <span className='sm:hidden'>+ Submit</span>
          </button>
        </div>

        <button
          type='button'
          className='flex size-10 shrink-0 cursor-pointer items-center justify-center rounded border border-paper/20 bg-transparent p-0 text-paper md:hidden'
          aria-expanded={menuOpen}
          aria-controls='site-header-menu'
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMenuOpen((o) => !o)}
        >
          <span className='text-[22px] leading-none' aria-hidden>
            {menuOpen ? "✕" : "☰"}
          </span>
        </button>
      </div>

      {/*
        Secondary tab row (below logo) removed. Active states are on the top nav.
        To restore: add a full-width <nav> with border-t border-paper/10 and links using
        the same classes as top nav (border-b-2, border-sun when active) or git history.
      */}

      {/* Mobile panel */}
      <div
        id='site-header-menu'
        className={cn(
          "border-t border-paper/10 md:hidden",
          menuOpen ? "block" : "hidden",
        )}
      >
        <nav className='flex max-h-[min(70vh,calc(100dvh-72px))] flex-col overflow-y-auto px-4 pb-4 pt-1'>
          <Link
            href='/'
            className={mobileMainNavClass(pathname === "/")}
            onClick={closeMenu}
          >
            Overview
          </Link>
          <Link
            href='/pipeline'
            className={mobileMainNavClass(pathname === "/pipeline")}
            onClick={closeMenu}
          >
            Pipeline
          </Link>
          <Link
            href='/directory'
            className={mobileMainNavClass(pathname === "/directory")}
            onClick={closeMenu}
          >
            Directory
          </Link>
          <Link
            href='/politilog'
            className={mobileMainNavClass(pathname === "/politilog")}
            onClick={closeMenu}
          >
            PolitiLog
          </Link>
          <Link
            href='/about'
            className={mobileMainNavClass(pathname === "/about")}
            onClick={closeMenu}
          >
            About
          </Link>
          {session?.user?.isAdmin ? (
            <Link
              href='/admin'
              className={mobileMainNavClass(pathname === "/admin")}
              onClick={closeMenu}
            >
              Admin
            </Link>
          ) : null}
          {status === "loading" ? (
            mobileAuthPlaceholder
          ) : session?.user ? (
            <div className='border-b border-paper/10'>
              <button
                type='button'
                className='flex w-full cursor-pointer items-center gap-3 border-none bg-transparent py-3 text-left font-[inherit]'
                aria-expanded={mobileAccountOpen}
                aria-controls='mobile-account-panel'
                id='mobile-account-trigger'
                onClick={() => setMobileAccountOpen((o) => !o)}
              >
                <SessionAvatar
                  className='size-9! text-[11px]'
                  image={session.user.image}
                  name={session.user.name}
                  email={session.user.email}
                  userId={session.user.id}
                />
                <span className='min-w-0 flex-1 text-[13px] font-medium text-paper/90'>
                  Account
                </span>
                <span className='shrink-0 text-paper/45' aria-hidden>
                  {mobileAccountOpen ? "▲" : "▼"}
                </span>
              </button>
              {mobileAccountOpen ? (
                <div
                  id='mobile-account-panel'
                  role='region'
                  aria-labelledby='mobile-account-trigger'
                  className='border-t border-paper/10 px-1 pb-3'
                >
                  <p className='px-3 py-2 font-sans text-[13px] wrap-break-word text-paper/75'>
                    {session.user.name?.trim() ||
                      session.user.email?.trim() ||
                      "Member"}
                  </p>
                  <button
                    type='button'
                    className='mx-1 w-[calc(100%-0.5rem)] cursor-pointer rounded-md border-none bg-paper/10 px-3 py-2.5 text-left font-sans text-[13px] font-medium text-paper hover:bg-paper/15'
                    onClick={() => {
                      closeMenu();
                      void signOut({ callbackUrl: "/" });
                    }}
                  >
                    Sign out
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <>
              <Link
                href='/login'
                className={mobileMainNavClass(pathname === "/login")}
                onClick={closeMenu}
              >
                Sign in
              </Link>
              <Link
                href='/register'
                className={mobileMainNavClass(pathname === "/register")}
                onClick={closeMenu}
              >
                Register
              </Link>
            </>
          )}
          <button
            type='button'
            className='mt-2 w-full cursor-pointer rounded bg-sun py-3 font-sans text-[14px] font-medium text-ink'
            onClick={() => {
              civicModalStore.openChoose();
              closeMenu();
            }}
          >
            + Suggest / Submit
          </button>
        </nav>
      </div>
    </header>
  );
}
