"use client";

import { lockBodyScroll, unlockBodyScroll } from "@/lib/body-scroll-lock";
import { cn } from "@/lib/cn";
import {
  getPoliticianById,
  partyFullName,
  type PolitilogPolitician,
} from "@/lib/politilog-data";
import { politilogRateStore } from "@/lib/politilog-rate-store";
import {
  readMySegmentRating,
  writeMySegmentRating,
} from "@/lib/politilog-ratings-storage";
import {
  getSegmentById,
  type PolitilogTimelineSegment,
} from "@/lib/politilog-timeline";
import type { Session } from "next-auth";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

const fieldInput =
  "w-full rounded-md border-[1.5px] border-line bg-paper px-3.5 py-2 font-sans text-[13px] text-ink outline-none transition-colors focus:border-brand";

const MAX_IMAGE_BYTES = 450 * 1024;
const MAX_SOURCES = 12;

function initialSourceRows(
  stored: ReturnType<typeof readMySegmentRating>,
): string[] {
  if (!stored?.sources?.length) return [""];
  return stored.sources.slice(0, MAX_SOURCES);
}

function segmentRangeLabel(s: PolitilogTimelineSegment): string {
  if (s.endYear === null) return `${s.startYear} — present`;
  if (s.startYear === s.endYear) return `${s.startYear}`;
  return `${s.startYear} — ${s.endYear}`;
}

function PolitilogRateForm({
  politicianId,
  segmentId,
  politician,
  segment,
  pathname,
  session,
}: {
  politicianId: string;
  segmentId: string;
  politician: PolitilogPolitician;
  segment: PolitilogTimelineSegment;
  pathname: string;
  session: Session | null;
}) {
  const stored = readMySegmentRating(politicianId, segmentId);
  const [stars, setStars] = useState(() => stored?.stars ?? 0);
  const [note, setNote] = useState(() => stored?.note ?? "");
  const [sources, setSources] = useState(() => initialSourceRows(stored));
  const [mediaUrl, setMediaUrl] = useState(() => stored?.mediaUrl ?? "");
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(
    () => stored?.imageDataUrl ?? null,
  );
  const [imageLabel, setImageLabel] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">(
    "idle",
  );
  const [storageError, setStorageError] = useState(false);
  const [touchedSubmit, setTouchedSubmit] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoFieldId = useId();

  const onPickImage = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    setImageError(null);
    if (!f.type.startsWith("image/")) {
      setImageError("Please choose an image file (JPEG, PNG, WebP, etc.).");
      return;
    }
    if (f.size > MAX_IMAGE_BYTES) {
      setImageError(
        `Image is too large (max ${Math.round(MAX_IMAGE_BYTES / 1024)} KB). Try a smaller photo.`,
      );
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const data = String(reader.result ?? "");
      if (data.length > 1_200_000) {
        setImageError(
          "That image is still too large after encoding. Try a smaller file.",
        );
        return;
      }
      setImageDataUrl(data);
      setImageLabel(f.name);
    };
    reader.onerror = () =>
      setImageError("Could not read that file. Try another image.");
    reader.readAsDataURL(f);
  }, []);

  const clearImage = useCallback(() => {
    setImageDataUrl(null);
    setImageLabel(null);
    setImageError(null);
  }, []);

  const noteOk = note.trim().length > 0;
  const sourcesTrimmed = sources.map((s) => s.trim());
  const sourcesFilledCount = sourcesTrimmed.filter((s) => s.length > 0).length;
  const sourcesOk = sourcesFilledCount >= 1;

  const onSubmit = useCallback(() => {
    setTouchedSubmit(true);
    const trimmedSources = sources.map((s) => s.trim());
    const noteValid = note.trim().length > 0;
    const sourcesValid = trimmedSources.filter((s) => s.length > 0).length >= 1;
    if (stars < 1 || stars > 5 || !noteValid || !sourcesValid) return;
    setStatus("saving");
    setStorageError(false);
    try {
      writeMySegmentRating(politicianId, segmentId, {
        stars,
        note: note.trim(),
        sources: trimmedSources,
        mediaUrl: mediaUrl.trim() || undefined,
        imageDataUrl: imageDataUrl || null,
      });
      setStatus("done");
      window.setTimeout(() => {
        politilogRateStore.close();
      }, 650);
    } catch (err) {
      if (err instanceof Error && err.message === "STORAGE_QUOTA") {
        setStorageError(true);
      }
      setStatus("error");
    }
  }, [politicianId, segmentId, stars, note, sources, mediaUrl, imageDataUrl]);

  const setSourceAt = useCallback((index: number, value: string) => {
    setSources((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }, []);

  const addSourceRow = useCallback(() => {
    setSources((prev) => (prev.length >= MAX_SOURCES ? prev : [...prev, ""]));
  }, []);

  const removeSourceRow = useCallback((index: number) => {
    setSources((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const partyLine =
    segment.party != null
      ? `${partyFullName(segment.party)} (${segment.party})`
      : (segment.partyFreeText ?? "");

  return (
    <div
      role='dialog'
      aria-modal='true'
      aria-labelledby='politilog-rate-title'
      className='relative z-10 max-h-[min(90vh,720px)] w-full max-w-lg overflow-y-auto overscroll-y-contain rounded-xl border-[1.5px] border-line bg-card p-6 shadow-xl scrollbar-none [-webkit-overflow-scrolling:touch]'
    >
      <button
        type='button'
        className='absolute end-4 top-4 cursor-pointer border-none bg-transparent font-sans text-lg leading-none text-muted hover:text-ink'
        aria-label='Close'
        onClick={() => politilogRateStore.close()}
      >
        ×
      </button>

      <p className='text-[10px] font-semibold uppercase tracking-[0.12em] text-brand'>
        PolitiLog
      </p>
      <h2
        id='politilog-rate-title'
        className='mt-1 font-display text-xl font-bold tracking-tight text-ink'
      >
        Rate this role
      </h2>
      <p className='mt-1 text-sm font-medium text-ink'>{politician.name}</p>
      <p className='mt-0.5 text-sm text-muted'>
        {segment.title}
        {segment.organization ? ` · ${segment.organization}` : ""}
      </p>
      <p className='mt-0.5 font-sans text-xs tabular-nums text-muted'>
        {segmentRangeLabel(segment)}
      </p>
      {partyLine ? (
        <p className='mt-1 text-xs text-muted' title={partyLine}>
          {partyLine}
        </p>
      ) : null}

      {!session?.user ? (
        <p className='mt-4 rounded-lg border border-line bg-paper2/80 px-3 py-2 text-xs leading-relaxed text-muted'>
          <Link
            href={`/login?callbackUrl=${encodeURIComponent(pathname)}`}
            className='font-semibold text-brand underline-offset-2 hover:underline'
          >
            Sign in
          </Link>{" "}
          to link this rating to your account.
        </p>
      ) : null}

      <div className='mt-5'>
        <p className='mb-2 text-[11px] font-medium text-ink'>
          Your score (1-5)
        </p>
        <div
          className='flex flex-wrap gap-2'
          role='group'
          aria-label='Star rating'
        >
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type='button'
              className={cn(
                "flex size-11 cursor-pointer items-center justify-center rounded-lg border-[1.5px] font-sans text-lg transition-colors",
                stars >= n
                  ? "border-sun bg-sun-soft text-ink"
                  : "border-line bg-paper text-muted hover:border-ink/20",
              )}
              aria-pressed={stars >= n}
              onClick={() => setStars(n)}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      <label className='mt-4 block'>
        <span className='mb-1.5 block text-[11px] font-medium text-ink'>
          Note <span className='text-flame'>*</span>
        </span>
        <textarea
          className={cn(
            fieldInput,
            "min-h-[72px] resize-y",
            touchedSubmit && !noteOk ? "border-flame/80" : "",
          )}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={500}
          required
          placeholder='Why this score for this office? (required)'
        />
        {touchedSubmit && !noteOk ? (
          <p className='mt-1 text-[11px] text-flame'>Add a short note.</p>
        ) : null}
      </label>

      <fieldset className='mt-4 min-w-0 border-none p-0'>
        <legend className='mb-2 block w-full text-[11px] font-medium text-ink'>
          Sources <span className='text-flame'>*</span>
          <span className='ms-1 font-normal text-muted'>
            — at least one citation or link; add more if needed
          </span>
        </legend>
        <ul className='flex flex-col gap-3'>
          {sources.map((value, index) => (
            <li
              key={index}
              className='flex flex-col gap-1.5 sm:flex-row sm:items-start sm:gap-2'
            >
              <label className='min-w-0 flex-1'>
                <span className='sr-only'>Source {index + 1}</span>
                <input
                  type='text'
                  className={cn(
                    fieldInput,
                    touchedSubmit &&
                      !sourcesOk &&
                      index === 0 &&
                      "border-flame/80",
                  )}
                  value={value}
                  onChange={(e) => setSourceAt(index, e.target.value)}
                  maxLength={2000}
                  placeholder={`Source ${index + 1}: link or citation`}
                  autoComplete='off'
                  aria-invalid={touchedSubmit && !sourcesOk && index === 0}
                />
              </label>
              {sources.length > 1 ? (
                <button
                  type='button'
                  className='shrink-0 self-end font-sans text-[12px] font-semibold text-flame underline-offset-2 hover:underline sm:self-center'
                  onClick={() => removeSourceRow(index)}
                >
                  Remove
                </button>
              ) : null}
            </li>
          ))}
        </ul>
        {touchedSubmit && !sourcesOk ? (
          <p className='mt-2 text-[11px] text-flame'>
            Add at least one citation or link.
          </p>
        ) : null}
        {sources.length < MAX_SOURCES ? (
          <button
            type='button'
            className='mt-3 font-sans text-[12px] font-semibold text-brand underline-offset-2 hover:underline'
            onClick={addSourceRow}
          >
            + Add another source
          </button>
        ) : null}
      </fieldset>

      <div className='mt-4'>
        <span className='mb-1.5 block text-[11px] font-medium text-muted'>
          Photo (optional)
        </span>
        <input
          ref={fileInputRef}
          id={photoFieldId}
          type='file'
          accept='image/*'
          className='sr-only'
          onChange={onPickImage}
        />
        <div className='flex flex-wrap items-center gap-2'>
          <label
            htmlFor={photoFieldId}
            className='inline-flex cursor-pointer items-center justify-center rounded-md border-[1.5px] border-line-strong bg-paper px-3 py-2 font-sans text-[12px] font-medium text-ink transition-colors hover:border-ink/30'
          >
            Choose image
          </label>
          {imageDataUrl ? (
            <button
              type='button'
              className='font-sans text-[12px] font-semibold text-flame underline-offset-2 hover:underline'
              onClick={clearImage}
            >
              Remove photo
            </button>
          ) : null}
        </div>
        {imageLabel ? (
          <p className='mt-1 font-sans text-[11px] text-ink/80'>{imageLabel}</p>
        ) : null}
        {imageError ? (
          <p className='mt-1 text-[11px] text-flame'>{imageError}</p>
        ) : null}
        {imageDataUrl ? (
          // Data URL from FileReader; next/image is not a fit here.
          // eslint-disable-next-line @next/next/no-img-element -- local preview only
          <img
            src={imageDataUrl}
            alt='Attachment preview'
            className='mt-2 max-h-36 max-w-full rounded-lg border border-line object-contain'
          />
        ) : null}
      </div>

      <label className='mt-4 block'>
        <span className='mb-1.5 block text-[11px] font-medium text-muted'>
          Video link (optional)
        </span>
        <input
          type='url'
          className={fieldInput}
          value={mediaUrl}
          onChange={(e) => setMediaUrl(e.target.value)}
          maxLength={500}
          placeholder='https://www.youtube.com/watch?v=… or https://youtu.be/…'
          autoComplete='off'
        />
        <p className='mt-1.5 text-[11px] leading-relaxed text-muted'>
          Paste a public watch link (e.g. from{" "}
          <a
            href='https://www.youtube.com/upload'
            target='_blank'
            rel='noopener noreferrer'
            className='font-semibold text-brand underline-offset-2 hover:underline'
          >
            YouTube
          </a>
          ).
        </p>
      </label>

      {status === "error" ? (
        <p className='mt-2 text-xs text-flame'>
          {storageError
            ? "Could not save. Remove the photo or shorten text and try again."
            : "Could not save. Try again."}
        </p>
      ) : null}
      {status === "done" ? (
        <p className='mt-2 text-xs font-medium text-brand'>Thanks—saved.</p>
      ) : null}

      <div className='mt-6 flex flex-wrap gap-2'>
        <button
          type='button'
          disabled={stars < 1 || status === "saving" || status === "done"}
          className='inline-flex cursor-pointer items-center justify-center rounded-[5px] border-[1.5px] border-ink bg-ink px-5 py-2.5 font-sans text-[13px] font-medium text-paper transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-45'
          onClick={onSubmit}
        >
          {status === "saving" ? "Saving…" : "Submit rating"}
        </button>
        <button
          type='button'
          className='inline-flex cursor-pointer items-center justify-center rounded-[5px] border-[1.5px] border-line-strong bg-transparent px-5 py-2.5 font-sans text-[13px] font-medium text-ink hover:border-ink'
          onClick={() => politilogRateStore.close()}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export function PolitilogRateModal() {
  const { open, politicianId, segmentId } = useSyncExternalStore(
    politilogRateStore.subscribe,
    politilogRateStore.getSnapshot,
    politilogRateStore.getServerSnapshot,
  );

  const { data: session } = useSession();
  const pathname = usePathname() ?? "/politilog";
  const politician =
    politicianId != null ? getPoliticianById(politicianId) : undefined;
  const segment =
    politicianId != null && segmentId != null
      ? getSegmentById(politicianId, segmentId)
      : undefined;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") politilogRateStore.close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    lockBodyScroll();
    return () => {
      unlockBodyScroll();
    };
  }, [open]);

  if (!open || !politician || !politicianId || !segmentId || !segment) {
    return null;
  }

  return (
    <div
      className='fixed inset-0 z-400 flex items-center justify-center p-4'
      role='presentation'
    >
      <button
        type='button'
        className='absolute inset-0 cursor-default bg-ink/40'
        aria-label='Close dialog'
        onClick={() => politilogRateStore.close()}
      />
      <PolitilogRateForm
        key={`${politicianId}-${segmentId}`}
        politicianId={politicianId}
        segmentId={segmentId}
        politician={politician}
        segment={segment}
        pathname={pathname}
        session={session ?? null}
      />
    </div>
  );
}
