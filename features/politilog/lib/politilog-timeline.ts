/**
 * PolitiLog career timeline seed data for the UI. Replace with API-backed data.
 */

import type { NigeriaPartyAcronym } from "@/lib/nigeria-political-parties";

export type PolitilogSegmentType =
  | "political_office"
  | "employment"
  | "education"
  | "business"
  | "civil_society"
  | "appointment"
  | "other";

/** Curated community rating rows for UI until an API backs the ledger. */
export type PolitilogCommunityRatingSnapshot = {
  id: string;
  authorLabel: string;
  stars: number;
  note: string;
  sources?: string[];
  submittedAt: string;
  mediaUrl?: string;
};

export type PolitilogTimelineSegment = {
  id: string;
  type: PolitilogSegmentType;
  title: string;
  organization?: string;
  startYear: number;
  /** `null` = present */
  endYear: number | null;
  jurisdiction?: string;
  party?: NigeriaPartyAcronym;
  /** Historical or legacy party label when not a current INEC acronym */
  partyFreeText?: string;
  /** Optional source or citation note for the segment */
  sourceLabel?: string;
  /** Community aggregate for this office/appointment (seed data). */
  ratingAvg?: number;
  ratingCount?: number;
  /** Optional explicit rows; if absent, UI may synthesize a sample from aggregates. */
  communityRatingRows?: ReadonlyArray<PolitilogCommunityRatingSnapshot>;
};

const TIMELINES: Record<string, PolitilogTimelineSegment[]> = {
  "plt-president": [
    {
      id: "pt-prez-1",
      type: "education",
      title: "B.Sc. Business Administration",
      organization: "Chicago State University",
      startYear: 1975,
      endYear: 1979,
      sourceLabel: "Public biography (verify)",
    },
    {
      id: "pt-prez-2",
      type: "employment",
      title: "Executive roles",
      organization: "Energy sector (Nigeria)",
      startYear: 1980,
      endYear: 1992,
    },
    {
      id: "pt-prez-3",
      type: "political_office",
      title: "Senator",
      organization: "Senate · Lagos West",
      startYear: 1992,
      endYear: 1993,
      party: "SDP",
      jurisdiction: "Lagos West Senatorial District",
      sourceLabel: "Third Republic records",
      ratingAvg: 2.9,
      ratingCount: 320,
    },
    {
      id: "pt-prez-4",
      type: "political_office",
      title: "Governor",
      organization: "Lagos State",
      startYear: 1999,
      endYear: 2007,
      partyFreeText: "AD / ACN (legacy)",
      jurisdiction: "Lagos State",
      ratingAvg: 3.8,
      ratingCount: 6200,
    },
    {
      id: "pt-prez-5",
      type: "political_office",
      title: "President & Commander-in-Chief",
      organization: "Federal Republic of Nigeria",
      startYear: 2023,
      endYear: null,
      party: "APC",
      jurisdiction: "National",
      ratingAvg: 3.1,
      ratingCount: 12840,
    },
  ],
  "plt-vice-president": [
    {
      id: "pt-vp-1",
      type: "education",
      title: "Primary & secondary education",
      organization: "Maiduguri, Biu, Potiskum",
      startYear: 1972,
      endYear: 1984,
      sourceLabel: "State House profile (paraphrased)",
    },
    {
      id: "pt-vp-2",
      type: "education",
      title: "B.Sc. (Hons) Agricultural Economics",
      organization: "University of Maiduguri",
      startYear: 1984,
      endYear: 1988,
      sourceLabel: "State House profile (paraphrased)",
    },
    {
      id: "pt-vp-3",
      type: "employment",
      title: "National Youth Service",
      organization: "Nigerian Agricultural Cooperative Bank · Calabar",
      startYear: 1989,
      endYear: 1989,
    },
    {
      id: "pt-vp-4",
      type: "education",
      title: "M.Sc. Agricultural Economics",
      organization: "University of Ibadan",
      startYear: 1989,
      endYear: 1990,
    },
    {
      id: "pt-vp-5",
      type: "employment",
      title: "Banking (CBA, AIB, Zenith)",
      organization: "Lagos · Kaduna · Maiduguri",
      startYear: 1990,
      endYear: 2007,
    },
    {
      id: "pt-vp-6",
      type: "political_office",
      title: "Commissioner",
      organization: "Borno State (several ministries)",
      startYear: 2007,
      endYear: 2011,
      partyFreeText: "Borno State executive",
      jurisdiction: "Borno State",
      ratingAvg: 3.0,
      ratingCount: 820,
    },
    {
      id: "pt-vp-7",
      type: "political_office",
      title: "Governor",
      organization: "Borno State",
      startYear: 2011,
      endYear: 2019,
      partyFreeText: "ANPP / APC (successive terms)",
      jurisdiction: "Borno State",
      ratingAvg: 3.2,
      ratingCount: 4100,
    },
    {
      id: "pt-vp-8",
      type: "political_office",
      title: "Senator",
      organization: "Senate · Borno Central",
      startYear: 2019,
      endYear: 2023,
      party: "APC",
      jurisdiction: "Borno Central",
      ratingAvg: 3.1,
      ratingCount: 2100,
    },
    {
      id: "pt-vp-9",
      type: "political_office",
      title: "Vice President",
      organization: "Federal Republic of Nigeria",
      startYear: 2023,
      endYear: null,
      party: "APC",
      jurisdiction: "National",
      ratingAvg: 3.0,
      ratingCount: 5600,
    },
  ],
  "plt-senate-president": [
    {
      id: "pt-akp-1",
      type: "education",
      title: "Law degree",
      organization: "University of Calabar",
      startYear: 1983,
      endYear: 1987,
    },
    {
      id: "pt-akp-2",
      type: "political_office",
      title: "Governor",
      organization: "Akwa Ibom State",
      startYear: 2007,
      endYear: 2015,
      party: "PDP",
      jurisdiction: "Akwa Ibom",
      ratingAvg: 3.2,
      ratingCount: 3100,
    },
    {
      id: "pt-akp-3",
      type: "political_office",
      title: "Minister",
      organization: "Niger Delta Affairs",
      startYear: 2015,
      endYear: 2019,
      party: "PDP",
      jurisdiction: "Federal",
      ratingAvg: 2.9,
      ratingCount: 900,
    },
    {
      id: "pt-akp-4",
      type: "political_office",
      title: "Senate President",
      organization: "National Assembly",
      startYear: 2023,
      endYear: null,
      party: "APC",
      jurisdiction: "National",
      ratingAvg: 2.8,
      ratingCount: 4200,
    },
  ],
  "plt-rep-surulere-i": [
    {
      id: "pt-lok-1",
      type: "education",
      title: "Tertiary studies",
      organization: "Nigeria",
      startYear: 2005,
      endYear: 2010,
    },
    {
      id: "pt-lok-2",
      type: "employment",
      title: "Private sector",
      organization: "Lagos",
      startYear: 2010,
      endYear: 2023,
    },
    {
      id: "pt-lok-3",
      type: "political_office",
      title: "Member",
      organization: "House of Representatives · Surulere I",
      startYear: 2023,
      endYear: null,
      party: "APC",
      jurisdiction: "Surulere I · Lagos",
      ratingAvg: 3.4,
      ratingCount: 890,
    },
  ],
  "plt-rep-ikeja": [
    {
      id: "pt-fal-1",
      type: "education",
      title: "Higher education",
      organization: "Nigeria / UK",
      startYear: 1990,
      endYear: 1996,
    },
    {
      id: "pt-fal-2",
      type: "civil_society",
      title: "Community & party organisation",
      organization: "Lagos",
      startYear: 1996,
      endYear: 2011,
    },
    {
      id: "pt-fal-3",
      type: "political_office",
      title: "Member",
      organization: "House of Representatives · Ikeja",
      startYear: 2011,
      endYear: null,
      party: "APC",
      jurisdiction: "Ikeja · Lagos",
      ratingAvg: 3.6,
      ratingCount: 1120,
    },
  ],
  "plt-governor-lagos": [
    {
      id: "pt-swo-1",
      type: "education",
      title: "Masters (public administration)",
      organization: "University of Lagos / overseas",
      startYear: 1995,
      endYear: 2003,
    },
    {
      id: "pt-swo-2",
      type: "employment",
      title: "Banking & public service",
      organization: "Lagos",
      startYear: 2003,
      endYear: 2019,
    },
    {
      id: "pt-swo-3",
      type: "political_office",
      title: "Governor",
      organization: "Lagos State",
      startYear: 2019,
      endYear: null,
      party: "APC",
      jurisdiction: "Lagos State",
      ratingAvg: 3.0,
      ratingCount: 9600,
    },
  ],
  "plt-chair-surulere": [
    {
      id: "pt-taj-1",
      type: "business",
      title: "Local enterprise",
      organization: "Surulere · Lagos",
      startYear: 2000,
      endYear: 2017,
    },
    {
      id: "pt-taj-2",
      type: "political_office",
      title: "LGA Chair",
      organization: "Surulere LGA",
      startYear: 2017,
      endYear: null,
      party: "APC",
      jurisdiction: "Surulere · Lagos",
      ratingAvg: 2.9,
      ratingCount: 412,
    },
  ],
  "plt-councillor-surulere-ward-f": [
    {
      id: "pt-awo-1",
      type: "employment",
      title: "Ward-level organising & youth work",
      organization: "Surulere",
      startYear: 2015,
      endYear: 2021,
    },
    {
      id: "pt-awo-2",
      type: "political_office",
      title: "Councillor",
      organization: "Ward F · Surulere LGA",
      startYear: 2021,
      endYear: null,
      party: "PDP",
      jurisdiction: "Ward F · Surulere",
      ratingAvg: 3.2,
      ratingCount: 156,
    },
  ],
  "plt-chair-ikeja": [
    {
      id: "pt-moy-1",
      type: "education",
      title: "Professional qualifications",
      organization: "Lagos",
      startYear: 1998,
      endYear: 2005,
    },
    {
      id: "pt-moy-2",
      type: "political_office",
      title: "LGA Chair",
      organization: "Ikeja LGA",
      startYear: 2021,
      endYear: null,
      party: "APC",
      jurisdiction: "Ikeja · Lagos",
      ratingAvg: 3.0,
      ratingCount: 298,
    },
  ],
  "plt-minister-fct": [
    {
      id: "pt-wik-1",
      type: "education",
      title: "Law degree",
      organization: "University of Port Harcourt",
      startYear: 1983,
      endYear: 1987,
    },
    {
      id: "pt-wik-2",
      type: "political_office",
      title: "Governor",
      organization: "Rivers State",
      startYear: 2007,
      endYear: 2015,
      party: "PDP",
      jurisdiction: "Rivers State",
      ratingAvg: 3.4,
      ratingCount: 4100,
    },
    {
      id: "pt-wik-3",
      type: "political_office",
      title: "Governor",
      organization: "Rivers State",
      startYear: 2015,
      endYear: 2023,
      party: "PDP",
      jurisdiction: "Rivers State",
      ratingAvg: 3.2,
      ratingCount: 3900,
    },
    {
      id: "pt-wik-4",
      type: "appointment",
      title: "Minister of the Federal Capital Territory",
      organization: "Federal Executive Council",
      startYear: 2023,
      endYear: null,
      party: "APC",
      jurisdiction: "FCT",
      ratingAvg: 2.7,
      ratingCount: 5400,
    },
  ],
  "plt-rep-port-harcourt-ii": [
    {
      id: "pt-chi-1",
      type: "education",
      title: "University studies",
      organization: "Nigeria",
      startYear: 1998,
      endYear: 2004,
    },
    {
      id: "pt-chi-2",
      type: "civil_society",
      title: "Women’s advocacy & business",
      organization: "Rivers State",
      startYear: 2004,
      endYear: 2019,
    },
    {
      id: "pt-chi-3",
      type: "political_office",
      title: "Member",
      organization: "House of Representatives · Port Harcourt II",
      startYear: 2019,
      endYear: null,
      party: "PDP",
      jurisdiction: "Port Harcourt II · Rivers",
      ratingAvg: 3.1,
      ratingCount: 445,
    },
  ],
};

export function segmentTypeLabel(type: PolitilogSegmentType): string {
  const map: Record<PolitilogSegmentType, string> = {
    political_office: "Political office",
    employment: "Employment",
    education: "Education",
    business: "Business",
    civil_society: "Civil society",
    appointment: "Appointment",
    other: "Other",
  };
  return map[type];
}

export function isPoliticalSegment(s: PolitilogTimelineSegment): boolean {
  return s.type === "political_office" || s.type === "appointment";
}

/** Roles that accept a performance rating (same set as political timeline filter). */
export function isRateableSegment(s: PolitilogTimelineSegment): boolean {
  return isPoliticalSegment(s);
}

/** Chronological: earliest start year first (oldest → newest in the list). */
export function getTimelineForPolitician(
  politicianId: string,
): PolitilogTimelineSegment[] {
  const rows = TIMELINES[politicianId];
  if (!rows) return [];
  return [...rows].sort((a, b) => {
    if (a.startYear !== b.startYear) return a.startYear - b.startYear;
    const endA = a.endYear ?? 9999;
    const endB = b.endYear ?? 9999;
    return endA - endB;
  });
}

export function getSegmentById(
  politicianId: string,
  segmentId: string,
): PolitilogTimelineSegment | undefined {
  return getTimelineForPolitician(politicianId).find((s) => s.id === segmentId);
}

export function getPrimaryRateableSegmentId(
  politicianId: string,
): string | undefined {
  const segs = getTimelineForPolitician(politicianId).filter(isRateableSegment);
  const current = segs.find((s) => s.endYear === null);
  if (current) return current.id;
  return segs.length ? segs[segs.length - 1].id : undefined;
}

export function getRollupRatingForPolitician(politicianId: string): {
  avg: number;
  count: number;
} {
  const segs = getTimelineForPolitician(politicianId).filter(
    (s) =>
      isRateableSegment(s) &&
      typeof s.ratingAvg === "number" &&
      typeof s.ratingCount === "number" &&
      s.ratingCount > 0,
  );
  if (segs.length === 0) return { avg: 0, count: 0 };
  const total = segs.reduce((a, s) => a + s.ratingCount!, 0);
  const w = segs.reduce((a, s) => a + s.ratingAvg! * s.ratingCount!, 0);
  return {
    avg: Math.round((w / total) * 10) / 10,
    count: total,
  };
}

export function filterTimelineByMode(
  segments: PolitilogTimelineSegment[],
  mode: "political" | "full",
): PolitilogTimelineSegment[] {
  if (mode === "full") return segments;
  return segments.filter(isPoliticalSegment);
}
