import type {
  CreateIdeaBody,
  CreateListingBody,
  CreateProjectAuthContext,
} from "@/data/create-project";
import type { CivicProject, ListingStatus } from "@/data/types";
import { pickRandomIconForCategory } from "@/data/project-icons";
import { COLOR_POOL } from "@/data/projects";
import { isValidEmail, normalizeEmail } from "@/lib/email";
import { GITHUB_ORG_URL } from "@/lib/site-urls";
import { insertProject, slugExists } from "@/lib/services/server/projects";

export type { CreateProjectAuthContext } from "@/data/create-project";

const LISTING_STATUSES: ListingStatus[] = ["Idea", "Prototype", "Live"];

function isListingStatus(v: unknown): v is ListingStatus {
  return typeof v === "string" && LISTING_STATUSES.includes(v as ListingStatus);
}

async function uniqueSlug(base: string): Promise<string> {
  const root = base || `project-${Date.now()}`;
  let candidate = root;
  let n = 0;
  while (await slugExists(candidate)) {
    n += 1;
    candidate = `${root}-${n}`;
  }
  return candidate;
}

const MAX_CRITERIA = 20;
const MAX_CRITERION_LEN = 400;

const MAX_LISTING_NAME = 200;
const MAX_TAGLINE = 400;
const MAX_DESCRIPTION = 8000;
const MAX_URL = 2048;
const MAX_AUTHOR_NAME = 120;
const MAX_IDEA_TITLE = 90;
const MAX_IDEA_PROBLEM = 2000;
const MAX_IDEA_SOLUTION = 8000;

function assertMaxLen(field: string, value: string, max: number) {
  if (value.length > max) {
    throw new Error(`${field} must be at most ${max} characters`);
  }
}

function parseCriteriaList(raw: unknown): string[] {
  if (raw == null) return [];
  if (!Array.isArray(raw)) return [];
  const out: string[] = [];
  for (const item of raw) {
    if (typeof item !== "string") continue;
    const t = item.trim();
    if (!t) continue;
    if (t.length > MAX_CRITERION_LEN) {
      throw new Error(
        `Each acceptance criterion must be at most ${MAX_CRITERION_LEN} characters`,
      );
    }
    out.push(t);
    if (out.length > MAX_CRITERIA) {
      throw new Error(`At most ${MAX_CRITERIA} acceptance criteria allowed`);
    }
  }
  return out;
}

export function parseCreateListingBody(body: unknown): CreateListingBody {
  if (!body || typeof body !== "object") throw new Error("Invalid body");
  const o = body as Record<string, unknown>;
  if (o.kind !== "listing") throw new Error("Expected kind listing");

  const name = typeof o.name === "string" ? o.name.trim() : "";
  if (!name) throw new Error("Name is required");
  assertMaxLen("Name", name, MAX_LISTING_NAME);

  const category = typeof o.category === "string" ? o.category.trim() : "";
  if (!category) throw new Error("Category is required");
  assertMaxLen("Category", category, 80);

  if (!isListingStatus(o.status)) throw new Error("Invalid listing status");

  const tagline = typeof o.tagline === "string" ? o.tagline.trim() : "";
  const description =
    typeof o.description === "string" ? o.description.trim() : "";
  const github = typeof o.github === "string" ? o.github.trim() : "";
  const liveUrl = typeof o.liveUrl === "string" ? o.liveUrl.trim() : "";
  assertMaxLen("Tagline", tagline, MAX_TAGLINE);
  assertMaxLen("Description", description, MAX_DESCRIPTION);
  assertMaxLen("GitHub URL", github, MAX_URL);
  assertMaxLen("Live URL", liveUrl, MAX_URL);
  const authorName =
    typeof o.authorName === "string" ? o.authorName.trim() : undefined;
  const authorEmail =
    typeof o.authorEmail === "string" ? o.authorEmail.trim() : undefined;
  if (authorName) assertMaxLen("Author name", authorName, MAX_AUTHOR_NAME);

  return {
    kind: "listing",
    name,
    tagline,
    description,
    category,
    status: o.status,
    github,
    liveUrl,
    ...(authorName !== undefined && authorName !== "" ? { authorName } : {}),
    ...(authorEmail !== undefined && authorEmail !== ""
      ? { authorEmail }
      : {}),
  };
}

export function parseCreateIdeaBody(body: unknown): CreateIdeaBody {
  if (!body || typeof body !== "object") throw new Error("Invalid body");
  const o = body as Record<string, unknown>;
  if (o.kind !== "idea") throw new Error("Expected kind idea");

  const title = typeof o.title === "string" ? o.title.trim() : "";
  if (!title) throw new Error("Title is required");
  assertMaxLen("Title", title, MAX_IDEA_TITLE);

  const problem = typeof o.problem === "string" ? o.problem.trim() : "";
  if (!problem) throw new Error("Problem is required");
  assertMaxLen("Problem", problem, MAX_IDEA_PROBLEM);

  const solution = typeof o.solution === "string" ? o.solution.trim() : "";
  if (!solution) throw new Error("Solution is required");
  assertMaxLen("Solution", solution, MAX_IDEA_SOLUTION);

  const category = typeof o.category === "string" ? o.category.trim() : "";
  if (!category) throw new Error("Category is required");
  assertMaxLen("Category", category, 80);

  const authorName =
    typeof o.authorName === "string" ? o.authorName.trim() : undefined;
  const authorEmail =
    typeof o.authorEmail === "string" ? o.authorEmail.trim() : undefined;
  if (authorName) assertMaxLen("Author name", authorName, MAX_AUTHOR_NAME);

  const criteria = parseCriteriaList(o.criteria);

  return {
    kind: "idea",
    title,
    problem,
    solution,
    category,
    ...(criteria.length > 0 ? { criteria } : {}),
    ...(authorName !== undefined && authorName !== "" ? { authorName } : {}),
    ...(authorEmail !== undefined && authorEmail !== ""
      ? { authorEmail }
      : {}),
  };
}

export async function createListingFromBody(
  body: CreateListingBody,
  authCtx: CreateProjectAuthContext,
): Promise<CivicProject> {
  const authorNameRaw = body.authorName?.trim() ?? "";
  const authorEmailRaw = body.authorEmail?.trim() ?? "";

  let authorName: string;
  let authorEmail: string | null;
  let user: string | null;

  if (authCtx.userId) {
    user = authCtx.userId;
    authorName =
      authorNameRaw ||
      (authCtx.userName?.trim() ?? "") ||
      (authCtx.userEmail?.split("@")[0] ?? "Member");
    authorEmail =
      authorEmailRaw && isValidEmail(authorEmailRaw)
        ? normalizeEmail(authorEmailRaw)
        : authCtx.userEmail
          ? normalizeEmail(authCtx.userEmail)
          : null;
  } else {
    if (!authorNameRaw) throw new Error("Author name is required");
    if (!isValidEmail(authorEmailRaw)) {
      throw new Error("A valid author email is required when not signed in");
    }
    user = null;
    authorName = authorNameRaw;
    authorEmail = normalizeEmail(authorEmailRaw);
  }

  const tagline = body.tagline.trim();
  const description = body.description.trim();
  const github = body.github.trim();
  const liveUrl = body.liveUrl.trim();

  const slugBase = body.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const slug = await uniqueSlug(slugBase || `project-${Date.now()}`);

  const authorVotes = authCtx.userId ? 1 : 0;
  const voterIds = authCtx.userId ? [authCtx.userId] : [];

  const project = {
    slug,
    icon: pickRandomIconForCategory(body.category),
    name: body.name,
    description: tagline || description,
    category: body.category,
    votes: authorVotes,
    voterIds,
    user,
    authorEmail,
    authorName,
    authorColor: COLOR_POOL[Math.floor(Math.random() * COLOR_POOL.length)]!,
    teams: [],
    verified: false,
    github: github || GITHUB_ORG_URL,
    liveUrl: liveUrl || null,
    listingStatus: body.status,
    listingApprovedAt: null,
  };

  return insertProject(project, authCtx.userId ?? null);
}

export async function createIdeaFromBody(
  body: CreateIdeaBody,
  authCtx: CreateProjectAuthContext,
): Promise<CivicProject> {
  const authorNameRaw = body.authorName?.trim() ?? "";
  const authorEmailRaw = body.authorEmail?.trim() ?? "";

  let authorName: string;
  let authorEmail: string | null;
  let user: string | null;

  if (authCtx.userId) {
    user = authCtx.userId;
    authorName =
      authorNameRaw ||
      (authCtx.userName?.trim() ?? "") ||
      (authCtx.userEmail?.split("@")[0] ?? "Member");
    authorEmail =
      authorEmailRaw && isValidEmail(authorEmailRaw)
        ? normalizeEmail(authorEmailRaw)
        : authCtx.userEmail
          ? normalizeEmail(authCtx.userEmail)
          : null;
  } else {
    if (!authorNameRaw) throw new Error("Author name is required");
    if (!isValidEmail(authorEmailRaw)) {
      throw new Error("A valid author email is required when not signed in");
    }
    user = null;
    authorName = authorNameRaw;
    authorEmail = normalizeEmail(authorEmailRaw);
  }

  const slugBase = body.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const slug = await uniqueSlug(slugBase || `idea-${Date.now()}`);

  const authorVotes = authCtx.userId ? 1 : 0;
  const voterIds = authCtx.userId ? [authCtx.userId] : [];

  const project = {
    slug,
    icon: pickRandomIconForCategory(body.category),
    name: body.title,
    description: body.solution,
    request: body.problem,
    category: body.category,
    votes: authorVotes,
    voterIds,
    user,
    authorEmail,
    authorName,
    authorColor: COLOR_POOL[Math.floor(Math.random() * COLOR_POOL.length)]!,
    teams: [],
    verified: false,
    github: null,
    liveUrl: null,
    pipelineStage: "suggested" as const,
    ...(body.criteria != null && body.criteria.length > 0
      ? { criteria: body.criteria }
      : {}),
  };

  return insertProject(project, authCtx.userId ?? null);
}
