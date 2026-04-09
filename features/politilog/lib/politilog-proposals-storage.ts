/**
 * Local proposals queue until an API exists.
 */

export type PolitilogProposalKind =
  | "new_segment"
  | "correct_segment"
  | "add_sources"
  | "other";

export type StoredPolitilogProposal = {
  id: string;
  politicianId: string;
  politicianName: string;
  kind: PolitilogProposalKind;
  segmentId: string | null;
  details: string;
  sources: string[];
  submittedAt: string;
  /** Set when kind is `new_segment` (and stored for reviewer context). */
  proposedSegmentType?: string | null;
  politicalRoleId?: string | null;
  proposedHeadline?: string | null;
  organization?: string | null;
  jurisdictionScope?: string | null;
  jurisdictionState?: string | null;
  jurisdictionLgaKey?: string | null;
  jurisdictionWard?: string | null;
  jurisdictionCustom?: string | null;
  /** Resolved label for moderators (e.g. "Surulere, Lagos"). */
  jurisdictionLabel?: string | null;
  proposedStartYear?: number | null;
  /** `null` = ongoing / present */
  proposedEndYear?: number | null;
};

export const POLITILOG_PROPOSALS_STORAGE_KEY = "naijacivic:politilog-proposals";

const KEY = POLITILOG_PROPOSALS_STORAGE_KEY;
const MAX_DETAILS = 2000;
const MAX_SOURCE_LEN = 2000;
const MAX_SOURCES = 12;

function readAll(): StoredPolitilogProposal[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const p = JSON.parse(raw) as unknown;
    if (!Array.isArray(p)) return [];
    return p.filter(
      (x): x is StoredPolitilogProposal =>
        x &&
        typeof x === "object" &&
        typeof (x as StoredPolitilogProposal).id === "string" &&
        typeof (x as StoredPolitilogProposal).politicianId === "string",
    );
  } catch {
    return [];
  }
}

function writeAll(rows: StoredPolitilogProposal[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(rows));
}

export function appendPolitilogProposal(input: {
  politicianId: string;
  politicianName: string;
  kind: PolitilogProposalKind;
  segmentId: string | null;
  details: string;
  sources: string[];
  proposedSegmentType?: string | null;
  politicalRoleId?: string | null;
  proposedHeadline?: string | null;
  organization?: string | null;
  jurisdictionScope?: string | null;
  jurisdictionState?: string | null;
  jurisdictionLgaKey?: string | null;
  jurisdictionWard?: string | null;
  jurisdictionCustom?: string | null;
  jurisdictionLabel?: string | null;
  proposedStartYear?: number | null;
  proposedEndYear?: number | null;
}): void {
  if (typeof window === "undefined") return;
  const sources = input.sources
    .map((s) => s.trim().slice(0, MAX_SOURCE_LEN))
    .filter(Boolean)
    .slice(0, MAX_SOURCES);
  const details = input.details.trim().slice(0, MAX_DETAILS);
  const row: StoredPolitilogProposal = {
    id:
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `prop-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    politicianId: input.politicianId,
    politicianName: input.politicianName,
    kind: input.kind,
    segmentId: input.segmentId,
    details,
    sources,
    submittedAt: new Date().toISOString(),
    ...(input.proposedSegmentType != null && input.proposedSegmentType !== ""
      ? { proposedSegmentType: input.proposedSegmentType }
      : {}),
    ...(input.politicalRoleId != null && input.politicalRoleId !== ""
      ? { politicalRoleId: input.politicalRoleId }
      : {}),
    ...(input.proposedHeadline != null && input.proposedHeadline !== ""
      ? { proposedHeadline: input.proposedHeadline }
      : {}),
    ...(input.organization != null && input.organization.trim() !== ""
      ? { organization: input.organization.trim().slice(0, 500) }
      : {}),
    ...(input.jurisdictionScope != null && input.jurisdictionScope !== ""
      ? { jurisdictionScope: input.jurisdictionScope }
      : {}),
    ...(input.jurisdictionState != null && input.jurisdictionState !== ""
      ? { jurisdictionState: input.jurisdictionState }
      : {}),
    ...(input.jurisdictionLgaKey != null && input.jurisdictionLgaKey !== ""
      ? { jurisdictionLgaKey: input.jurisdictionLgaKey }
      : {}),
    ...(input.jurisdictionWard != null && input.jurisdictionWard.trim() !== ""
      ? { jurisdictionWard: input.jurisdictionWard.trim().slice(0, 120) }
      : {}),
    ...(input.jurisdictionCustom != null && input.jurisdictionCustom.trim() !== ""
      ? { jurisdictionCustom: input.jurisdictionCustom.trim().slice(0, 500) }
      : {}),
    ...(input.jurisdictionLabel != null && input.jurisdictionLabel !== ""
      ? { jurisdictionLabel: input.jurisdictionLabel }
      : {}),
    ...(typeof input.proposedStartYear === "number"
      ? { proposedStartYear: input.proposedStartYear }
      : {}),
    ...(input.proposedEndYear !== undefined
      ? { proposedEndYear: input.proposedEndYear }
      : {}),
  };
  const all = readAll();
  all.unshift(row);
  try {
    writeAll(all);
  } catch {
    throw new Error("STORAGE_QUOTA");
  }
}

export function listPolitilogProposals(): StoredPolitilogProposal[] {
  return readAll();
}
