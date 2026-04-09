import { POLITILOG_LGA_OPTIONS } from "@/features/politilog/lib/politilog-data";
import type { PolitilogJurisdictionScope } from "@/features/politilog/lib/politilog-political-role-catalog";

export function uniqueStatesFromLgaOptions(): string[] {
  return [...new Set(POLITILOG_LGA_OPTIONS.map((o) => o.state))].sort();
}

export function lgasForState(state: string) {
  return POLITILOG_LGA_OPTIONS.filter((o) => o.state === state);
}

export type JurisdictionFormState = {
  scope: PolitilogJurisdictionScope;
  state: string;
  lgaKey: string;
  ward: string;
  custom: string;
};

export function buildJurisdictionLabel(j: JurisdictionFormState): string {
  switch (j.scope) {
    case "national":
      return "Federal Republic of Nigeria";
    case "state":
      return j.state ? `${j.state} State` : "";
    case "lga": {
      if (!j.lgaKey) return "";
      const row = POLITILOG_LGA_OPTIONS.find((o) => o.key === j.lgaKey);
      if (!row) return "";
      const ward = j.ward.trim();
      return ward
        ? `${row.lga} · Ward ${ward} · ${row.state}`
        : `${row.lga}, ${row.state}`;
    }
    case "custom":
      return j.custom.trim();
    default:
      return "";
  }
}

export function jurisdictionFormValid(j: JurisdictionFormState): boolean {
  switch (j.scope) {
    case "national":
      return true;
    case "state":
      return Boolean(j.state.trim());
    case "lga":
      return Boolean(j.lgaKey);
    case "custom":
      return Boolean(j.custom.trim());
    default:
      return false;
  }
}
