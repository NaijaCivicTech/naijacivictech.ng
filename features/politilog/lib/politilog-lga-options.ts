/**
 * State/LGA pairs for PolitiLog onboarding. Shared by client UI and server
 * residence API so we never import the full politician dataset on the server.
 */
export const POLITILOG_LGA_OPTIONS: { state: string; lga: string; key: string }[] =
  [
    { state: "Lagos", lga: "Surulere", key: "lagos-surulere" },
    { state: "Lagos", lga: "Ikeja", key: "lagos-ikeja" },
    { state: "FCT", lga: "Abaji", key: "fct-abaji" },
    { state: "Kano", lga: "Kano Municipal", key: "kano-municipal" },
    { state: "Rivers", lga: "Port Harcourt", key: "rivers-ph" },
  ];

export function findPolitilogLgaOption(
  state: string,
  lga: string,
): (typeof POLITILOG_LGA_OPTIONS)[number] | undefined {
  return POLITILOG_LGA_OPTIONS.find((o) => o.state === state && o.lga === lga);
}
