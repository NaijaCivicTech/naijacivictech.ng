/**
 * Per–timeline-segment ratings in localStorage. Replace with API + auth when backend exists.
 */

import {
  getTimelineForPolitician,
  isRateableSegment,
} from "@/lib/politilog-timeline";

export type StoredPolitilogRating = {
  stars: number;
  note: string;
  submittedAt: string;
  /** Citations, article URLs, or short source notes (required on new saves) */
  sources: string[];
  /** @deprecated Legacy single field; normalized into `sources` when reading */
  source?: string;
  /** Video link (e.g. YouTube); we do not host video files */
  mediaUrl?: string;
  /** Data URL for an attached photo (kept small for localStorage limits) */
  imageDataUrl?: string;
};

export type WritePolitilogSegmentRatingInput = {
  stars: number;
  note: string;
  sources: string[];
  mediaUrl?: string;
  imageDataUrl?: string | null;
};

const MAX_SOURCE_LEN = 2000;
const MAX_SOURCES = 12;

function normalizeSourcesFromRow(row: Record<string, unknown>): string[] {
  const raw = row.sources;
  if (Array.isArray(raw)) {
    const out: string[] = [];
    for (const x of raw) {
      if (typeof x !== "string") continue;
      const t = x.trim();
      if (t) out.push(t);
    }
    return out;
  }
  const legacy = row.source;
  if (typeof legacy === "string" && legacy.trim()) {
    return [legacy.trim()];
  }
  return [];
}

function withNormalizedSources(
  row: Partial<StoredPolitilogRating> & Pick<StoredPolitilogRating, "stars">,
): StoredPolitilogRating {
  const asRec = row as unknown as Record<string, unknown>;
  const sources = normalizeSourcesFromRow(asRec);
  return {
    stars: row.stars,
    note: typeof row.note === "string" ? row.note : "",
    submittedAt:
      typeof row.submittedAt === "string"
        ? row.submittedAt
        : new Date(0).toISOString(),
    sources,
    ...(typeof row.mediaUrl === "string" && row.mediaUrl
      ? { mediaUrl: row.mediaUrl }
      : {}),
    ...(typeof row.imageDataUrl === "string" && row.imageDataUrl
      ? { imageDataUrl: row.imageDataUrl }
      : {}),
  };
}

export const POLITILOG_SEGMENT_RATINGS_STORAGE_KEY =
  "naijacivic:politilog-segment-my-ratings";

const STORAGE_KEY = POLITILOG_SEGMENT_RATINGS_STORAGE_KEY;

type MapShape = Record<string, StoredPolitilogRating>;

function compositeKey(politicianId: string, segmentId: string): string {
  return `${politicianId}::${segmentId}`;
}

function readAll(): MapShape {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const p = JSON.parse(raw) as unknown;
    if (p && typeof p === "object" && !Array.isArray(p)) return p as MapShape;
  } catch {
    /* ignore */
  }
  return {};
}

export function readMySegmentRating(
  politicianId: string,
  segmentId: string,
): StoredPolitilogRating | null {
  const all = readAll();
  const row = all[compositeKey(politicianId, segmentId)];
  if (!row || typeof row.stars !== "number") return null;
  return withNormalizedSources(row as StoredPolitilogRating);
}

export function writeMySegmentRating(
  politicianId: string,
  segmentId: string,
  input: WritePolitilogSegmentRatingInput,
): void {
  if (typeof window === "undefined") return;
  const all = readAll();
  const sources = input.sources
    .map((s) => s.trim().slice(0, MAX_SOURCE_LEN))
    .filter(Boolean)
    .slice(0, MAX_SOURCES);
  const mediaUrl = input.mediaUrl?.trim().slice(0, 500);
  all[compositeKey(politicianId, segmentId)] = {
    stars: input.stars,
    note: input.note.trim().slice(0, 500),
    submittedAt: new Date().toISOString(),
    sources,
    ...(mediaUrl ? { mediaUrl } : {}),
    ...(input.imageDataUrl ? { imageDataUrl: input.imageDataUrl } : {}),
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
    throw new Error("STORAGE_QUOTA");
  }
}

/** How many rateable timeline roles this user has scored (current store). */
export function countMyRatedRolesForPolitician(politicianId: string): number {
  const segs = getTimelineForPolitician(politicianId).filter(isRateableSegment);
  let n = 0;
  for (const s of segs) {
    if (readMySegmentRating(politicianId, s.id)) n += 1;
  }
  return n;
}

export type MySegmentRatingEntry = {
  politicianId: string;
  segmentId: string;
  rating: StoredPolitilogRating;
};

/** All segment ratings in localStorage, newest `submittedAt` first. */
export function listAllMySegmentRatings(): MySegmentRatingEntry[] {
  const all = readAll();
  const out: MySegmentRatingEntry[] = [];
  for (const [key, rating] of Object.entries(all)) {
    const sep = key.indexOf("::");
    if (sep === -1) continue;
    const politicianId = key.slice(0, sep);
    const segmentId = key.slice(sep + 2);
    if (!politicianId || !segmentId) continue;
    if (!rating || typeof rating.stars !== "number") continue;
    out.push({
      politicianId,
      segmentId,
      rating: withNormalizedSources(
        rating as Partial<StoredPolitilogRating> &
          Pick<StoredPolitilogRating, "stars">,
      ),
    });
  }
  out.sort(
    (a, b) =>
      new Date(b.rating.submittedAt).getTime() -
      new Date(a.rating.submittedAt).getTime(),
  );
  return out;
}
