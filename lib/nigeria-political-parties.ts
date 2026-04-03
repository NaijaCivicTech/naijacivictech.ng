/**
 * Registered political parties (acronyms + full names).
 * Source metadata: INEC Nigeria, 2024/2025 updates.
 */

export const NIGERIA_POLITICAL_PARTIES_META = {
  country: "Nigeria",
  dataSource: "INEC Nigeria (as of 2024/2025 updates)",
} as const;

export const NIGERIA_POLITICAL_PARTIES = [
  { acronym: "A", name: "Accord" },
  { acronym: "AA", name: "Action Alliance" },
  { acronym: "AAC", name: "African Action Congress" },
  { acronym: "ADC", name: "African Democratic Congress" },
  { acronym: "ADP", name: "Action Democratic Party" },
  { acronym: "APC", name: "All Progressives Congress" },
  { acronym: "APGA", name: "All Progressives Grand Alliance" },
  { acronym: "APM", name: "Allied Peoples Movement" },
  { acronym: "APP", name: "Action Peoples Party" },
  { acronym: "BP", name: "Boot Party" },
  { acronym: "LP", name: "Labour Party" },
  { acronym: "NRM", name: "National Rescue Movement" },
  { acronym: "NNPP", name: "New Nigeria Peoples Party" },
  { acronym: "PDP", name: "Peoples Democratic Party" },
  { acronym: "PRP", name: "Peoples Redemption Party" },
  { acronym: "SDP", name: "Social Democratic Party" },
  { acronym: "YPP", name: "Young Progressives Party" },
  { acronym: "YP", name: "Youth Party" },
  { acronym: "ZLP", name: "Zenith Labour Party" },
] as const;

export type NigeriaPartyAcronym =
  (typeof NIGERIA_POLITICAL_PARTIES)[number]["acronym"];

/** Filter chips: all parties, then every acronym (order matches INEC list). */
export const POLITILOG_PARTY_FILTERS = [
  "all",
  ...NIGERIA_POLITICAL_PARTIES.map((p) => p.acronym),
] as const;

export type PolitilogPartyFilterOption =
  (typeof POLITILOG_PARTY_FILTERS)[number];

const byAcronym = Object.fromEntries(
  NIGERIA_POLITICAL_PARTIES.map((p) => [p.acronym, p.name]),
) as Record<NigeriaPartyAcronym, string>;

/** Full party name for tooltips / detail views. */
export function partyFullName(acronym: NigeriaPartyAcronym): string {
  return byAcronym[acronym] ?? acronym;
}
