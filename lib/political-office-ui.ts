/** Human-readable political-office enum segment for display (underscores → spaces). */
export function formatPoliticalOfficeEnumForUi(value: string): string {
  return value.replaceAll("_", " ");
}

/** First character uppercased; rest lowercased, after underscore → space. */
export function sentenceCasePoliticalOfficePhrase(value: string): string {
  const t = formatPoliticalOfficeEnumForUi(value).trim();
  if (!t) return t;
  return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
}

/** Jurisdiction scope label for compact UI (e.g. badges). */
export function formatJurisdictionScopeForUi(scope: string): string {
  const s = formatPoliticalOfficeEnumForUi(scope).toLowerCase();
  if (s === "lga") return "LGA";
  if (s === "national") return "National";
  if (s === "state") return "State";
  if (s === "ward") return "Ward";
  return sentenceCasePoliticalOfficePhrase(scope);
}
