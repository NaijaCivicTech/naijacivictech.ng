import { COLOR_POOL } from "@/data/projects";
import type { CivicProject, ListingStatus, TeamRole } from "@/data/types";

/**
 * Values allowed in create forms (no "all"). Keep in sync with directory filters.
 * When adding a category, add a matching pool in `data/project-icons.ts`.
 */
export const PROJECT_CATEGORY_OPTIONS = [
  "AI",
  "Agriculture & food",
  "Climate & environment",
  "Culture & media",
  "Democracy",
  "Economy",
  "Education",
  "Electricity",
  "Health",
  "Housing & cities",
  "Human rights",
  "Infrastructure",
  "Justice & legal",
  "Oil & gas",
  "Open data",
  "Public safety",
  "Security",
  "Social protection",
  "Transport",
  "Traffic",
  "Transparency",
  "Other",
] as const;

export const CATEGORIES = ["all", ...PROJECT_CATEGORY_OPTIONS] as const;

export function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function avatarColorFromSeed(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) | 0;
  }
  return COLOR_POOL[Math.abs(h) % COLOR_POOL.length]!;
}

export function listingBadgeTw(s: ListingStatus) {
  if (s === "Idea") {
    return "border border-[#f0d070] bg-sun-soft text-[#7a5a00]";
  }
  if (s === "Prototype") {
    return "border border-[#90b8e8] bg-civic-blue-soft text-civic-blue";
  }
  return "border border-[#7cc9a0] bg-brand-soft text-brand";
}

export const ROLE_TAG_TW: Record<TeamRole, string> = {
  Frontend: "bg-civic-blue-soft text-civic-blue",
  Backend: "bg-flame-soft text-flame",
  Design: "bg-sun-soft text-[#7a5a00]",
  PM: "bg-brand-soft text-brand",
  Domain: "bg-[#f0e8ff] text-[#5b2d9c]",
  Other: "bg-[#f0e8ff] text-[#5b2d9c]",
};

export function deepCloneProjects<T>(list: T[]): T[] {
  return structuredClone(list);
}

export function formatPostedAt(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function isListedOnDirectory(p: CivicProject): boolean {
  return (
    p.listingStatus != null &&
    p.listingApprovedAt != null &&
    p.listingApprovedAt !== ""
  );
}
