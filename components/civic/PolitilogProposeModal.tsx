"use client";

import { lockBodyScroll, unlockBodyScroll } from "@/lib/body-scroll-lock";
import { cn } from "@/lib/cn";
import {
  getPoliticianById,
  type PolitilogPolitician,
} from "@/lib/politilog-data";
import { politilogProposeStore } from "@/lib/politilog-propose-store";
import {
  appendPolitilogProposal,
  type PolitilogProposalKind,
} from "@/lib/politilog-proposals-storage";
import {
  buildJurisdictionLabel,
  jurisdictionFormValid,
  lgasForState,
  uniqueStatesFromLgaOptions,
  type JurisdictionFormState,
} from "@/lib/politilog-proposal-jurisdiction";
import {
  getPoliticalRoleCatalogEntry,
  POLITILOG_POLITICAL_ROLE_CATALOG,
  type PolitilogJurisdictionScope,
  type PolitilogPoliticalRoleCatalogId,
} from "@/lib/politilog-political-role-catalog";
import {
  getTimelineForPolitician,
  segmentTypeLabel,
  type PolitilogSegmentType,
  type PolitilogTimelineSegment,
} from "@/lib/politilog-timeline";
import type { Session } from "next-auth";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";

const fieldInput =
  "w-full rounded-md border-[1.5px] border-line bg-paper px-3.5 py-2 font-sans text-[13px] text-ink outline-none transition-colors focus:border-brand";

const MAX_SOURCE_FIELDS = 12;

const KIND_OPTIONS: { value: PolitilogProposalKind; label: string }[] = [
  { value: "new_segment", label: "Add a timeline entry" },
  { value: "correct_segment", label: "Correct an existing entry" },
  { value: "add_sources", label: "Add sources or citations" },
  { value: "other", label: "Something else" },
];

const PROPOSAL_SEGMENT_TYPES: PolitilogSegmentType[] = [
  "political_office",
  "appointment",
  "employment",
  "education",
  "business",
  "civil_society",
  "other",
];

const JURISDICTION_SCOPE_OPTIONS: {
  value: PolitilogJurisdictionScope;
  label: string;
}[] = [
  { value: "national", label: "Federal / national" },
  { value: "state", label: "State-wide" },
  { value: "lga", label: "Local government (LGA) · optional ward" },
  { value: "custom", label: "Describe location (free text)" },
];

function segmentOptionLabel(s: PolitilogTimelineSegment): string {
  const range =
    s.endYear === null
      ? `${s.startYear} — present`
      : s.startYear === s.endYear
        ? `${s.startYear}`
        : `${s.startYear} — ${s.endYear}`;
  return `${s.title}${s.organization ? ` · ${s.organization}` : ""} (${segmentTypeLabel(s.type)} · ${range})`;
}

function isPoliticalSegmentType(t: PolitilogSegmentType): boolean {
  return t === "political_office" || t === "appointment";
}

function PolitilogProposeForm({
  politician,
  pathname,
  session,
}: {
  politician: PolitilogPolitician;
  pathname: string;
  session: Session | null;
}) {
  const timeline = getTimelineForPolitician(politician.id);
  const states = useMemo(() => uniqueStatesFromLgaOptions(), []);

  const [kind, setKind] = useState<PolitilogProposalKind>("new_segment");
  const [segmentId, setSegmentId] = useState<string>("");
  const [proposedSegmentType, setProposedSegmentType] =
    useState<PolitilogSegmentType>("political_office");
  const [politicalRoleId, setPoliticalRoleId] =
    useState<PolitilogPoliticalRoleCatalogId>("governor");
  const [proposedTitleNonPolitical, setProposedTitleNonPolitical] =
    useState("");
  const [organization, setOrganization] = useState("");
  const [jurisdiction, setJurisdiction] = useState<JurisdictionFormState>({
    scope: "national",
    state: "",
    lgaKey: "",
    ward: "",
    custom: "",
  });
  const [startYearStr, setStartYearStr] = useState("");
  const [endYearStr, setEndYearStr] = useState("");

  const [details, setDetails] = useState("");
  const [sources, setSources] = useState<string[]>([""]);
  const [touchedSubmit, setTouchedSubmit] = useState(false);
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">(
    "idle",
  );
  const [storageError, setStorageError] = useState(false);

  const lgaRows = useMemo(
    () => lgasForState(jurisdiction.state),
    [jurisdiction.state],
  );

  const noteOk = details.trim().length >= 10;
  const sourcesTrimmed = sources.map((s) => s.trim());
  const sourcesOk = sourcesTrimmed.filter((s) => s.length > 0).length >= 1;

  const jurisdictionLabel = useMemo(
    () => buildJurisdictionLabel(jurisdiction),
    [jurisdiction],
  );

  const structuredOk = useMemo(() => {
    if (kind !== "new_segment") return true;
    if (!proposedSegmentType) return false;
    const political = isPoliticalSegmentType(proposedSegmentType);
    if (political) {
      if (!politicalRoleId) return false;
    } else if (proposedTitleNonPolitical.trim().length < 2) {
      return false;
    }
    if (!jurisdictionFormValid(jurisdiction)) return false;
    const sy = Number.parseInt(startYearStr, 10);
    if (!Number.isFinite(sy) || sy < 1900 || sy > 2100) return false;
    if (endYearStr.trim()) {
      const ey = Number.parseInt(endYearStr, 10);
      if (!Number.isFinite(ey) || ey < sy || ey > 2100) return false;
    }
    return true;
  }, [
    kind,
    proposedSegmentType,
    politicalRoleId,
    proposedTitleNonPolitical,
    jurisdiction,
    startYearStr,
    endYearStr,
  ]);

  const formOk = noteOk && sourcesOk && structuredOk;

  const setSourceAt = useCallback((index: number, value: string) => {
    setSources((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }, []);

  const addSourceRow = useCallback(() => {
    setSources((prev) =>
      prev.length >= MAX_SOURCE_FIELDS ? prev : [...prev, ""],
    );
  }, []);

  const removeSourceRow = useCallback((index: number) => {
    setSources((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const onScopeChange = (scope: PolitilogJurisdictionScope) => {
    setJurisdiction((j) => {
      const next = { ...j, scope };
      if (scope === "national") {
        return { ...next, state: "", lgaKey: "", ward: "", custom: "" };
      }
      if (scope === "state") {
        return { ...next, lgaKey: "", ward: "", custom: "" };
      }
      if (scope === "lga") {
        return { ...next, custom: "" };
      }
      if (scope === "custom") {
        return { ...next, state: "", lgaKey: "", ward: "" };
      }
      return next;
    });
  };

  const onSubmit = useCallback(() => {
    setTouchedSubmit(true);
    if (!formOk) return;
    setStatus("saving");
    setStorageError(false);

    const political = isPoliticalSegmentType(proposedSegmentType);
    let proposedHeadline: string | null = null;
    if (kind === "new_segment") {
      if (political) {
        proposedHeadline =
          getPoliticalRoleCatalogEntry(politicalRoleId)?.defaultHeadline ??
          null;
      } else {
        proposedHeadline = proposedTitleNonPolitical.trim();
      }
    }

    const sy = Number.parseInt(startYearStr, 10);
    const endTrim = endYearStr.trim();
    const proposedEndYear =
      kind === "new_segment" && endTrim
        ? Number.parseInt(endTrim, 10)
        : kind === "new_segment"
          ? null
          : undefined;

    try {
      appendPolitilogProposal({
        politicianId: politician.id,
        politicianName: politician.name,
        kind,
        segmentId: segmentId || null,
        details: details.trim(),
        sources: sourcesTrimmed.filter(Boolean),
        ...(kind === "new_segment"
          ? {
              proposedSegmentType,
              politicalRoleId: political ? politicalRoleId : null,
              proposedHeadline,
              organization:
                organization.trim() !== "" ? organization.trim() : null,
              jurisdictionScope: jurisdiction.scope,
              jurisdictionState:
                jurisdiction.state !== "" ? jurisdiction.state : null,
              jurisdictionLgaKey:
                jurisdiction.lgaKey !== "" ? jurisdiction.lgaKey : null,
              jurisdictionWard: jurisdiction.ward,
              jurisdictionCustom: jurisdiction.custom,
              jurisdictionLabel: jurisdictionLabel || null,
              proposedStartYear: sy,
              proposedEndYear:
                proposedEndYear === undefined ? undefined : proposedEndYear,
            }
          : {}),
      });
      setStatus("done");
      window.setTimeout(() => politilogProposeStore.close(), 900);
    } catch (e) {
      if (e instanceof Error && e.message === "STORAGE_QUOTA") {
        setStorageError(true);
      }
      setStatus("error");
    }
  }, [
    formOk,
    kind,
    politician.id,
    politician.name,
    segmentId,
    details,
    sourcesTrimmed,
    proposedSegmentType,
    politicalRoleId,
    proposedTitleNonPolitical,
    organization,
    jurisdiction,
    jurisdictionLabel,
    startYearStr,
    endYearStr,
  ]);

  const showNewSegmentBlock = kind === "new_segment";
  const political = isPoliticalSegmentType(proposedSegmentType);

  return (
    <div
      role='dialog'
      aria-modal='true'
      aria-labelledby='politilog-propose-title'
      className='relative z-10 max-h-[min(90vh,720px)] w-full max-w-lg overflow-y-auto overscroll-y-contain rounded-xl border-[1.5px] border-line bg-card p-6 shadow-xl scrollbar-none [-webkit-overflow-scrolling:touch]'
    >
      <button
        type='button'
        className='absolute end-4 top-4 cursor-pointer border-none bg-transparent font-sans text-lg leading-none text-muted hover:text-ink'
        aria-label='Close'
        onClick={() => politilogProposeStore.close()}
      >
        ×
      </button>

      <p className='text-[10px] font-semibold uppercase tracking-[0.12em] text-brand'>
        PolitiLog
      </p>
      <h2
        id='politilog-propose-title'
        className='mt-1 font-display text-xl font-bold tracking-tight text-ink'
      >
        Propose an update
      </h2>
      <p className='mt-1 text-sm font-medium text-ink'>{politician.name}</p>
      <p className='mt-1 text-[13px] leading-relaxed text-muted'>
        Suggest a new timeline fact, a correction, or supporting sources.
        Reviewers will check submissions before anything goes public.
      </p>

      {!session?.user ? (
        <p className='mt-4 rounded-lg border border-line bg-paper2/80 px-3 py-2 text-xs leading-relaxed text-muted'>
          <Link
            href={`/login?callbackUrl=${encodeURIComponent(pathname)}`}
            className='font-semibold text-brand underline-offset-2 hover:underline'
          >
            Sign in
          </Link>{" "}
          to link this proposal to your account.
        </p>
      ) : null}

      <div className='mt-5'>
        <label className='block'>
          <span className='mb-1.5 block text-[11px] font-medium text-ink'>
            Type of update
          </span>
          <select
            className={fieldInput}
            value={kind}
            onChange={(e) => {
              const next = e.target.value as PolitilogProposalKind;
              setKind(next);
              if (next === "new_segment") setSegmentId("");
            }}
          >
            {KIND_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {timeline.length > 0 && kind !== "new_segment" ? (
        <label className='mt-4 block'>
          <span className='mb-1.5 block text-[11px] font-medium text-ink'>
            Related timeline entry{" "}
            <span className='font-normal text-muted'>(optional)</span>
          </span>
          <select
            className={fieldInput}
            value={segmentId}
            onChange={(e) => setSegmentId(e.target.value)}
          >
            <option value=''>— None / whole profile —</option>
            {timeline.map((s) => (
              <option key={s.id} value={s.id}>
                {segmentOptionLabel(s)}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      {showNewSegmentBlock ? (
        <div className='mt-5 space-y-4 rounded-xl border border-civic-blue/25 bg-civic-blue-soft/25 p-4'>
          <p className='font-sans text-[11px] font-bold uppercase tracking-wider text-civic-blue'>
            New timeline entry
          </p>

          <label className='block'>
            <span className='mb-1.5 block text-[11px] font-medium text-ink'>
              Segment category <span className='text-flame'>*</span>
            </span>
            <select
              className={cn(
                fieldInput,
                touchedSubmit &&
                  kind === "new_segment" &&
                  !proposedSegmentType &&
                  "border-flame/80",
              )}
              value={proposedSegmentType}
              onChange={(e) =>
                setProposedSegmentType(e.target.value as PolitilogSegmentType)
              }
            >
              {PROPOSAL_SEGMENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {segmentTypeLabel(t)}
                </option>
              ))}
            </select>
          </label>

          {political ? (
            <>
              <label className='block'>
                <span className='mb-1.5 block text-[11px] font-medium text-ink'>
                  Political office / role <span className='text-flame'>*</span>
                </span>
                <select
                  className={fieldInput}
                  value={politicalRoleId}
                  onChange={(e) =>
                    setPoliticalRoleId(
                      e.target.value as PolitilogPoliticalRoleCatalogId,
                    )
                  }
                >
                  {POLITILOG_POLITICAL_ROLE_CATALOG.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.label}
                    </option>
                  ))}
                </select>
                <p className='mt-1 text-[10px] leading-relaxed text-muted'>
                  Choose the closest role. If the exact title isn&apos;t listed,
                  describe it in <span className='font-medium text-ink/80'>Details</span>
                  — reviewers set the public headline on approval. The catalog
                  grows as admins add roles.
                </p>
              </label>
            </>
          ) : (
            <label className='block'>
              <span className='mb-1.5 block text-[11px] font-medium text-ink'>
                Proposed entry title <span className='text-flame'>*</span>
              </span>
              <input
                type='text'
                className={cn(
                  fieldInput,
                  touchedSubmit &&
                    proposedTitleNonPolitical.trim().length < 2 &&
                    "border-flame/80",
                )}
                value={proposedTitleNonPolitical}
                onChange={(e) => setProposedTitleNonPolitical(e.target.value)}
                maxLength={300}
                placeholder='e.g. B.Sc. Economics, University of Lagos'
              />
            </label>
          )}

          <label className='block'>
            <span className='mb-1.5 block text-[11px] font-medium text-ink'>
              Organization{" "}
              <span className='font-normal text-muted'>(optional)</span>
            </span>
            <input
              type='text'
              className={fieldInput}
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              maxLength={500}
              placeholder='Ministry, school, company, NGO…'
            />
          </label>

          <div>
            <span className='mb-1.5 block text-[11px] font-medium text-ink'>
              Where this was held <span className='text-flame'>*</span>
            </span>
            <select
              className={fieldInput}
              value={jurisdiction.scope}
              onChange={(e) =>
                onScopeChange(e.target.value as PolitilogJurisdictionScope)
              }
            >
              {JURISDICTION_SCOPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            {jurisdiction.scope === "state" ? (
              <label className='mt-3 block'>
                <span className='mb-1.5 block text-[11px] font-medium text-muted'>
                  State
                </span>
                <select
                  className={cn(
                    fieldInput,
                    touchedSubmit &&
                      !jurisdiction.state &&
                      "border-flame/80",
                  )}
                  value={jurisdiction.state}
                  onChange={(e) =>
                    setJurisdiction((j) => ({
                      ...j,
                      state: e.target.value,
                      lgaKey: "",
                      ward: "",
                    }))
                  }
                >
                  <option value=''>Select state</option>
                  {states.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
            {jurisdiction.scope === "lga" ? (
              <>
                <label className='mt-3 block'>
                  <span className='mb-1.5 block text-[11px] font-medium text-muted'>
                    State
                  </span>
                  <select
                    className={cn(
                      fieldInput,
                      touchedSubmit &&
                        !jurisdiction.state &&
                        "border-flame/80",
                    )}
                    value={jurisdiction.state}
                    onChange={(e) =>
                      setJurisdiction((j) => ({
                        ...j,
                        state: e.target.value,
                        lgaKey: "",
                        ward: "",
                      }))
                    }
                  >
                    <option value=''>Select state</option>
                    {states.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </label>
                <label className='mt-3 block'>
                  <span className='mb-1.5 block text-[11px] font-medium text-muted'>
                    LGA
                  </span>
                  <select
                    className={cn(
                      fieldInput,
                      touchedSubmit &&
                        !jurisdiction.lgaKey &&
                        "border-flame/80",
                    )}
                    value={jurisdiction.lgaKey}
                    onChange={(e) =>
                      setJurisdiction((j) => ({
                        ...j,
                        lgaKey: e.target.value,
                      }))
                    }
                    disabled={!jurisdiction.state}
                  >
                    <option value=''>Select LGA</option>
                    {lgaRows.map((o) => (
                      <option key={o.key} value={o.key}>
                        {o.lga}
                      </option>
                    ))}
                  </select>
                </label>
                <label className='mt-3 block'>
                  <span className='mb-1.5 block text-[11px] font-medium text-muted'>
                    Ward{" "}
                    <span className='font-normal text-muted'>(optional)</span>
                  </span>
                  <input
                    type='text'
                    className={fieldInput}
                    value={jurisdiction.ward}
                    onChange={(e) =>
                      setJurisdiction((j) => ({ ...j, ward: e.target.value }))
                    }
                    maxLength={120}
                    placeholder='e.g. Ward F'
                  />
                </label>
              </>
            ) : null}
            {jurisdiction.scope === "custom" ? (
              <label className='mt-3 block'>
                <span className='mb-1.5 block text-[11px] font-medium text-muted'>
                  Location description
                </span>
                <input
                  type='text'
                  className={cn(
                    fieldInput,
                    touchedSubmit &&
                      !jurisdiction.custom.trim() &&
                      "border-flame/80",
                  )}
                  value={jurisdiction.custom}
                  onChange={(e) =>
                    setJurisdiction((j) => ({ ...j, custom: e.target.value }))
                  }
                  maxLength={500}
                  placeholder='e.g. Chicago State University · USA'
                />
              </label>
            ) : null}
            {jurisdictionLabel ? (
              <p className='mt-2 rounded-md border border-line/80 bg-paper/80 px-2.5 py-1.5 font-sans text-[11px] text-muted'>
                <span className='font-semibold text-ink'>Preview:</span>{" "}
                {jurisdictionLabel}
              </p>
            ) : null}
          </div>

          <div className='grid gap-3 sm:grid-cols-2'>
            <label className='block'>
              <span className='mb-1.5 block text-[11px] font-medium text-ink'>
                Start year <span className='text-flame'>*</span>
              </span>
              <input
                type='text'
                inputMode='numeric'
                className={cn(
                  fieldInput,
                  touchedSubmit &&
                    (() => {
                      const y = Number.parseInt(startYearStr, 10);
                      return (
                        !Number.isFinite(y) || y < 1900 || y > 2100
                      );
                    })() &&
                    "border-flame/80",
                )}
                value={startYearStr}
                onChange={(e) => setStartYearStr(e.target.value)}
                placeholder='e.g. 2019'
                maxLength={4}
              />
            </label>
            <label className='block'>
              <span className='mb-1.5 block text-[11px] font-medium text-ink'>
                End year{" "}
                <span className='font-normal text-muted'>(blank = ongoing)</span>
              </span>
              <input
                type='text'
                inputMode='numeric'
                className={cn(
                  fieldInput,
                  touchedSubmit &&
                    endYearStr.trim() !== "" &&
                    (() => {
                      const sy = Number.parseInt(startYearStr, 10);
                      const ey = Number.parseInt(endYearStr, 10);
                      return (
                        !Number.isFinite(sy) ||
                        !Number.isFinite(ey) ||
                        ey < sy ||
                        ey > 2100
                      );
                    })() &&
                    "border-flame/80",
                )}
                value={endYearStr}
                onChange={(e) => setEndYearStr(e.target.value)}
                placeholder='Present'
                maxLength={4}
              />
            </label>
          </div>

          {touchedSubmit && !structuredOk ? (
            <p className='text-[11px] text-flame'>
              Complete segment category, location, years, and political role
              fields as required.
            </p>
          ) : null}
        </div>
      ) : null}

      <label className='mt-4 block'>
        <span className='mb-1.5 block text-[11px] font-medium text-ink'>
          Details <span className='text-flame'>*</span>
        </span>
        <textarea
          className={cn(
            fieldInput,
            "min-h-[100px] resize-y",
            touchedSubmit && !noteOk ? "border-flame/80" : "",
          )}
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          maxLength={2000}
          required
          placeholder='What should change or be added? Be specific.'
        />
        {touchedSubmit && !noteOk ? (
          <p className='mt-1 text-[11px] text-flame'>
            Add at least a short explanation (10+ characters).
          </p>
        ) : null}
      </label>

      <fieldset className='mt-4 min-w-0 border-none p-0'>
        <legend className='mb-2 block w-full text-[11px] font-medium text-ink'>
          Sources <span className='text-flame'>*</span>
          <span className='ms-1 font-normal text-muted'>
            — at least one link or citation
          </span>
        </legend>
        <ul className='flex flex-col gap-3'>
          {sources.map((value, index) => (
            <li
              key={index}
              className='flex flex-col gap-1.5 sm:flex-row sm:items-start sm:gap-2'
            >
              <label className='min-w-0 flex-1'>
                <span className='sr-only'>Source {index + 1}</span>
                <input
                  type='text'
                  className={cn(
                    fieldInput,
                    touchedSubmit &&
                      !sourcesOk &&
                      index === 0 &&
                      "border-flame/80",
                  )}
                  value={value}
                  onChange={(e) => setSourceAt(index, e.target.value)}
                  maxLength={2000}
                  placeholder={`Source ${index + 1}: URL or citation`}
                  autoComplete='off'
                  aria-invalid={touchedSubmit && !sourcesOk && index === 0}
                />
              </label>
              {sources.length > 1 ? (
                <button
                  type='button'
                  className='shrink-0 self-end font-sans text-[12px] font-semibold text-flame underline-offset-2 hover:underline sm:self-center'
                  onClick={() => removeSourceRow(index)}
                >
                  Remove
                </button>
              ) : null}
            </li>
          ))}
        </ul>
        {touchedSubmit && !sourcesOk ? (
          <p className='mt-2 text-[11px] text-flame'>
            Add at least one citation or link.
          </p>
        ) : null}
        {sources.length < MAX_SOURCE_FIELDS ? (
          <button
            type='button'
            className='mt-3 font-sans text-[12px] font-semibold text-brand underline-offset-2 hover:underline'
            onClick={addSourceRow}
          >
            + Add another source
          </button>
        ) : null}
      </fieldset>

      {status === "error" ? (
        <p className='mt-3 text-xs text-flame'>
          {storageError
            ? "Could not save. Shorten text or remove sources and try again."
            : "Could not save. Try again."}
        </p>
      ) : null}
      {status === "done" ? (
        <p className='mt-3 text-xs font-medium text-brand'>Thanks—submitted.</p>
      ) : null}

      <div className='mt-6 flex flex-wrap gap-2'>
        <button
          type='button'
          disabled={status === "saving" || status === "done"}
          className='inline-flex cursor-pointer items-center justify-center rounded-[5px] border-[1.5px] border-ink bg-ink px-5 py-2.5 font-sans text-[13px] font-medium text-paper transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-45'
          onClick={onSubmit}
        >
          {status === "saving" ? "Sending…" : "Submit proposal"}
        </button>
        <button
          type='button'
          className='inline-flex cursor-pointer items-center justify-center rounded-[5px] border-[1.5px] border-line-strong bg-transparent px-5 py-2.5 font-sans text-[13px] font-medium text-ink hover:border-ink'
          onClick={() => politilogProposeStore.close()}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export function PolitilogProposeModal() {
  const { open, politicianId } = useSyncExternalStore(
    politilogProposeStore.subscribe,
    politilogProposeStore.getSnapshot,
    politilogProposeStore.getServerSnapshot,
  );

  const { data: session } = useSession();
  const pathname = usePathname() ?? "/politilog";
  const politician =
    politicianId != null ? getPoliticianById(politicianId) : undefined;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") politilogProposeStore.close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    lockBodyScroll();
    return () => {
      unlockBodyScroll();
    };
  }, [open]);

  if (!open || !politician || !politicianId) {
    return null;
  }

  return (
    <div
      className='fixed inset-0 z-400 flex items-center justify-center p-4'
      role='presentation'
    >
      <button
        type='button'
        className='absolute inset-0 cursor-default bg-ink/40'
        aria-label='Close dialog'
        onClick={() => politilogProposeStore.close()}
      />
      <PolitilogProposeForm
        key={politicianId}
        politician={politician}
        pathname={pathname}
        session={session ?? null}
      />
    </div>
  );
}
