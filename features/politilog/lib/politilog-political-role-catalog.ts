/**
 * Canonical political offices for timeline rows, filters, and Mongo `political_offices`.
 * Stable `id` / slug is the join key for APIs and DB.
 */

export type PoliticalOfficeTier = "federal" | "state" | "lga";

export type PoliticalOfficeBranch =
  | "executive"
  | "legislature"
  | "judiciary"
  | "administration";

/** Legislative chamber or null for non-chamber roles. */
export type PoliticalOfficeBody =
  | "senate"
  | "house_of_reps"
  | "state_assembly"
  | null;

export type PoliticalOfficeSeatType =
  | "head_of_executive"
  | "deputy_head_of_executive"
  | "presiding_officer"
  | "elected_member"
  | "appointed_executive"
  | "local_executive"
  | "local_legislature";

export type PoliticalOfficeJurisdictionScope =
  | "national"
  | "state"
  | "lga"
  | "ward";

export type PolitilogPoliticalRoleCatalogEntry = {
  id: string;
  label: string;
  defaultHeadline: string;
  tier: PoliticalOfficeTier;
  branch: PoliticalOfficeBranch;
  body: PoliticalOfficeBody;
  seatType: PoliticalOfficeSeatType;
  jurisdictionScope: PoliticalOfficeJurisdictionScope;
  sortOrder: number;
};

export const POLITILOG_POLITICAL_ROLE_CATALOG: ReadonlyArray<PolitilogPoliticalRoleCatalogEntry> =
  [
    {
      id: "president",
      label: "President & Commander-in-Chief",
      defaultHeadline: "President & Commander-in-Chief",
      tier: "federal",
      branch: "executive",
      body: null,
      seatType: "head_of_executive",
      jurisdictionScope: "national",
      sortOrder: 10,
    },
    {
      id: "vice_president",
      label: "Vice President",
      defaultHeadline: "Vice President",
      tier: "federal",
      branch: "executive",
      body: null,
      seatType: "deputy_head_of_executive",
      jurisdictionScope: "national",
      sortOrder: 20,
    },
    {
      id: "minister_federal",
      label: "Federal minister",
      defaultHeadline: "Minister",
      tier: "federal",
      branch: "executive",
      body: null,
      seatType: "appointed_executive",
      jurisdictionScope: "national",
      sortOrder: 30,
    },
    {
      id: "senate_president",
      label: "President of the Senate",
      defaultHeadline: "President of the Senate",
      tier: "federal",
      branch: "legislature",
      body: "senate",
      seatType: "presiding_officer",
      jurisdictionScope: "national",
      sortOrder: 40,
    },
    {
      id: "senate",
      label: "Senator",
      defaultHeadline: "Senator",
      tier: "federal",
      branch: "legislature",
      body: "senate",
      seatType: "elected_member",
      jurisdictionScope: "national",
      sortOrder: 50,
    },
    {
      id: "house_speaker",
      label: "Speaker of the House of Representatives",
      defaultHeadline: "Speaker of the House",
      tier: "federal",
      branch: "legislature",
      body: "house_of_reps",
      seatType: "presiding_officer",
      jurisdictionScope: "national",
      sortOrder: 60,
    },
    {
      id: "house_of_reps",
      label: "Member, House of Representatives",
      defaultHeadline: "Member, House of Representatives",
      tier: "federal",
      branch: "legislature",
      body: "house_of_reps",
      seatType: "elected_member",
      jurisdictionScope: "national",
      sortOrder: 70,
    },
    {
      id: "governor",
      label: "Governor",
      defaultHeadline: "Governor",
      tier: "state",
      branch: "executive",
      body: null,
      seatType: "head_of_executive",
      jurisdictionScope: "state",
      sortOrder: 100,
    },
    {
      id: "deputy_governor",
      label: "Deputy Governor",
      defaultHeadline: "Deputy Governor",
      tier: "state",
      branch: "executive",
      body: null,
      seatType: "deputy_head_of_executive",
      jurisdictionScope: "state",
      sortOrder: 110,
    },
    {
      id: "state_assembly_member",
      label: "Member, State House of Assembly",
      defaultHeadline: "Member, State House of Assembly",
      tier: "state",
      branch: "legislature",
      body: "state_assembly",
      seatType: "elected_member",
      jurisdictionScope: "state",
      sortOrder: 120,
    },
    {
      id: "lga_chair",
      label: "LGA chairperson",
      defaultHeadline: "LGA Chairperson",
      tier: "lga",
      branch: "executive",
      body: null,
      seatType: "local_executive",
      jurisdictionScope: "lga",
      sortOrder: 200,
    },
    {
      id: "councillor",
      label: "Councillor",
      defaultHeadline: "Councillor",
      tier: "lga",
      branch: "legislature",
      body: null,
      seatType: "local_legislature",
      jurisdictionScope: "ward",
      sortOrder: 210,
    },
  ];

export type PolitilogPoliticalRoleCatalogId =
  (typeof POLITILOG_POLITICAL_ROLE_CATALOG)[number]["id"];

export function getPoliticalRoleCatalogEntry(
  id: PolitilogPoliticalRoleCatalogId,
): PolitilogPoliticalRoleCatalogEntry | undefined {
  return POLITILOG_POLITICAL_ROLE_CATALOG.find((r) => r.id === id);
}

export type PolitilogJurisdictionScope =
  | "national"
  | "state"
  | "lga"
  | "custom";
