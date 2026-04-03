import type {
  CivicProject,
  ProjectTeamSlot,
  TeamMember,
  TeamRole,
} from "@/data/types";
import { COLOR_POOL } from "@/data/projects";
import { avatarColorFromSeed } from "@/lib/civic-utils";
import { connectMongoose } from "@/lib/mongoose";
import { ProjectModel, UserModel } from "@/lib/models";
import mongoose from "mongoose";

const TEAM_ROLES: TeamRole[] = [
  "Frontend",
  "Backend",
  "Design",
  "PM",
  "Domain",
  "Other",
];

export function isTeamRole(v: unknown): v is TeamRole {
  return typeof v === "string" && TEAM_ROLES.includes(v as TeamRole);
}

export function parseProjectObjectId(
  raw: string,
): mongoose.Types.ObjectId | null {
  if (!mongoose.Types.ObjectId.isValid(raw)) return null;
  const oid = new mongoose.Types.ObjectId(raw);
  if (oid.toString() !== raw) return null;
  return oid;
}

function ownerUserIdFromDoc(doc: Record<string, unknown>): string | null {
  const u = doc.user;
  return typeof u === "string" && u.trim() ? u.trim() : null;
}

function parseTeamSlots(raw: unknown): ProjectTeamSlot[] {
  if (!Array.isArray(raw)) return [];
  const out: ProjectTeamSlot[] = [];
  for (const t of raw) {
    if (!t || typeof t !== "object") continue;
    const o = t as Record<string, unknown>;
    if (typeof o.userId === "string" && isTeamRole(o.role)) {
      out.push({ userId: o.userId, role: o.role });
    }
  }
  return out;
}

function userIdsForProjectDocs(docs: Record<string, unknown>[]): string[] {
  const ids = new Set<string>();
  for (const d of docs) {
    for (const s of parseTeamSlots(d.teams)) ids.add(s.userId);
    const o = ownerUserIdFromDoc(d);
    if (o) ids.add(o);
  }
  return [...ids];
}

/** Public label: linked account profile name, else stored submission author. */
function displayAuthorNameForDto(
  ownerId: string | null,
  storedAuthorName: string,
  byId: Map<string, UserBrief>,
): string {
  const stored = storedAuthorName.trim();
  if (!ownerId) return stored || "Member";
  const u = byId.get(ownerId);
  if (!u) return stored || "Member";
  const n = typeof u.name === "string" ? u.name.trim() : "";
  if (n) return n;
  const em = typeof u.email === "string" ? u.email.trim() : "";
  if (em.includes("@")) {
    const local = em.split("@")[0]?.trim();
    if (local) return local;
  }
  return stored || "Member";
}

function avatarColorForUserId(userId: string): string {
  let h = 0;
  for (let i = 0; i < userId.length; i++) {
    h = (h * 31 + userId.charCodeAt(i)) | 0;
  }
  const idx = Math.abs(h) % COLOR_POOL.length;
  return COLOR_POOL[idx]!;
}

type UserBrief = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

async function fetchUserMap(hexIds: string[]): Promise<Map<string, UserBrief>> {
  const map = new Map<string, UserBrief>();
  const unique = [...new Set(hexIds)];
  if (unique.length === 0) return map;
  await connectMongoose();
  const oids = unique
    .map((id) => parseProjectObjectId(id))
    .filter((x): x is mongoose.Types.ObjectId => x != null);
  if (oids.length === 0) return map;
  const users = await UserModel.find({ _id: { $in: oids } })
    .select("name email image")
    .lean()
    .exec();
  for (const u of users) {
    const id =
      u._id instanceof mongoose.Types.ObjectId
        ? u._id.toHexString()
        : String(u._id);
    map.set(id, {
      name: u.name,
      email: u.email,
      image: u.image,
    });
  }
  return map;
}

function slotsToTeamMembers(
  slots: ProjectTeamSlot[],
  byId: Map<string, UserBrief>,
): TeamMember[] {
  return slots.map((s) => {
    const u = byId.get(s.userId);
    const name =
      (typeof u?.name === "string" && u.name.trim()) ||
      (typeof u?.email === "string" ? u.email.split("@")[0] : "") ||
      "Member";
    return {
      userId: s.userId,
      role: s.role,
      name,
      image: typeof u?.image === "string" && u.image ? u.image : null,
      color: avatarColorForUserId(s.userId),
    };
  });
}

function postedAtIsoFromId(raw: unknown): string {
  if (raw instanceof mongoose.Types.ObjectId) {
    return raw.getTimestamp().toISOString();
  }
  if (typeof raw === "string" && mongoose.Types.ObjectId.isValid(raw)) {
    return new mongoose.Types.ObjectId(raw).getTimestamp().toISOString();
  }
  return new Date().toISOString();
}

async function docToProject(
  doc: Record<string, unknown>,
  userMap?: Map<string, UserBrief>,
  viewerUserId?: string | null,
): Promise<CivicProject> {
  const raw = doc._id;
  const postedAt = postedAtIsoFromId(raw);
  let id: string;
  if (typeof raw === "string") {
    id = raw;
  } else if (
    raw != null &&
    typeof raw === "object" &&
    "toHexString" in raw
  ) {
    id = (raw as mongoose.Types.ObjectId).toHexString();
  } else {
    id = String(raw ?? "");
  }
  const ownerId = ownerUserIdFromDoc(doc);
  const authorEmailForSeed =
    typeof doc.authorEmail === "string" && doc.authorEmail.trim()
      ? doc.authorEmail.trim().toLowerCase()
      : null;
  const storedAuthorImage =
    typeof doc.authorImage === "string" && doc.authorImage.trim()
      ? doc.authorImage.trim()
      : null;

  const { _id: _drop, authorEmail: _email, author: legacyAuthor, ...rest } =
    doc;
  void _drop;
  void _email;
  const authorName =
    typeof rest.authorName === "string" && rest.authorName
      ? rest.authorName
      : typeof legacyAuthor === "string"
        ? legacyAuthor
        : "";
  const {
    authorName: _an,
    teams: _teamsRaw,
    voterIds: rawVoterIds,
    ...withoutNameTeamsVoters
  } = rest as Record<string, unknown>;
  void _an;
  const voterIds = Array.isArray(rawVoterIds)
    ? rawVoterIds.filter((x): x is string => typeof x === "string")
    : [];
  const slots = parseTeamSlots(_teamsRaw);
  const idsForMap = [...new Set([...slots.map((s) => s.userId), ...(ownerId ? [ownerId] : [])])];
  const byId = userMap ?? (await fetchUserMap(idsForMap));
  const teams = slotsToTeamMembers(slots, byId);
  const viewerHasVoted =
    viewerUserId != null && voterIds.includes(viewerUserId);

  const colorSeed =
    ownerId ?? authorEmailForSeed ?? (authorName.trim() || "anon");
  const authorColor = avatarColorFromSeed(colorSeed);

  const ownerBrief = ownerId ? byId.get(ownerId) : undefined;
  const imageFromUser =
    ownerBrief?.image &&
    typeof ownerBrief.image === "string" &&
    ownerBrief.image.trim()
      ? ownerBrief.image.trim()
      : null;
  const authorImage = imageFromUser ?? storedAuthorImage ?? null;

  const authorNameForDisplay = displayAuthorNameForDto(
    ownerId,
    authorName,
    byId,
  );

  return {
    ...withoutNameTeamsVoters,
    id,
    authorName: authorNameForDisplay,
    authorColor,
    authorImage,
    postedAt,
    teams,
    ...(viewerUserId != null ? { viewerHasVoted } : {}),
  } as CivicProject;
}

export const PUBLIC_PROJECT_FILTER = {
  $or: [
    {
      pipelineStage: {
        $in: ["suggested", "accepted", "building", "live"] as const,
      },
    },
    {
      listingStatus: { $in: ["Idea", "Prototype", "Live"] as const },
      listingApprovedAt: { $type: "date" },
    },
  ],
} as const;

const PUBLIC_MATCH = PUBLIC_PROJECT_FILTER as unknown as Record<string, unknown>;

async function isPublicProject(oid: mongoose.Types.ObjectId): Promise<boolean> {
  const n = await ProjectModel.countDocuments({
    $and: [{ _id: oid }, PUBLIC_MATCH],
  }).exec();
  return n > 0;
}

const PIPELINE_STAGES = [
  "suggested",
  "accepted",
  "building",
  "live",
] as const;

const DIRECTORY_LISTED_MATCH = {
  listingStatus: { $in: ["Idea", "Prototype", "Live"] as const },
  listingApprovedAt: { $type: "date" },
} as const;

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export type ProjectListSort = "latest" | "oldest" | "votes";

export type ListProjectsPageParams = {
  scope: "directory" | "pipeline";
  limit: number;
  cursor?: string | null;
  sort?: ProjectListSort;
  category?: string | null;
  search?: string | null;
};

export type ListProjectsPageResult = {
  projects: CivicProject[];
  nextCursor: string | null;
  total?: number;
};

type CursorPayload =
  | { k: "id"; id: string }
  | { k: "votes"; votes: number; id: string };

function encodeCursor(p: CursorPayload): string {
  return Buffer.from(JSON.stringify(p), "utf8").toString("base64url");
}

function decodeCursor(raw: string | null | undefined): CursorPayload | null {
  if (!raw || typeof raw !== "string") return null;
  try {
    const json = Buffer.from(raw, "base64url").toString("utf8");
    const o = JSON.parse(json) as unknown;
    if (!o || typeof o !== "object") return null;
    const r = o as Record<string, unknown>;
    if (r.k === "id" && typeof r.id === "string") return { k: "id", id: r.id };
    if (
      r.k === "votes" &&
      typeof r.votes === "number" &&
      Number.isFinite(r.votes) &&
      typeof r.id === "string"
    ) {
      return { k: "votes", votes: r.votes, id: r.id };
    }
    return null;
  } catch {
    return null;
  }
}

function buildDirectoryMatch(
  category?: string | null,
  search?: string | null,
): Record<string, unknown> {
  const and: Record<string, unknown>[] = [
    DIRECTORY_LISTED_MATCH as unknown as Record<string, unknown>,
  ];
  if (category && category !== "all" && category.trim()) {
    and.push({ category: category.trim() });
  }
  const q = search?.trim();
  if (q) {
    const rx = new RegExp(escapeRegex(q), "i");
    and.push({
      $or: [
        { name: rx },
        { description: rx },
        { category: rx },
      ],
    });
  }
  return and.length === 1 ? and[0]! : { $and: and };
}

function pipelineScopeMatch(): Record<string, unknown> {
  return {
    $and: [
      PUBLIC_PROJECT_FILTER as unknown as Record<string, unknown>,
      { pipelineStage: { $in: PIPELINE_STAGES } },
    ],
  };
}

function mergeWithCursor(
  baseMatch: Record<string, unknown>,
  sort: ProjectListSort,
  cursor: CursorPayload | null,
): Record<string, unknown> {
  if (!cursor) return baseMatch;
  if (sort === "latest" && cursor.k === "id") {
    const oid = parseProjectObjectId(cursor.id);
    if (!oid) return baseMatch;
    return {
      $and: [
        baseMatch,
        { _id: { $lt: oid } },
      ],
    };
  }
  if (sort === "oldest" && cursor.k === "id") {
    const oid = parseProjectObjectId(cursor.id);
    if (!oid) return baseMatch;
    return {
      $and: [
        baseMatch,
        { _id: { $gt: oid } },
      ],
    };
  }
  if (sort === "votes" && cursor.k === "votes") {
    const oid = parseProjectObjectId(cursor.id);
    if (!oid) return baseMatch;
    const v = cursor.votes;
    return {
      $and: [
        baseMatch,
        {
          $or: [
            { votes: { $lt: v } },
            { $and: [{ votes: v }, { _id: { $lt: oid } }] },
          ],
        },
      ],
    };
  }
  return baseMatch;
}

export type CivicProjectsStats = {
  totalListed: number;
  liveListed: number;
  openSuggestions: number;
  pipelineStageCounts: Record<(typeof PIPELINE_STAGES)[number], number>;
};

export async function getProjectsStats(): Promise<CivicProjectsStats> {
  await connectMongoose();
  const listedBase = DIRECTORY_LISTED_MATCH as unknown as Record<string, unknown>;
  const [totalListed, liveListed, openSuggestions, stageAgg] =
    await Promise.all([
      ProjectModel.countDocuments(listedBase).exec(),
      ProjectModel.countDocuments({
        ...listedBase,
        listingStatus: "Live",
      }).exec(),
      ProjectModel.countDocuments({
        $and: [
          PUBLIC_PROJECT_FILTER as unknown as Record<string, unknown>,
          { pipelineStage: "suggested" },
        ],
      }).exec(),
      ProjectModel.aggregate<{ _id: string; c: number }>([
        {
          $match: {
            $and: [
              PUBLIC_PROJECT_FILTER as unknown as Record<string, unknown>,
              { pipelineStage: { $in: PIPELINE_STAGES } },
            ],
          },
        },
        { $group: { _id: "$pipelineStage", c: { $sum: 1 } } },
      ]).exec(),
    ]);

  const pipelineStageCounts = {
    suggested: 0,
    accepted: 0,
    building: 0,
    live: 0,
  } as CivicProjectsStats["pipelineStageCounts"];
  for (const row of stageAgg) {
    const key = row._id as (typeof PIPELINE_STAGES)[number];
    if (key in pipelineStageCounts) {
      pipelineStageCounts[key] = row.c;
    }
  }

  return {
    totalListed,
    liveListed,
    openSuggestions,
    pipelineStageCounts,
  };
}

export async function listProjectsPage(
  viewerUserId: string | null | undefined,
  params: ListProjectsPageParams & { includeTotal?: boolean },
): Promise<ListProjectsPageResult> {
  const {
    scope,
    limit: rawLimit,
    cursor: rawCursor,
    sort: rawSort,
    category,
    search,
    includeTotal = true,
  } = params;
  const limit = Math.min(Math.max(1, Math.floor(rawLimit)), 100);
  const sort: ProjectListSort =
    rawSort === "oldest" || rawSort === "votes" ? rawSort : "latest";
  const cursorDecoded = decodeCursor(rawCursor);

  const baseMatch =
    scope === "directory"
      ? buildDirectoryMatch(category, search)
      : pipelineScopeMatch();

  const match = mergeWithCursor(baseMatch, sort, cursorDecoded);

  let sortSpec: Record<string, 1 | -1>;
  if (sort === "oldest") {
    sortSpec = { _id: 1 };
  } else if (sort === "votes") {
    sortSpec = { votes: -1, _id: -1 };
  } else {
    sortSpec = { _id: -1 };
  }

  await connectMongoose();

  const totalPromise =
    includeTotal && !rawCursor
      ? ProjectModel.countDocuments(baseMatch).exec()
      : Promise.resolve(undefined);

  const docs = await ProjectModel.find(match)
    .sort(sortSpec)
    .limit(limit + 1)
    .lean()
    .exec();

  const pageDocs = docs.slice(0, limit);
  const hasMore = docs.length > limit;

  const total = await totalPromise;

  const userMap = await fetchUserMap(
    userIdsForProjectDocs(pageDocs as Record<string, unknown>[]),
  );
  const projects = await Promise.all(
    pageDocs.map((d) =>
      docToProject(d as Record<string, unknown>, userMap, viewerUserId ?? null),
    ),
  );

  let nextCursor: string | null = null;
  if (hasMore && pageDocs.length > 0) {
    const last = pageDocs[pageDocs.length - 1]! as Record<string, unknown>;
    const lastId =
      last._id instanceof mongoose.Types.ObjectId
        ? last._id.toHexString()
        : String(last._id ?? "");
    const lastVotes =
      typeof last.votes === "number" && Number.isFinite(last.votes)
        ? last.votes
        : 0;
    if (sort === "votes") {
      nextCursor = encodeCursor({ k: "votes", votes: lastVotes, id: lastId });
    } else {
      nextCursor = encodeCursor({ k: "id", id: lastId });
    }
  }

  return {
    projects,
    nextCursor,
    ...(typeof total === "number" ? { total } : {}),
  };
}

export type ListingModerationStatus = "pending" | "approved" | "all";

export async function listListingModerationPage(
  viewerUserId: string | null,
  params: {
    status: ListingModerationStatus;
    limit: number;
    cursor?: string | null;
    includeTotal?: boolean;
  },
): Promise<ListProjectsPageResult> {
  const limit = Math.min(Math.max(1, Math.floor(params.limit)), 100);
  const rawCursor = params.cursor;
  const includeTotal = params.includeTotal ?? true;

  const baseMatch: Record<string, unknown> = {
    listingStatus: { $in: ["Idea", "Prototype", "Live"] },
  };
  if (params.status === "pending") {
    Object.assign(baseMatch, {
      $or: [
        { listingApprovedAt: null },
        { listingApprovedAt: { $exists: false } },
      ],
    });
  } else if (params.status === "approved") {
    Object.assign(baseMatch, { listingApprovedAt: { $type: "date" } });
  }

  const sort: ProjectListSort = "latest";
  const match = mergeWithCursor(baseMatch, sort, decodeCursor(rawCursor));

  await connectMongoose();
  const totalPromise =
    includeTotal && !rawCursor
      ? ProjectModel.countDocuments(baseMatch).exec()
      : Promise.resolve(undefined);

  const docs = await ProjectModel.find(match)
    .sort({ _id: -1 })
    .limit(limit + 1)
    .lean()
    .exec();

  const pageDocs = docs.slice(0, limit);
  const hasMore = docs.length > limit;
  const total = await totalPromise;

  const userMap = await fetchUserMap(
    userIdsForProjectDocs(pageDocs as Record<string, unknown>[]),
  );
  const projects = await Promise.all(
    pageDocs.map((d) =>
      docToProject(d as Record<string, unknown>, userMap, viewerUserId ?? null),
    ),
  );

  let nextCursor: string | null = null;
  if (hasMore && pageDocs.length > 0) {
    const last = pageDocs[pageDocs.length - 1]! as Record<string, unknown>;
    const lastId =
      last._id instanceof mongoose.Types.ObjectId
        ? last._id.toHexString()
        : String(last._id ?? "");
    nextCursor = encodeCursor({ k: "id", id: lastId });
  }

  return {
    projects,
    nextCursor,
    ...(typeof total === "number" ? { total } : {}),
  };
}

/** Pipeline ideas in the “Suggested” column (not directory submissions). */
export async function listPipelineSuggestionsModerationPage(
  viewerUserId: string | null,
  params: {
    limit: number;
    cursor?: string | null;
    includeTotal?: boolean;
  },
): Promise<ListProjectsPageResult> {
  const limit = Math.min(Math.max(1, Math.floor(params.limit)), 100);
  const rawCursor = params.cursor;
  const includeTotal = params.includeTotal ?? true;

  const baseMatch: Record<string, unknown> = {
    pipelineStage: "suggested",
  };

  const sort: ProjectListSort = "latest";
  const match = mergeWithCursor(baseMatch, sort, decodeCursor(rawCursor));

  await connectMongoose();
  const totalPromise =
    includeTotal && !rawCursor
      ? ProjectModel.countDocuments(baseMatch).exec()
      : Promise.resolve(undefined);

  const docs = await ProjectModel.find(match)
    .sort({ _id: -1 })
    .limit(limit + 1)
    .lean()
    .exec();

  const pageDocs = docs.slice(0, limit);
  const hasMore = docs.length > limit;
  const total = await totalPromise;

  const userMap = await fetchUserMap(
    userIdsForProjectDocs(pageDocs as Record<string, unknown>[]),
  );
  const projects = await Promise.all(
    pageDocs.map((d) =>
      docToProject(d as Record<string, unknown>, userMap, viewerUserId ?? null),
    ),
  );

  let nextCursor: string | null = null;
  if (hasMore && pageDocs.length > 0) {
    const last = pageDocs[pageDocs.length - 1]! as Record<string, unknown>;
    const lastId =
      last._id instanceof mongoose.Types.ObjectId
        ? last._id.toHexString()
        : String(last._id ?? "");
    nextCursor = encodeCursor({ k: "id", id: lastId });
  }

  return {
    projects,
    nextCursor,
    ...(typeof total === "number" ? { total } : {}),
  };
}

export type SetListingApprovalResult =
  | { ok: true; project: CivicProject }
  | { ok: false; reason: "not_found" | "not_a_listing" };

export async function setListingApproval(
  projectId: string,
  approved: boolean,
  viewerUserId: string | null,
): Promise<SetListingApprovalResult> {
  const oid = parseProjectObjectId(projectId);
  if (!oid) return { ok: false, reason: "not_found" };
  await connectMongoose();
  const exists = await ProjectModel.findOne({
    _id: oid,
    listingStatus: { $in: ["Idea", "Prototype", "Live"] },
  })
    .select("_id")
    .lean()
    .exec();
  if (!exists) return { ok: false, reason: "not_a_listing" };

  const updated = await ProjectModel.findOneAndUpdate(
    { _id: oid },
    { $set: { listingApprovedAt: approved ? new Date() : null } },
    { new: true },
  )
    .lean()
    .exec();
  if (!updated) return { ok: false, reason: "not_found" };
  const project = await docToProject(
    updated as Record<string, unknown>,
    undefined,
    viewerUserId ?? null,
  );
  return { ok: true, project };
}

export async function getProjectById(
  id: string,
  viewerUserId?: string | null,
): Promise<CivicProject | null> {
  const oid = parseProjectObjectId(id);
  if (!oid) return null;
  await connectMongoose();
  const doc = await ProjectModel.findOne({
    $and: [
      { _id: oid },
      PUBLIC_PROJECT_FILTER as unknown as Record<string, unknown>,
    ],
  })
    .lean()
    .exec();
  if (!doc) return null;
  return docToProject(
    doc as Record<string, unknown>,
    undefined,
    viewerUserId ?? null,
  );
}

export type NewProject = Omit<
  CivicProject,
  "id" | "teams" | "viewerHasVoted" | "postedAt"
> & {
  authorEmail?: string | null;
  teams: ProjectTeamSlot[];
  voterIds: string[];
};

export async function insertProject(
  project: NewProject,
  viewerUserId?: string | null,
): Promise<CivicProject> {
  await connectMongoose();
  const doc = await ProjectModel.create(project);
  return docToProject(
    doc.toObject({ flattenMaps: true }) as Record<string, unknown>,
    undefined,
    viewerUserId ?? null,
  );
}

export type ToggleVoteResult =
  | { ok: true; votes: number; viewerHasVoted: boolean }
  | { ok: false; reason: "not_found" };

/** Add vote if absent, else remove — one round-trip friendly to stale client cache. */
export async function toggleVoteForUser(
  projectId: string,
  userId: string,
): Promise<ToggleVoteResult> {
  const oid = parseProjectObjectId(projectId);
  if (!oid) return { ok: false, reason: "not_found" };
  await connectMongoose();

  const addRes = await ProjectModel.findOneAndUpdate(
    {
      $and: [
        { _id: oid },
        PUBLIC_MATCH,
        { voterIds: { $nin: [userId] } },
      ],
    },
    { $push: { voterIds: userId }, $inc: { votes: 1 } },
    { new: true },
  )
    .lean()
    .exec();

  if (addRes) {
    const votes = typeof addRes.votes === "number" ? addRes.votes : 0;
    return { ok: true, votes, viewerHasVoted: true };
  }

  const removeRes = await ProjectModel.findOneAndUpdate(
    {
      $and: [{ _id: oid }, PUBLIC_MATCH, { voterIds: userId }],
    },
    { $pull: { voterIds: userId }, $inc: { votes: -1 } },
    { new: true },
  )
    .lean()
    .exec();

  if (removeRes) {
    const raw = typeof removeRes.votes === "number" ? removeRes.votes : 0;
    const votes = Math.max(0, raw);
    return { ok: true, votes, viewerHasVoted: false };
  }

  if (!(await isPublicProject(oid))) {
    return { ok: false, reason: "not_found" };
  }
  return { ok: false, reason: "not_found" };
}

export type PushTeamMemberResult =
  | { ok: true; project: CivicProject }
  | { ok: false; reason: "not_found" | "duplicate" | "not_allowed" };

/** Off until owner-approved invites exist (prevents open team spam). */
const TEAM_SELF_JOIN_ENABLED = false;

export async function pushTeamMember(
  id: string,
  slot: ProjectTeamSlot,
  viewerUserId?: string | null,
): Promise<PushTeamMemberResult> {
  if (!TEAM_SELF_JOIN_ENABLED) {
    return { ok: false, reason: "not_allowed" };
  }

  const oid = parseProjectObjectId(id);
  const userOid = parseProjectObjectId(slot.userId);
  if (!oid || !userOid) {
    return { ok: false, reason: "not_found" };
  }
  await connectMongoose();
  const res = await ProjectModel.findOneAndUpdate(
    {
      _id: oid,
      teams: { $not: { $elemMatch: { userId: slot.userId } } },
    },
    { $push: { teams: { userId: slot.userId, role: slot.role } } },
    { new: true },
  )
    .lean()
    .exec();
  if (res) {
    const project = await docToProject(
      res as Record<string, unknown>,
      undefined,
      viewerUserId ?? null,
    );
    return { ok: true, project };
  }
  const doc = await ProjectModel.findById(oid).select("teams").lean().exec();
  if (!doc) return { ok: false, reason: "not_found" };
  const onTeam = parseTeamSlots(doc.teams).some((s) => s.userId === slot.userId);
  return { ok: false, reason: onTeam ? "duplicate" : "not_found" };
}

export async function slugExists(slug: string): Promise<boolean> {
  await connectMongoose();
  const n = await ProjectModel.countDocuments({ slug }).exec();
  return n > 0;
}
