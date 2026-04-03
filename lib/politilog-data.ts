/**
 * PolitiLog reference data: officeholders, parties, and LGA keys used by the UI.
 * Record IDs are stable slugs for the client; persist the same keys when syncing to the API.
 */

import type { NigeriaPartyAcronym } from "@/lib/nigeria-political-parties";
import { POLITILOG_PARTY_FILTERS } from "@/lib/nigeria-political-parties";

/** Saved local LGA context; persisted by `usePolitilogLocalContext`. */
export type PolitilogLocalContext = {
  state: string;
  lga: string;
  key: string;
};

export type PolitilogOffice =
  | "president"
  | "senate"
  | "house_of_reps"
  | "governor"
  | "lga_chair"
  | "councillor";

export type PolitilogPolitician = {
  id: string;
  name: string;
  party: NigeriaPartyAcronym;
  office: PolitilogOffice;
  /** Jurisdiction label for UI */
  jurisdiction: string;
  /** Year of birth (approximate for demo; used for age display). */
  birthYear: number;
  /** LGA key when row is scoped to one LGA */
  lgaKey?: string;
  stateName?: string;
  imageSeed: string;
  /** Optional portrait URL (HTTPS). When set, PolitiLog shows this instead of initials. */
  imageUrl?: string;
  /** Optional profile bio; shown above the timeline. Use blank lines between paragraphs (\n\n). */
  bio?: string;
};

/** Party filter chips: `all` + every INEC acronym (see `nigeria-political-parties.ts`). */
export const POLITILOG_PARTIES = POLITILOG_PARTY_FILTERS;

export type PolitilogPartyFilter = (typeof POLITILOG_PARTIES)[number];

export type { NigeriaPartyAcronym } from "@/lib/nigeria-political-parties";
export {
  NIGERIA_POLITICAL_PARTIES,
  NIGERIA_POLITICAL_PARTIES_META,
  partyFullName,
} from "@/lib/nigeria-political-parties";

export type PolitilogScopeFilter = "all" | "national" | "state" | "lga";

/**
 * State/LGA pairs for onboarding. This list grows as the national geo index is fully wired in.
 */
export const POLITILOG_LGA_OPTIONS: { state: string; lga: string; key: string }[] =
  [
    { state: "Lagos", lga: "Surulere", key: "lagos-surulere" },
    { state: "Lagos", lga: "Ikeja", key: "lagos-ikeja" },
    { state: "FCT", lga: "Abaji", key: "fct-abaji" },
    { state: "Kano", lga: "Kano Municipal", key: "kano-municipal" },
    { state: "Rivers", lga: "Port Harcourt", key: "rivers-ph" },
  ];

export const PRESIDENT: PolitilogPolitician = {
  id: "plt-president",
  name: "Bola Ahmed Tinubu",
  party: "APC",
  office: "president",
  jurisdiction: "Federal Republic of Nigeria",
  birthYear: 1952,
  imageSeed: "president",
  imageUrl:
    "https://statehouse.gov.ng/wp-content/uploads/2025/07/bola-tinubu-768x857.jpg",
  bio: `President Bola Ahmed Tinubu is a professional accountant and former top executive at Mobil Oil Producing, Nigeria, where he rose to the position of Treasurer. He is one of Nigeria's foremost political thinkers, an acknowledged democracy and human rights advocate, a leading national political figure and highly successful business leader.

Before his current position as the President of Federal Republic of Nigeria, he served as the Governor of Lagos State for eight years between 1999-2007. He worked very hard with his team to remake Lagos into one of the most important financial, commercial and cultural centres on the African Continent.

President Tinubu, at a time was Nigeria's leading opposition figure and the National leader of the All Progressives Congress, APC. He is one of the architects of the emergence of two-dominant political parties in Nigeria.

An advocate of fiscal federalism, President Tinubu's political astuteness and success story is the most outstanding on the Nigerian political landscape in the last two decades. In Nigeria today, he is widely respected as a leading political and economic strategist, risk taker and a hunter for talents.

Since he assumed office as the 16th President of Nigeria on May 29, 2023, he has initiated bold economic reforms that have restored local and global confidence in the Nigerian economy. He signed into law bold Tax and Fiscal Policies directed towards streamlining the national tax system and administration to make the business environment more vibrant and competitive. President Tinubu, as a reformer, has set a $1 trillion GDP target for the country by the year 2030.`,
};

export const ALL_POLITICIANS: PolitilogPolitician[] = [
  PRESIDENT,
  {
    id: "plt-senate-president",
    name: "Godswill Akpabio",
    party: "APC",
    office: "senate",
    jurisdiction: "Senate President · National Assembly",
    birthYear: 1962,
    imageSeed: "senate-1",
  },
  {
    id: "plt-rep-surulere-i",
    name: "Lanre Okunlola",
    party: "APC",
    office: "house_of_reps",
    jurisdiction: "House of Reps · Surulere I",
    lgaKey: "lagos-surulere",
    stateName: "Lagos",
    birthYear: 1978,
    imageSeed: "rep-surulere",
  },
  {
    id: "plt-rep-ikeja",
    name: "James Faleke",
    party: "APC",
    office: "house_of_reps",
    jurisdiction: "House of Reps · Ikeja",
    lgaKey: "lagos-ikeja",
    stateName: "Lagos",
    birthYear: 1969,
    imageSeed: "rep-ikeja",
  },
  {
    id: "plt-governor-lagos",
    name: "Babajide Sanwo-Olu",
    party: "APC",
    office: "governor",
    jurisdiction: "Governor · Lagos State",
    stateName: "Lagos",
    birthYear: 1965,
    imageSeed: "gov-lagos",
  },
  {
    id: "plt-chair-surulere",
    name: "Tajudeen Ajide",
    party: "APC",
    office: "lga_chair",
    jurisdiction: "LGA Chair · Surulere",
    lgaKey: "lagos-surulere",
    stateName: "Lagos",
    birthYear: 1966,
    imageSeed: "chair-surulere",
  },
  {
    id: "plt-councillor-surulere-ward-f",
    name: "Adewale Oluwo",
    party: "PDP",
    office: "councillor",
    jurisdiction: "Councillor · Ward F · Surulere",
    lgaKey: "lagos-surulere",
    stateName: "Lagos",
    birthYear: 1985,
    imageSeed: "councillor-1",
  },
  {
    id: "plt-chair-ikeja",
    name: "Moyosore Ojelabi",
    party: "APC",
    office: "lga_chair",
    jurisdiction: "LGA Chair · Ikeja",
    lgaKey: "lagos-ikeja",
    stateName: "Lagos",
    birthYear: 1972,
    imageSeed: "chair-ikeja",
  },
  {
    id: "plt-minister-fct",
    name: "Nyesom Wike",
    party: "APC",
    office: "governor",
    jurisdiction: "Minister of the Federal Capital Territory",
    stateName: "FCT",
    birthYear: 1967,
    imageSeed: "fct-1",
  },
  {
    id: "plt-rep-port-harcourt-ii",
    name: "Chinyere Igwe",
    party: "PDP",
    office: "house_of_reps",
    jurisdiction: "House of Reps · Port Harcourt II",
    lgaKey: "rivers-ph",
    stateName: "Rivers",
    birthYear: 1970,
    imageSeed: "rep-ph",
  },
];

export function getPoliticianById(
  id: string,
): PolitilogPolitician | undefined {
  return ALL_POLITICIANS.find((p) => p.id === id);
}

export function getLocalSpotlight(lgaKey: string): PolitilogPolitician[] {
  return ALL_POLITICIANS.filter(
    (p) =>
      p.lgaKey === lgaKey &&
      p.office !== "president" &&
      (p.office === "lga_chair" ||
        p.office === "councillor" ||
        p.office === "house_of_reps"),
  );
}

export function filterPoliticians(
  list: PolitilogPolitician[],
  opts: {
    party: PolitilogPartyFilter;
    scope: PolitilogScopeFilter;
    lgaKey: string | null;
    stateName: string | null;
  },
): PolitilogPolitician[] {
  let out = list;

  if (opts.party !== "all") {
    out = out.filter((p) => p.party === opts.party);
  }

  switch (opts.scope) {
    case "national":
      out = out.filter(
        (p) =>
          p.office === "president" ||
          p.office === "senate" ||
          p.office === "house_of_reps",
      );
      break;
    case "state":
      if (opts.stateName) {
        out = out.filter(
          (p) =>
            p.office === "president" || p.stateName === opts.stateName,
        );
      }
      break;
    case "lga":
      if (opts.lgaKey) {
        out = out.filter(
          (p) => p.lgaKey === opts.lgaKey || p.office === "president",
        );
      }
      break;
    case "all":
    default:
      break;
  }

  return out;
}

export function officeLabel(office: PolitilogOffice): string {
  const map: Record<PolitilogOffice, string> = {
    president: "President",
    senate: "Senate",
    house_of_reps: "House of Reps",
    governor: "Governor / Minister",
    lga_chair: "LGA Chair",
    councillor: "Councillor",
  };
  return map[office];
}

/** Age in years from birth year (calendar year; not birthday-precise). */
export function ageFromBirthYear(
  birthYear: number,
  asOfYear = new Date().getFullYear(),
): number {
  return Math.max(0, asOfYear - birthYear);
}
