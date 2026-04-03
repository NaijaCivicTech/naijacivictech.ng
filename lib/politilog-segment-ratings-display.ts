/**
 * Builds the list of ratings shown on a timeline segment: your device row plus
 * seed or illustrative community rows until an API backs the ledger.
 */

import { readMySegmentRating } from "@/lib/politilog-ratings-storage";
import type { PolitilogTimelineSegment } from "@/lib/politilog-timeline";
import { isRateableSegment } from "@/lib/politilog-timeline";

export type SegmentRatingListOrigin = "you" | "seed" | "synthetic";

export type SegmentRatingListItem = {
  id: string;
  origin: SegmentRatingListOrigin;
  authorLabel: string;
  stars: number;
  note: string;
  sources: string[];
  submittedAt: string;
  mediaUrl?: string;
  imageDataUrl?: string;
};

export type SegmentRatingsListModel = {
  items: SegmentRatingListItem[];
  aggregate: { avg: number; count: number } | null;
  /** True when community rows are generated from aggregate counts (not seed/API). */
  communityIsSample: boolean;
  listedCommunityCount: number;
  totalCommunityCount: number | null;
};

function hashUint(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function unitFloat(seed: string, i: number, salt: number): number {
  const x = Math.sin(hashUint(`${seed}|${i}|${salt}`)) * 10000;
  return x - Math.floor(x);
}

const NOTE_SNIPPETS = [
  "Focused on infrastructure delivery in the second term.",
  "Constituency projects were visible; communication could improve.",
  "Strong on security rhetoric; outcomes mixed from my perspective.",
  "Seen often in plenary; fewer town halls than I hoped.",
  "Appointment process felt opaque locally.",
  "Compared fairly to predecessors on this portfolio.",
  "Delivery aligned with campaign themes early on.",
  "Fiscal transparency needs work at state level.",
  "Responsive to civic petitions through official channels.",
  "Mixed record on environmental enforcement.",
  "Party discipline vs. independent judgment — debatable.",
  "Media access improved after the first year.",
  "Legislative output steady; implementation lagged.",
];

const AUTHOR_POOL = [
  "Community rater · SW",
  "Verified citizen (pending)",
  "Local observer · Abuja",
  "Nigerian voter",
  "Civic monitor",
  "Resident · host LGA",
  "Accountability volunteer",
];

function clampStar(n: number): number {
  return Math.min(5, Math.max(1, Math.round(n)));
}

function syntheticRowCount(totalReported: number): number {
  if (totalReported <= 0) return 0;
  const raw = Math.round(3 + Math.log10(totalReported + 1) * 5);
  return Math.min(24, Math.max(4, raw));
}

function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString();
}

function buildSyntheticRows(
  politicianId: string,
  segment: PolitilogTimelineSegment,
  avg: number,
  count: number,
): SegmentRatingListItem[] {
  const key = `${politicianId}::${segment.id}`;
  const n = syntheticRowCount(count);
  const rows: SegmentRatingListItem[] = [];
  for (let i = 0; i < n; i++) {
    const u1 = unitFloat(key, i, 1);
    const u2 = unitFloat(key, i, 2);
    const u3 = unitFloat(key, i, 3);
    const jitter = (u1 - 0.5) * 2.4;
    const stars = clampStar(avg + jitter);
    const note =
      NOTE_SNIPPETS[
        Math.floor(u2 * NOTE_SNIPPETS.length) % NOTE_SNIPPETS.length
      ];
    const authorLabel =
      AUTHOR_POOL[Math.floor(u3 * AUTHOR_POOL.length) % AUTHOR_POOL.length];
    const daysAgo = Math.floor(15 + u1 * 380 + i * 6) % 480;
    const sources: string[] = [];
    if (unitFloat(key, i, 4) > 0.45) {
      sources.push(
        `Press & civic briefings · Q${1 + (i % 4)} (illustrative citation)`,
      );
    }
    if (unitFloat(key, i, 5) > 0.78) {
      sources.push(`Independent memo · Ward ${(i % 12) + 1} (sample)`);
    }
    rows.push({
      id: `syn-${segment.id}-${i}`,
      origin: "synthetic",
      authorLabel,
      stars,
      note,
      sources,
      submittedAt: isoDaysAgo(daysAgo),
    });
  }
  rows.sort(
    (a, b) =>
      new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(),
  );
  return rows;
}

export function getSegmentRatingsListModel(
  politicianId: string,
  segment: PolitilogTimelineSegment,
): SegmentRatingsListModel {
  if (!isRateableSegment(segment)) {
    return {
      items: [],
      aggregate: null,
      communityIsSample: false,
      listedCommunityCount: 0,
      totalCommunityCount: null,
    };
  }

  const agg =
    typeof segment.ratingAvg === "number" &&
    typeof segment.ratingCount === "number" &&
    segment.ratingCount > 0
      ? { avg: segment.ratingAvg, count: segment.ratingCount }
      : null;

  const mine = readMySegmentRating(politicianId, segment.id);

  let communityRows: SegmentRatingListItem[] = [];
  let communityIsSample = false;
  const totalCommunityCount: number | null = agg?.count ?? null;

  if (segment.communityRatingRows && segment.communityRatingRows.length > 0) {
    communityRows = segment.communityRatingRows.map((r) => ({
      id: r.id,
      origin: "seed" as const,
      authorLabel: r.authorLabel,
      stars: r.stars,
      note: r.note,
      sources: r.sources?.filter(Boolean) ?? [],
      submittedAt: r.submittedAt,
      mediaUrl: r.mediaUrl,
    }));
  } else if (agg) {
    communityRows = buildSyntheticRows(
      politicianId,
      segment,
      agg.avg,
      agg.count,
    );
    communityIsSample = true;
  }

  const youItem: SegmentRatingListItem | null = mine
    ? {
        id: `you-${segment.id}`,
        origin: "you",
        authorLabel: "You",
        stars: mine.stars,
        note: mine.note,
        sources: mine.sources ?? [],
        submittedAt: mine.submittedAt,
        mediaUrl: mine.mediaUrl,
        imageDataUrl: mine.imageDataUrl,
      }
    : null;

  const merged = [...communityRows];
  if (youItem) merged.push(youItem);
  merged.sort(
    (a, b) =>
      new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(),
  );

  return {
    items: merged,
    aggregate: agg,
    communityIsSample,
    listedCommunityCount: communityRows.length,
    totalCommunityCount,
  };
}
