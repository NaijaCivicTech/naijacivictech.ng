/**
 * PolitiLog reference data: officeholders, parties, and LGA keys used by the UI.
 * Record IDs are stable slugs for the client; persist the same keys when syncing to the API.
 */

import {
  getPoliticalRoleCatalogEntry,
  POLITILOG_POLITICAL_ROLE_CATALOG,
  type PolitilogPoliticalRoleCatalogId,
} from "@/features/politilog/lib/politilog-political-role-catalog";
import type { NigeriaPartyAcronym } from "@/lib/nigeria-political-parties";
import { POLITILOG_PARTY_FILTERS } from "@/lib/nigeria-political-parties";

/** Saved local LGA context; persisted by `usePolitilogLocalContext`. */
export type PolitilogLocalContext = {
  state: string;
  lga: string;
  key: string;
};

export type PolitilogOffice = PolitilogPoliticalRoleCatalogId;

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

export {
  NIGERIA_POLITICAL_PARTIES,
  NIGERIA_POLITICAL_PARTIES_META,
  partyFullName,
} from "@/lib/nigeria-political-parties";
export type { NigeriaPartyAcronym } from "@/lib/nigeria-political-parties";

export type PolitilogScopeFilter = "all" | "national" | "state" | "lga";

export { POLITILOG_LGA_OPTIONS } from "@/features/politilog/lib/politilog-lga-options";

export const PRESIDENT: PolitilogPolitician = {
  id: "plt-president",
  name: "Bola Ahmed Tinubu (GCFR)",
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

export const VICE_PRESIDENT: PolitilogPolitician = {
  id: "plt-vice-president",
  name: "Kashim Shettima (GCON)",
  party: "APC",
  office: "vice_president",
  jurisdiction: "Vice President, Federal Republic of Nigeria",
  birthYear: 1966,
  imageSeed: "vice-president",
  imageUrl:
    "https://statehouse.gov.ng/wp-content/uploads/2025/07/kashim-shettima-768x857.jpg",
  bio: `Senator Kashim Shettima Mustapha, GCON, is the current Vice President of the Federal Republic of Nigeria. Born 2 September 1966 in Maiduguri, Borno State, he is a Nigerian politician and agricultural economist.

He attended Lamisula Primary School in Maiduguri (1972–1978), then Government Community Secondary School, Biu, and Government Science Secondary School, Potiskum, for his West African School Certificate Examinations.

He earned a Bachelor of Science (Honours) in Agricultural Economics from the University of Maiduguri. In 1989 he completed his mandatory National Youth Service at the Nigerian Agricultural Cooperative Bank in Calabar, Cross River State, and in 1990 a Master’s degree in Agricultural Economics from the University of Ibadan.

VP Shettima worked in banking at the Commercial Bank of Africa in Lagos, African International Bank (AIB) in Kaduna, and Zenith Bank—serving as branch head of the Maiduguri office in 2001 and rising to general manager within five years.

He left banking in 2007 to serve as Commissioner of Finance and Economic Development in the Borno State Government, and also held portfolios in local government and chieftaincy affairs, education, agriculture, and health.

He was elected twice as Governor of Borno State (2011–2019) and, in his second term, chaired the Northern Governors’ Forum.

In 2019 he was elected Senator for Borno Central on the platform of the All Progressives Congress (APC). He became Vice President of Nigeria in 2023.`,
};

export const SENATE_PRESIDENT: PolitilogPolitician = {
  id: "plt-senate-president",
  name: "Godswill Akpabio",
  party: "APC",
  office: "senate_president",
  jurisdiction: "Senate President · National Assembly",
  birthYear: 1962,
  imageSeed: "senate-1",
  imageUrl:
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT-kxeg-DtO4oM0WPtziDj-nlCOJDnMg6NYkXrm9W7-7QKVsfDEduqIsdloiecl5XuZF6hylOoFEMFFk3jdQ3WX9Ji78JVXLfNFnpAS150&s=10",
};

export const ALL_POLITICIANS: PolitilogPolitician[] = [
  PRESIDENT,
  VICE_PRESIDENT,
  SENATE_PRESIDENT,
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
    office: "minister_federal",
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

export function getPoliticianById(id: string): PolitilogPolitician | undefined {
  return ALL_POLITICIANS.find((p) => p.id === id);
}

export function getLocalSpotlight(lgaKey: string): PolitilogPolitician[] {
  return ALL_POLITICIANS.filter(
    (p) =>
      p.lgaKey === lgaKey &&
      p.office !== "president" &&
      (p.office === "lga_chair" ||
        p.office === "councillor" ||
        p.office === "house_of_reps" ||
        p.office === "state_assembly_member"),
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
    case "national": {
      const federalSlugs = new Set(
        POLITILOG_POLITICAL_ROLE_CATALOG.filter(
          (r) => r.tier === "federal",
        ).map((r) => r.id),
      );
      out = out.filter((p) => federalSlugs.has(p.office));
      break;
    }
    case "state":
      if (opts.stateName) {
        out = out.filter(
          (p) =>
            p.office === "president" ||
            p.office === "vice_president" ||
            p.office === "senate_president" ||
            p.stateName === opts.stateName,
        );
      }
      break;
    case "lga":
      if (opts.lgaKey) {
        out = out.filter(
          (p) =>
            p.lgaKey === opts.lgaKey ||
            p.office === "president" ||
            p.office === "vice_president" ||
            p.office === "senate_president",
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
  const entry = getPoliticalRoleCatalogEntry(office);
  if (entry) {
    if (office === "minister_federal") return "Minister";
    if (office === "senate_president") return "Senate President";
    if (office === "house_speaker") return "Speaker";
    if (office === "vice_president") return "Vice President";
    if (office === "deputy_governor") return "Deputy Governor";
    if (office === "state_assembly_member") return "State Assembly";
    if (office === "house_of_reps") return "Member, House of Rep";
    return entry.label.split("(")[0]?.trim() ?? entry.label;
  }
  return office;
}

/** Age in years from birth year (calendar year; not birthday-precise). */
export function ageFromBirthYear(
  birthYear: number,
  asOfYear = new Date().getFullYear(),
): number {
  return Math.max(0, asOfYear - birthYear);
}
