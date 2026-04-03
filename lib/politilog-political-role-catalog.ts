/**
 * Canonical political roles for proposed timeline rows — stable ids for filters and APIs.
 */

export type PolitilogPoliticalRoleCatalogId =
  | "president"
  | "senate"
  | "house_of_reps"
  | "governor"
  | "minister_federal"
  | "lga_chair"
  | "councillor";

export const POLITILOG_POLITICAL_ROLE_CATALOG: ReadonlyArray<{
  id: PolitilogPoliticalRoleCatalogId;
  /** Short label in the dropdown */
  label: string;
  /** Default timeline headline when this role is chosen */
  defaultHeadline: string;
}> = [
  {
    id: "president",
    label: "President & Commander-in-Chief",
    defaultHeadline: "President & Commander-in-Chief",
  },
  { id: "senate", label: "Senator", defaultHeadline: "Senator" },
  {
    id: "house_of_reps",
    label: "Member, House of Representatives",
    defaultHeadline: "Member, House of Representatives",
  },
  { id: "governor", label: "Governor (state)", defaultHeadline: "Governor" },
  {
    id: "minister_federal",
    label: "Federal minister",
    defaultHeadline: "Minister",
  },
  { id: "lga_chair", label: "LGA chairperson", defaultHeadline: "LGA Chairperson" },
  { id: "councillor", label: "Councillor", defaultHeadline: "Councillor" },
];

export function getPoliticalRoleCatalogEntry(
  id: PolitilogPoliticalRoleCatalogId,
): (typeof POLITILOG_POLITICAL_ROLE_CATALOG)[number] | undefined {
  return POLITILOG_POLITICAL_ROLE_CATALOG.find((r) => r.id === id);
}

export type PolitilogJurisdictionScope = "national" | "state" | "lga" | "custom";
