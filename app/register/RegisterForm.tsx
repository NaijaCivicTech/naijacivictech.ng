"use client";

import { SiteFooter } from "@/components/civic/SiteFooter";
import { GoogleLogoMark } from "@/components/icons/GoogleLogoMark";
import { cn } from "@/lib/cn";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

const fieldLabel =
  "mb-1.5 block text-[11px] font-medium uppercase tracking-[0.07em] text-ink";
const fieldInput =
  "w-full rounded-md border-[1.5px] border-line bg-paper px-3.5 py-2 font-sans text-[13px] text-ink outline-none transition-colors focus:border-brand";
const fieldError = "mt-1 text-xs text-flame";
const btnPrimary =
  "w-full cursor-pointer rounded-md border-none bg-brand py-3 font-sans text-[13px] font-medium text-white transition-opacity hover:opacity-85 disabled:cursor-wait disabled:opacity-60";

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password,
          name: name.trim(),
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Registration failed.");
        return;
      }
      const sign = await signIn("credentials", {
        email: email.trim(),
        password,
        redirect: false,
      });
      if (sign?.error) {
        router.push("/login");
        return;
      }
      router.push(callbackUrl);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className='flex min-h-0 flex-1 flex-col'>
      <section className='mx-auto flex w-full max-w-[420px] flex-col px-10 py-16 max-md:px-5'>
        <div className='mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-brand'>
          Account
        </div>
        <h1 className='mb-2 font-display text-[26px] font-extrabold tracking-tight'>
          Create account
        </h1>
        <p className='mb-8 text-[13px] text-muted'>
          Use email and password or continue with Google. Passwords must be at
          least 10 characters.
        </p>

        <form onSubmit={onSubmit} className='mb-6 space-y-4'>
          <div>
            <label className={fieldLabel} htmlFor='reg-name'>
              Name
            </label>
            <input
              id='reg-name'
              type='text'
              autoComplete='name'
              required
              maxLength={120}
              className={fieldInput}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className={fieldLabel} htmlFor='reg-email'>
              Email
            </label>
            <input
              id='reg-email'
              type='email'
              autoComplete='email'
              required
              className={fieldInput}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className={fieldLabel} htmlFor='reg-password'>
              Password
            </label>
            <input
              id='reg-password'
              type='password'
              autoComplete='new-password'
              required
              minLength={10}
              maxLength={72}
              className={fieldInput}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error ? (
            <p className={fieldError} role='alert'>
              {error}
            </p>
          ) : null}
          <button type='submit' className={btnPrimary} disabled={pending}>
            {pending ? "Creating…" : "Register"}
          </button>
        </form>

        <div className='relative mb-6 text-center text-[11px] text-muted'>
          <span className='relative z-1 bg-paper px-2'>or</span>
          <span
            className='absolute left-0 right-0 top-1/2 z-0 h-px -translate-y-1/2 bg-line'
            aria-hidden
          />
        </div>

        <button
          type='button'
          className={cn(
            "mb-8 flex w-full cursor-pointer items-center justify-center gap-1 rounded-md border-[1.5px] border-line bg-paper py-3 font-sans text-[13px] font-medium text-ink transition-colors hover:bg-brand-soft",
          )}
          onClick={() => signIn("google", { callbackUrl })}
        >
          <GoogleLogoMark size={22} />
          Continue with Google
        </button>

        <p className='text-center text-[13px] text-muted'>
          Already have an account?{" "}
          <Link
            href='/login'
            className='font-medium text-brand no-underline hover:underline'
          >
            Sign in
          </Link>
        </p>
      </section>
      <SiteFooter short />
    </div>
  );
}
