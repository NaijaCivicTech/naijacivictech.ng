"use client";

import { AuthorAvatar } from "@/components/civic/AuthorAvatar";
import { ProjectDetailModalSkeleton } from "@/components/civic/CivicLoadingSkeletons";
import { ProjectCommentsSection } from "@/components/civic/ProjectCommentsSection";
import type { CivicProject, ListingStatus, TeamRole } from "@/data/types";
import {
  useJoinTeamMutation,
  useSubmitIdeaMutation,
  useSubmitListingMutation,
} from "@/hooks/use-civic-mutations";
import { useCivicProjectDetail } from "@/hooks/use-civic-project-detail";
import { lockBodyScroll, unlockBodyScroll } from "@/lib/body-scroll-lock";
import { civicModalStore } from "@/lib/civic-modal-store";
import {
  PROJECT_CATEGORY_OPTIONS,
  ROLE_TAG_TW,
  formatPostedAt,
  initials,
} from "@/lib/civic-utils";
import { cn } from "@/lib/cn";
import { isValidEmail } from "@/lib/email";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";

const ROLE_OPTIONS = [
  "Frontend",
  "Backend",
  "Design",
  "PM",
  "Domain Expert",
  "Other",
] as const;

function pipelineStageLabel(stage: NonNullable<CivicProject["pipelineStage"]>) {
  if (stage === "suggested") return "Suggested";
  if (stage === "accepted") return "Accepted";
  if (stage === "building") return "In Progress";
  return "Live";
}

function overlayShell(open: boolean, children: ReactNode, id?: string) {
  return (
    <div
      id={id}
      role='presentation'
      className={cn(
        "fixed inset-0 z-400 items-center justify-center p-4",
        open ? "flex" : "hidden",
      )}
    >
      {children}
    </div>
  );
}

const fieldLabel =
  "mb-1.5 block text-[11px] font-medium uppercase tracking-[0.07em] text-ink";
const fieldInput =
  "w-full rounded-md border-[1.5px] border-line bg-paper px-3.5 py-2 font-sans text-[13px] text-ink outline-none transition-colors focus:border-brand";

const fieldError = "mt-1 text-xs text-flame";

const IDEA_CRITERIA_MAX = 20;
const IDEA_CRITERION_MAX_LEN = 400;

type ListingFormValues = {
  name: string;
  tagline: string;
  description: string;
  category: string;
  status: "" | ListingStatus;
  github: string;
  liveUrl: string;
  authorName: string;
  authorEmail: string;
};

type IdeaCriteriaRow = { text: string };

type IdeaFormValues = {
  title: string;
  problem: string;
  solution: string;
  category: string;
  urgency: string;
  criteria: IdeaCriteriaRow[];
  authorName: string;
  authorEmail: string;
};

type JoinFormValues = {
  role: string;
};

export function CivicModals() {
  const { data: session } = useSession();
  const isSignedIn = Boolean(session?.user?.id);

  const { modal, projectId, showTeamJoin } = useSyncExternalStore(
    civicModalStore.subscribe,
    civicModalStore.getSnapshot,
    civicModalStore.getServerSnapshot,
  );
  const {
    data: projectModalProject,
    isPending: projectDetailLoading,
    isError: projectDetailError,
    error: projectDetailErr,
  } = useCivicProjectDetail(projectId, modal === "project");
  const listingM = useSubmitListingMutation();
  const ideaM = useSubmitIdeaMutation();
  const teamM = useJoinTeamMutation();

  const listingForm = useForm<ListingFormValues>({
    defaultValues: {
      name: "",
      tagline: "",
      description: "",
      category: "",
      status: "",
      github: "",
      liveUrl: "",
      authorName: "",
      authorEmail: "",
    },
  });

  const ideaForm = useForm<IdeaFormValues>({
    defaultValues: {
      title: "",
      problem: "",
      solution: "",
      category: "",
      urgency: "",
      criteria: [{ text: "" }],
      authorName: "",
      authorEmail: "",
    },
  });

  const ideaCriteriaFields = useFieldArray({
    control: ideaForm.control,
    name: "criteria",
  });

  const joinForm = useForm<JoinFormValues>({
    defaultValues: { role: "" },
  });

  const joinRoleWatch = useWatch({ control: joinForm.control, name: "role" });

  const [submitOk, setSubmitOk] = useState(false);
  const [ideaOk, setIdeaOk] = useState(false);

  const handleClose = useCallback(() => {
    setSubmitOk(false);
    setIdeaOk(false);
    listingForm.reset();
    ideaForm.reset();
    joinForm.reset();
    civicModalStore.closeModals();
  }, [listingForm, ideaForm, joinForm]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleClose]);

  const anyModalOpen = modal !== "none";
  useEffect(() => {
    if (!anyModalOpen) return;
    lockBodyScroll();
    return () => {
      unlockBodyScroll();
    };
  }, [anyModalOpen]);

  const modalBase =
    "relative z-1 max-h-[90vh] w-full max-w-[580px] animate-civic-modal overflow-y-auto rounded-xl bg-card p-8";
  const closeBtn =
    "absolute right-4 top-4 cursor-pointer border-none bg-transparent p-1 text-lg leading-none text-muted";

  return (
    <>
      {overlayShell(
        modal === "choose",
        <>
          {modal === "choose" ? (
            <button
              type='button'
              className='absolute inset-0 cursor-pointer border-none bg-ink/72'
              aria-label='Close dialog'
              onClick={handleClose}
            />
          ) : null}
          <div className={cn(modalBase, "w-full max-w-[540px]")}>
            <button
              type='button'
              className={closeBtn}
              onClick={handleClose}
              aria-label='Close'
            >
              ✕
            </button>
            <div className='mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-brand'>
              Get Involved
            </div>
            <h2 className='mb-2 font-display text-[22px] font-extrabold tracking-tight'>
              How do you want to contribute?
            </h2>
            <p className='mb-6 text-[13px] font-light leading-relaxed text-muted'>
              Pick the path that fits you best.
            </p>
            <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
              <button
                type='button'
                className='cursor-pointer rounded-lg border-2 border-transparent bg-brand-soft p-6 text-left font-[inherit] transition-colors hover:border-brand'
                onClick={() => civicModalStore.openSubmit()}
              >
                <div className='mb-2 text-[26px]'>🛠️</div>
                <div className='mb-1 font-display text-[15px] font-bold'>
                  Submit Your Project
                </div>
                <div className='text-xs leading-snug text-muted'>
                  I already have something built or in progress
                </div>
              </button>
              <button
                type='button'
                className='cursor-pointer rounded-lg border-2 border-transparent bg-flame-soft p-6 text-left font-[inherit] transition-colors hover:border-flame'
                onClick={() => civicModalStore.openIdea()}
              >
                <div className='mb-2 text-[26px]'>💡</div>
                <div className='mb-1 font-display text-[15px] font-bold'>
                  Suggest an Idea
                </div>
                <div className='text-xs leading-snug text-muted'>
                  I have a problem in mind but no code yet
                </div>
              </button>
            </div>
          </div>
        </>,
        "overlayChoose",
      )}

      {overlayShell(
        modal === "submit",
        <>
          {modal === "submit" ? (
            <button
              type='button'
              className='absolute inset-0 cursor-pointer border-none bg-ink/72'
              aria-label='Close dialog'
              onClick={handleClose}
            />
          ) : null}
          <div
            className={modalBase}
            role='dialog'
            aria-modal='true'
            aria-labelledby='submit-title'
          >
            <button
              type='button'
              className={closeBtn}
              onClick={handleClose}
              aria-label='Close'
            >
              ✕
            </button>
            {!submitOk ? (
              <form
                className='contents'
                onSubmit={listingForm.handleSubmit(async (data) => {
                  try {
                    const nameT = data.authorName.trim();
                    const emailT = data.authorEmail.trim();
                    await listingM.mutateAsync({
                      name: data.name.trim(),
                      tagline: data.tagline.trim(),
                      description: data.description.trim(),
                      category: data.category.trim(),
                      status: data.status as ListingStatus,
                      github: data.github.trim(),
                      liveUrl: data.liveUrl.trim(),
                      ...(isSignedIn
                        ? {}
                        : {
                            authorName: nameT,
                            authorEmail: emailT,
                          }),
                    });
                    setSubmitOk(true);
                    listingForm.reset();
                  } catch (e) {
                    window.alert(
                      e instanceof Error
                        ? e.message
                        : "Could not submit project.",
                    );
                  }
                })}
              >
                <div className='mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-brand'>
                  Track 1: Submit Your Project
                </div>
                <h2
                  id='submit-title'
                  className='mb-2 font-display text-[22px] font-extrabold tracking-tight'
                >
                  List your project
                </h2>
                <p className='mb-6 text-[13px] font-light leading-relaxed text-muted'>
                  Open source tools, prototypes, or live platforms solving
                  Nigerian problems. We&apos;ll review and award a Verified
                  badge if it meets the criteria.
                </p>
                <div className='mb-4'>
                  <label className={fieldLabel} htmlFor='s-name'>
                    Project Name
                  </label>
                  <input
                    id='s-name'
                    className={fieldInput}
                    placeholder='e.g. eVote Nigeria'
                    {...listingForm.register("name", {
                      required: "Project name is required",
                    })}
                  />
                  {listingForm.formState.errors.name ? (
                    <p className={fieldError} role='alert'>
                      {listingForm.formState.errors.name.message}
                    </p>
                  ) : null}
                </div>
                <div className='mb-4'>
                  <label className={fieldLabel} htmlFor='s-tagline'>
                    What does it do? (one sentence)
                  </label>
                  <input
                    id='s-tagline'
                    className={fieldInput}
                    placeholder='Transparent digital voting with real-time ward results'
                    {...listingForm.register("tagline")}
                  />
                </div>
                <div className='mb-4'>
                  <label className={fieldLabel} htmlFor='s-desc'>
                    Full Description
                  </label>
                  <textarea
                    id='s-desc'
                    className={cn(fieldInput, "min-h-[75px] resize-y")}
                    placeholder='What problem does it solve? Who is it for?'
                    {...listingForm.register("description", {
                      required: "Description is required",
                    })}
                  />
                  {listingForm.formState.errors.description ? (
                    <p className={fieldError} role='alert'>
                      {listingForm.formState.errors.description.message}
                    </p>
                  ) : null}
                </div>
                <div className='mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2'>
                  <div>
                    <label className={fieldLabel} htmlFor='s-cat'>
                      Category
                    </label>
                    <select
                      id='s-cat'
                      className={fieldInput}
                      {...listingForm.register("category", {
                        required: "Pick a category",
                      })}
                    >
                      <option value=''>Select…</option>
                      {PROJECT_CATEGORY_OPTIONS.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                    {listingForm.formState.errors.category ? (
                      <p className={fieldError} role='alert'>
                        {listingForm.formState.errors.category.message}
                      </p>
                    ) : null}
                  </div>
                  <div>
                    <label className={fieldLabel} htmlFor='s-status'>
                      Status
                    </label>
                    <select
                      id='s-status'
                      className={fieldInput}
                      {...listingForm.register("status", {
                        required: "Pick a status",
                      })}
                    >
                      <option value=''>Select…</option>
                      <option value='Idea'>Idea</option>
                      <option value='Prototype'>Prototype</option>
                      <option value='Live'>Live</option>
                    </select>
                    {listingForm.formState.errors.status ? (
                      <p className={fieldError} role='alert'>
                        {listingForm.formState.errors.status.message}
                      </p>
                    ) : null}
                  </div>
                </div>
                <div className='mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2'>
                  <div>
                    <label className={fieldLabel} htmlFor='s-github'>
                      GitHub URL
                    </label>
                    <input
                      id='s-github'
                      type='url'
                      className={fieldInput}
                      placeholder='https://github.com/NaijaCivicTech/your-repo'
                      {...listingForm.register("github")}
                    />
                  </div>
                  <div>
                    <label className={fieldLabel} htmlFor='s-live'>
                      Live URL (if any)
                    </label>
                    <input
                      id='s-live'
                      type='url'
                      className={fieldInput}
                      placeholder='https://…'
                      {...listingForm.register("liveUrl")}
                    />
                  </div>
                </div>
                {isSignedIn ? (
                  <p className='mb-3 text-xs leading-relaxed text-muted'>
                    This listing will be attributed to your signed-in account.
                  </p>
                ) : null}
                {!isSignedIn ? (
                  <div className='mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2'>
                    <div>
                      <label className={fieldLabel} htmlFor='s-author-name'>
                        Your name
                      </label>
                      <input
                        id='s-author-name'
                        className={fieldInput}
                        placeholder='@handle or full name'
                        autoComplete='name'
                        {...listingForm.register("authorName", {
                          validate: (v) =>
                            (v?.trim()?.length ?? 0) > 0 ||
                            "Your name is required",
                        })}
                      />
                      {listingForm.formState.errors.authorName ? (
                        <p className={fieldError} role='alert'>
                          {listingForm.formState.errors.authorName.message}
                        </p>
                      ) : null}
                    </div>
                    <div>
                      <label className={fieldLabel} htmlFor='s-author-email'>
                        Email
                      </label>
                      <input
                        id='s-author-email'
                        type='email'
                        className={fieldInput}
                        placeholder='you@example.com'
                        autoComplete='email'
                        {...listingForm.register("authorEmail", {
                          validate: (v) => {
                            const t = (v ?? "").trim();
                            if (!t) return "Email is required";
                            return isValidEmail(t) || "Enter a valid email";
                          },
                        })}
                      />
                      {listingForm.formState.errors.authorEmail ? (
                        <p className={fieldError} role='alert'>
                          {listingForm.formState.errors.authorEmail.message}
                        </p>
                      ) : null}
                    </div>
                  </div>
                ) : null}
                <div className='mb-4 rounded-md bg-brand-soft px-4 py-3 text-xs leading-relaxed text-brand'>
                  <strong>Verified badge criteria:</strong> Open source on
                  GitHub · Addresses a Nigerian problem · Has a working demo or
                  prototype · README explains the problem and solution
                </div>
                <button
                  type='submit'
                  className={cn(
                    "mt-2 w-full cursor-pointer rounded-md border-none bg-brand py-3 font-sans text-[13px] font-medium text-white transition-opacity",
                    "hover:opacity-85 disabled:cursor-wait disabled:opacity-60",
                  )}
                  disabled={listingM.isPending}
                  aria-busy={listingM.isPending}
                >
                  {listingM.isPending ? "Submitting…" : "Submit for Review →"}
                </button>
              </form>
            ) : (
              <div className='px-4 py-8 text-center'>
                <div className='mb-4 text-[44px]'>🇳🇬</div>
                <h3 className='mb-2 font-display text-xl font-bold'>
                  Submitted! E don land.
                </h3>
                <p className='text-[13px] text-muted'>
                  Your project is under review. We&apos;ll check the Verified
                  criteria and list it within 48 hours. Thank you for building
                  for Nigeria.
                </p>
              </div>
            )}
          </div>
        </>,
      )}

      {overlayShell(
        modal === "idea",
        <>
          {modal === "idea" ? (
            <button
              type='button'
              className='absolute inset-0 cursor-pointer border-none bg-ink/72'
              aria-label='Close dialog'
              onClick={handleClose}
            />
          ) : null}
          <div
            className={modalBase}
            role='dialog'
            aria-modal='true'
            aria-labelledby='idea-title'
          >
            <button
              type='button'
              className={closeBtn}
              onClick={handleClose}
              aria-label='Close'
            >
              ✕
            </button>
            {!ideaOk ? (
              <form
                className='contents'
                onSubmit={ideaForm.handleSubmit(async (data) => {
                  try {
                    const nameT = data.authorName.trim();
                    const emailT = data.authorEmail.trim();
                    const criteria = data.criteria
                      .map((row) => row.text.trim())
                      .filter(Boolean);
                    await ideaM.mutateAsync({
                      title: data.title.trim(),
                      problem: data.problem.trim(),
                      solution: data.solution.trim(),
                      category: data.category.trim(),
                      ...(criteria.length > 0 ? { criteria } : {}),
                      ...(isSignedIn
                        ? {}
                        : {
                            authorName: nameT,
                            authorEmail: emailT,
                          }),
                    });
                    setIdeaOk(true);
                    ideaForm.reset();
                  } catch (e) {
                    window.alert(
                      e instanceof Error ? e.message : "Could not submit idea.",
                    );
                  }
                })}
              >
                <div className='mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-flame'>
                  Track 2: Suggest an Idea
                </div>
                <h2
                  id='idea-title'
                  className='mb-2 font-display text-[22px] font-extrabold tracking-tight'
                >
                  Drop your idea
                </h2>
                <p className='mb-6 text-[13px] font-light leading-relaxed text-muted'>
                  No code needed. Add a short title for the card, then describe
                  the problem and what a digital solution could look like.
                </p>
                <div className='mb-4'>
                  <label className={fieldLabel} htmlFor='i-title'>
                    Short title
                  </label>
                  <input
                    id='i-title'
                    type='text'
                    className={fieldInput}
                    maxLength={90}
                    placeholder='e.g. Public accountability for reps'
                    {...ideaForm.register("title", {
                      required: "Add a short title",
                      maxLength: {
                        value: 90,
                        message: "Title must be 90 characters or less",
                      },
                    })}
                  />
                  <p className='mt-1 text-[11px] text-muted'>
                    Shown on pipeline cards — keep it concise.
                  </p>
                  {ideaForm.formState.errors.title ? (
                    <p className={fieldError} role='alert'>
                      {ideaForm.formState.errors.title.message}
                    </p>
                  ) : null}
                </div>
                <div className='mb-4'>
                  <label className={fieldLabel} htmlFor='i-problem'>
                    What&apos;s the problem?
                  </label>
                  <textarea
                    id='i-problem'
                    className={cn(fieldInput, "min-h-[75px] resize-y")}
                    placeholder="e.g. There's no easy way to know if a politician actually showed up…"
                    {...ideaForm.register("problem", {
                      required: "Describe the problem",
                    })}
                  />
                  {ideaForm.formState.errors.problem ? (
                    <p className={fieldError} role='alert'>
                      {ideaForm.formState.errors.problem.message}
                    </p>
                  ) : null}
                </div>
                <div className='mb-4'>
                  <label className={fieldLabel} htmlFor='i-solution'>
                    What could the tool do?
                  </label>
                  <textarea
                    id='i-solution'
                    className={cn(fieldInput, "min-h-[75px] resize-y")}
                    placeholder='e.g. A searchable database of rep attendance…'
                    {...ideaForm.register("solution", {
                      required: "Describe the solution",
                    })}
                  />
                  {ideaForm.formState.errors.solution ? (
                    <p className={fieldError} role='alert'>
                      {ideaForm.formState.errors.solution.message}
                    </p>
                  ) : null}
                </div>
                <div className='mb-4'>
                  <span className={fieldLabel}>
                    Acceptance criteria{" "}
                    <span className='font-normal normal-case tracking-normal text-muted'>
                      (optional)
                    </span>
                  </span>
                  <p className='mb-3 text-[12px] leading-relaxed text-muted'>
                    What would &quot;done&quot; look like? Add bullet-style
                    checks builders can use later, e.g. open source, mobile
                    friendly, covers all states.
                  </p>
                  <div className='flex flex-col gap-2'>
                    {ideaCriteriaFields.fields.map((field, index) => {
                      const rowErr =
                        ideaForm.formState.errors.criteria?.[index]?.text;
                      return (
                        <div key={field.id} className='flex flex-col gap-1'>
                          <div className='flex gap-2'>
                            <input
                              type='text'
                              className={cn(fieldInput, "min-w-0 flex-1")}
                              placeholder={`Criterion ${index + 1}`}
                              aria-label={`Acceptance criterion ${index + 1}`}
                              aria-invalid={rowErr ? true : undefined}
                              {...ideaForm.register(`criteria.${index}.text`, {
                                maxLength: {
                                  value: IDEA_CRITERION_MAX_LEN,
                                  message: `Max ${IDEA_CRITERION_MAX_LEN} characters per line`,
                                },
                              })}
                            />
                            {ideaCriteriaFields.fields.length > 1 ? (
                              <button
                                type='button'
                                className='shrink-0 cursor-pointer rounded-md border border-line bg-paper px-2.5 py-2 font-sans text-[11px] font-semibold text-muted transition-colors hover:border-flame hover:text-flame'
                                onClick={() => ideaCriteriaFields.remove(index)}
                                aria-label={`Remove criterion ${index + 1}`}
                              >
                                Remove
                              </button>
                            ) : null}
                          </div>
                          {rowErr?.message ? (
                            <p className={fieldError} role='alert'>
                              {rowErr.message}
                            </p>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                  {ideaCriteriaFields.fields.length < IDEA_CRITERIA_MAX ? (
                    <button
                      type='button'
                      className='mt-2 cursor-pointer rounded-md border border-dashed border-line bg-transparent px-3 py-2 font-sans text-[12px] font-medium text-muted transition-colors hover:border-brand hover:text-brand'
                      onClick={() => ideaCriteriaFields.append({ text: "" })}
                    >
                      + Add criterion
                    </button>
                  ) : null}
                </div>
                <div className='mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2'>
                  <div>
                    <label className={fieldLabel} htmlFor='i-cat'>
                      Category
                    </label>
                    <select
                      id='i-cat'
                      className={fieldInput}
                      {...ideaForm.register("category", {
                        required: "Pick a category",
                      })}
                    >
                      <option value=''>Select…</option>
                      {PROJECT_CATEGORY_OPTIONS.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                    {ideaForm.formState.errors.category ? (
                      <p className={fieldError} role='alert'>
                        {ideaForm.formState.errors.category.message}
                      </p>
                    ) : null}
                  </div>
                  <div>
                    <label className={fieldLabel} htmlFor='i-urgency'>
                      How urgent is this?
                    </label>
                    <select
                      id='i-urgency'
                      className={fieldInput}
                      {...ideaForm.register("urgency")}
                    >
                      <option value=''>Select…</option>
                      <option value='critical'>Critical: lives at stake</option>
                      <option value='high'>
                        High: widespread daily impact
                      </option>
                      <option value='medium'>
                        Medium: important but not urgent
                      </option>
                      <option value='low'>Low: quality of life</option>
                    </select>
                  </div>
                </div>
                {isSignedIn ? (
                  <p className='mb-3 text-xs leading-relaxed text-muted'>
                    This idea will be attributed to your signed-in account.
                  </p>
                ) : null}
                {!isSignedIn ? (
                  <div className='mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2'>
                    <div>
                      <label className={fieldLabel} htmlFor='i-author-name'>
                        Your name
                      </label>
                      <input
                        id='i-author-name'
                        className={fieldInput}
                        placeholder='@handle or full name'
                        autoComplete='name'
                        {...ideaForm.register("authorName", {
                          validate: (v) =>
                            (v?.trim()?.length ?? 0) > 0 ||
                            "Your name is required",
                        })}
                      />
                      {ideaForm.formState.errors.authorName ? (
                        <p className={fieldError} role='alert'>
                          {ideaForm.formState.errors.authorName.message}
                        </p>
                      ) : null}
                    </div>
                    <div>
                      <label className={fieldLabel} htmlFor='i-author-email'>
                        Email
                      </label>
                      <input
                        id='i-author-email'
                        type='email'
                        className={fieldInput}
                        placeholder='you@example.com'
                        autoComplete='email'
                        {...ideaForm.register("authorEmail", {
                          validate: (v) => {
                            const t = (v ?? "").trim();
                            if (!t) return "Email is required";
                            return isValidEmail(t) || "Enter a valid email";
                          },
                        })}
                      />
                      {ideaForm.formState.errors.authorEmail ? (
                        <p className={fieldError} role='alert'>
                          {ideaForm.formState.errors.authorEmail.message}
                        </p>
                      ) : null}
                    </div>
                  </div>
                ) : null}
                <button
                  type='submit'
                  className={cn(
                    "mt-2 w-full cursor-pointer rounded-md border-none bg-ink py-3 font-sans text-[13px] font-medium text-paper transition-opacity",
                    "hover:opacity-85 disabled:cursor-wait disabled:opacity-60",
                  )}
                  disabled={ideaM.isPending}
                  aria-busy={ideaM.isPending}
                >
                  {ideaM.isPending ? "Submitting…" : "Submit Idea →"}
                </button>
              </form>
            ) : (
              <div className='px-4 py-8 text-center'>
                <div className='mb-4 text-[44px]'>💡</div>
                <h3 className='mb-2 font-display text-xl font-bold'>
                  Idea received!
                </h3>
                <p className='text-[13px] text-muted'>
                  It&apos;s now live in the pipeline under
                  &quot;Suggested&quot;. The community can upvote it; top ideas
                  get reviewed and built by a team.
                </p>
                <Link
                  href='/pipeline'
                  className='mt-4 inline-block rounded-md border border-line bg-paper px-4 py-2 text-[13px] font-medium text-ink hover:bg-line'
                >
                  View Pipeline →
                </Link>
              </div>
            )}
          </div>
        </>,
      )}

      {overlayShell(
        modal === "project" && Boolean(projectId),
        <>
          {modal === "project" && projectId ? (
            <button
              type='button'
              className='absolute inset-0 cursor-pointer border-none bg-ink/72'
              aria-label='Close dialog'
              onClick={handleClose}
            />
          ) : null}
          {modal === "project" && projectId ? (
            <div
              className={cn(modalBase, "max-w-[700px]")}
              role='dialog'
              aria-modal='true'
              aria-labelledby='project-detail-title'
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type='button'
                className={closeBtn}
                onClick={handleClose}
                aria-label='Close'
              >
                ✕
              </button>
              {projectDetailLoading ? (
                <ProjectDetailModalSkeleton />
              ) : projectDetailError ? (
                <div className='py-8 text-center text-sm text-flame'>
                  {projectDetailErr instanceof Error
                    ? projectDetailErr.message
                    : "Could not load project."}
                </div>
              ) : projectModalProject ? (
                <>
                  <div className='mb-6 flex flex-col md:flex-row gap-4 border-b border-line pb-6'>
                    <div className='flex size-[52px] shrink-0 items-center justify-center rounded-[10px] border border-line bg-paper text-2xl'>
                      {projectModalProject.icon}
                    </div>
                    <div className='min-w-0 flex-1'>
                      <h3
                        id='project-detail-title'
                        className='mb-1 font-display text-lg font-bold'
                      >
                        {projectModalProject.name}
                      </h3>
                      <div className='mb-2 flex w-full items-center justify-between gap-3 text-[10px]'>
                        <span className='shrink-0 font-medium uppercase tracking-wider text-muted'>
                          Posted {formatPostedAt(projectModalProject.postedAt)}
                        </span>
                        <div className='flex min-w-0 max-w-[55%] items-center justify-end gap-2 sm:max-w-[60%]'>
                          <AuthorAvatar
                            name={projectModalProject.authorName}
                            color={projectModalProject.authorColor}
                            image={projectModalProject.authorImage}
                            size='md'
                          />
                          <span
                            className='min-w-0 truncate text-right font-medium text-ink/80'
                            title={projectModalProject.authorName}
                          >
                            {projectModalProject.authorName}
                          </span>
                        </div>
                      </div>
                      {projectModalProject.request?.trim() ? (
                        <div className='mb-4 rounded-lg border border-line bg-paper px-4 py-3'>
                          <h4 className='mb-1.5 text-[11px] font-semibold uppercase tracking-[0.09em] text-muted'>
                            Request
                          </h4>
                          <p className='text-[13px] leading-relaxed text-ink'>
                            {projectModalProject.request.trim()}
                          </p>
                        </div>
                      ) : null}
                      {projectModalProject.request?.trim() ? (
                        <p className='mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted'>
                          Proposed approach
                        </p>
                      ) : null}
                      <p className='text-xs leading-snug text-muted'>
                        {projectModalProject.description}
                      </p>
                      <div className='mt-2 flex flex-wrap gap-1.5'>
                        <span className='rounded-full border border-line bg-transparent px-[7px] py-0.5 text-[9px] font-semibold uppercase tracking-wide text-muted'>
                          {projectModalProject.category}
                        </span>
                        {projectModalProject.verified ? (
                          <span className='inline-flex items-center gap-1 rounded-full border border-brand/20 bg-brand-soft px-2 py-0.5 text-[10px] font-semibold text-brand'>
                            ✓ Verified
                          </span>
                        ) : null}
                        {projectModalProject.pipelineStage ? (
                          <span className='rounded-full border border-line bg-paper px-[7px] py-0.5 text-[9px] font-semibold uppercase tracking-wide text-muted'>
                            {pipelineStageLabel(
                              projectModalProject.pipelineStage,
                            )}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                  {projectModalProject.criteria &&
                  projectModalProject.criteria.length > 0 ? (
                    <div className='border-b border-line'>
                      <div className='mb-6 rounded-lg border border-line bg-paper px-5 py-4'>
                        <h4 className='mb-3 text-[11px] font-semibold uppercase tracking-[0.09em] text-muted'>
                          Acceptance Criteria
                        </h4>
                        <div className='flex flex-col gap-1.5'>
                          {projectModalProject.criteria.map((c) => (
                            <div
                              key={c}
                              className='flex gap-2 text-xs leading-snug text-ink'
                            >
                              <span className='mt-px shrink-0 text-[13px] text-brand'>
                                ✓
                              </span>
                              {c}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : null}
                  <ProjectCommentsSection projectId={projectModalProject.id} />
                  {showTeamJoin ? (
                    <>
                      <div className='mb-6'>
                        <h4 className='mb-3 text-[11px] font-semibold uppercase tracking-[0.09em] text-muted'>
                          Current Team ({projectModalProject.teams.length})
                        </h4>
                        {projectModalProject.teams.length > 0 ? (
                          <div className='flex flex-col gap-2'>
                            {projectModalProject.teams.map((m) => (
                              <div
                                key={m.userId}
                                className='flex items-center justify-between rounded-md border border-line bg-paper px-3 py-2'
                              >
                                <div className='flex items-center gap-2'>
                                  {m.image ? (
                                    // eslint-disable-next-line @next/next/no-img-element -- remote Google avatars
                                    <img
                                      src={m.image}
                                      alt=''
                                      className='size-7 shrink-0 rounded-full object-cover'
                                    />
                                  ) : (
                                    <div
                                      className='flex size-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white'
                                      style={{ background: m.color }}
                                    >
                                      {initials(m.name)}
                                    </div>
                                  )}
                                  <div>
                                    <div className='text-[13px] font-medium'>
                                      {m.name}
                                    </div>
                                    <div className='text-[11px] text-muted'>
                                      {m.role}
                                    </div>
                                  </div>
                                </div>
                                <span
                                  className={cn(
                                    "rounded-full px-2 py-0.5 text-[10px] font-medium",
                                    ROLE_TAG_TW[m.role] ?? ROLE_TAG_TW.Domain,
                                  )}
                                >
                                  {m.role}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className='rounded-md border border-dashed border-line-strong bg-paper px-6 py-6 text-center text-[13px] text-muted'>
                            No team members yet. Be the first to join!
                          </div>
                        )}
                      </div>
                      {!isSignedIn ? (
                        <div className='rounded-md border border-dashed border-line-strong bg-paper px-4 py-5 text-center text-[13px] text-muted'>
                          <Link
                            href='/login'
                            className='font-medium text-brand no-underline hover:underline'
                          >
                            Sign in
                          </Link>{" "}
                          to join this team with your account.
                        </div>
                      ) : (
                        <form
                          className='contents'
                          onSubmit={joinForm.handleSubmit(async ({ role }) => {
                            if (!projectModalProject) return;
                            const mapped: TeamRole =
                              role === "Domain Expert"
                                ? "Domain"
                                : (role as TeamRole);
                            try {
                              await teamM.mutateAsync({
                                projectId: projectModalProject.id,
                                role: mapped,
                              });
                              joinForm.reset();
                            } catch (e) {
                              window.alert(
                                e instanceof Error
                                  ? e.message
                                  : "Could not join team.",
                              );
                            }
                          })}
                        >
                          <h4 className='mb-3 text-[11px] font-semibold uppercase tracking-[0.09em] text-muted'>
                            Join this team
                          </h4>
                          <input
                            type='hidden'
                            {...joinForm.register("role", {
                              validate: (v) =>
                                (typeof v === "string" && v.length > 0) ||
                                "Pick a role",
                            })}
                          />
                          <div className='mb-4 grid grid-cols-2 gap-2 sm:grid-cols-3'>
                            {ROLE_OPTIONS.map((r) => (
                              <button
                                key={r}
                                type='button'
                                className={cn(
                                  "cursor-pointer rounded-md border-[1.5px] border-line bg-transparent px-2 py-2 font-sans text-xs font-medium transition-colors hover:border-ink",
                                  joinRoleWatch === r &&
                                    "border-ink bg-ink text-paper",
                                )}
                                onClick={() =>
                                  joinForm.setValue("role", r, {
                                    shouldValidate: true,
                                    shouldDirty: true,
                                  })
                                }
                              >
                                {r}
                              </button>
                            ))}
                          </div>
                          {joinForm.formState.errors.role ? (
                            <p className={cn(fieldError, "mb-3")} role='alert'>
                              {joinForm.formState.errors.role.message}
                            </p>
                          ) : null}
                          {joinRoleWatch ? (
                            <button
                              type='submit'
                              className={cn(
                                "w-full cursor-pointer rounded-md border-none bg-ink py-3 font-sans text-[13px] font-medium text-paper transition-opacity",
                                "hover:opacity-85 disabled:cursor-wait disabled:opacity-60",
                              )}
                              disabled={teamM.isPending}
                              aria-busy={teamM.isPending}
                            >
                              {teamM.isPending ? "Joining…" : "Join Team →"}
                            </button>
                          ) : null}
                        </form>
                      )}
                    </>
                  ) : null}
                </>
              ) : null}
            </div>
          ) : null}
        </>,
      )}
    </>
  );
}
