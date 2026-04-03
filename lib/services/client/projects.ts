import type {
  CivicProject,
  CreateIdeaBody,
  CreateIdeaPayload,
  CreateListingBody,
  CreateListingPayload,
  PipelineStage,
  ProjectComment,
  TeamRole,
} from "@/data/types";

export type CivicProjectsStatsDto = {
  totalListed: number;
  liveListed: number;
  openSuggestions: number;
  pipelineStageCounts: Record<PipelineStage, number>;
};

export type ProjectsListPageDto = {
  projects: CivicProject[];
  nextCursor: string | null;
  total?: number;
};

export const civicProjectKeys = {
  all: ["civic-projects"] as const,
  stats: (viewerKey: string) =>
    [...civicProjectKeys.all, "stats", viewerKey] as const,
  directory: (
    viewerKey: string,
    category: string,
    q: string,
    sort: "latest" | "oldest" | "votes",
  ) =>
    [...civicProjectKeys.all, "directory", viewerKey, category, q, sort] as const,
  pipeline: (viewerKey: string, sort: string) =>
    [...civicProjectKeys.all, "pipeline", viewerKey, sort] as const,
  homeDirectoryPreview: (viewerKey: string) =>
    [...civicProjectKeys.all, "home-directory", viewerKey] as const,
  homePipelinePreview: (viewerKey: string) =>
    [...civicProjectKeys.all, "home-pipeline", viewerKey] as const,
  detail: (viewerKey: string, id: string) =>
    [...civicProjectKeys.all, "detail", viewerKey, id] as const,
  comments: (projectId: string) =>
    [...civicProjectKeys.all, "comments", projectId] as const,
};

export async function fetchProjectsStats(): Promise<CivicProjectsStatsDto> {
  const res = await fetch("/api/projects?scope=stats", {
    credentials: "include",
  });
  const data = (await res.json()) as {
    stats?: CivicProjectsStatsDto;
    error?: string;
  };
  if (!res.ok) {
    throw new Error(data.error ?? `Failed to load stats (${res.status})`);
  }
  if (!data.stats) throw new Error("Invalid stats response");
  return data.stats;
}

export async function fetchProjectsListPage(params: {
  scope: "directory" | "pipeline";
  limit: number;
  cursor?: string | null;
  sort?: "latest" | "oldest" | "votes";
  category?: string;
  q?: string;
}): Promise<ProjectsListPageDto> {
  const sp = new URLSearchParams();
  sp.set("scope", params.scope);
  sp.set("limit", String(params.limit));
  if (params.cursor) sp.set("cursor", params.cursor);
  if (params.sort) sp.set("sort", params.sort);
  if (params.category) sp.set("category", params.category);
  if (params.q) sp.set("q", params.q);
  const res = await fetch(`/api/projects?${sp}`, { credentials: "include" });
  const data = (await res.json()) as ProjectsListPageDto & { error?: string };
  if (!res.ok) {
    throw new Error(data.error ?? `Failed to load (${res.status})`);
  }
  if (!Array.isArray(data.projects)) {
    throw new Error("Invalid projects response");
  }
  return {
    projects: data.projects,
    nextCursor: data.nextCursor ?? null,
    ...(typeof data.total === "number" ? { total: data.total } : {}),
  };
}

export async function fetchProjectCommentsPage(
  projectId: string,
  cursor?: string | null,
  limit = 30,
): Promise<{ comments: ProjectComment[]; nextCursor: string | null }> {
  const sp = new URLSearchParams();
  sp.set("limit", String(limit));
  if (cursor) sp.set("cursor", cursor);
  const res = await fetch(`/api/projects/${projectId}/comments?${sp}`, {
    credentials: "include",
  });
  const data = (await res.json()) as {
    comments?: ProjectComment[];
    nextCursor?: string | null;
    error?: string;
  };
  if (!res.ok) {
    throw new Error(data.error ?? `Failed to load comments (${res.status})`);
  }
  if (!Array.isArray(data.comments)) {
    throw new Error("Invalid comments response");
  }
  return {
    comments: data.comments,
    nextCursor: data.nextCursor ?? null,
  };
}

export async function postProjectComment(
  projectId: string,
  body: string,
): Promise<ProjectComment> {
  const res = await fetch(`/api/projects/${projectId}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ body }),
  });
  const data = (await res.json()) as {
    comment?: ProjectComment;
    error?: string;
  };
  if (!res.ok) {
    throw new Error(data.error ?? `Failed to post (${res.status})`);
  }
  if (!data.comment) throw new Error("Invalid response");
  return data.comment;
}

export async function fetchProjectById(id: string): Promise<CivicProject> {
  const res = await fetch(`/api/projects/${id}`, { credentials: "include" });
  const data = (await res.json()) as {
    project?: CivicProject;
    error?: string;
  };
  if (!res.ok) {
    throw new Error(data.error ?? `Failed to load project (${res.status})`);
  }
  if (!data.project) throw new Error("Invalid project response");
  return data.project;
}

export async function postVote(
  id: string,
): Promise<{ id: string; votes: number; viewerHasVoted: boolean }> {
  const res = await fetch(`/api/projects/${id}/vote`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({}),
  });
  const data = (await res.json()) as {
    votes?: number;
    viewerHasVoted?: boolean;
    error?: string;
  };
  if (!res.ok) {
    throw new Error(data.error ?? `Vote failed (${res.status})`);
  }
  if (typeof data.votes !== "number") {
    throw new Error("Invalid vote response");
  }
  return {
    id,
    votes: data.votes,
    viewerHasVoted: data.viewerHasVoted === true,
  };
}

export async function postListing(
  input: CreateListingPayload,
): Promise<CivicProject> {
  const body: CreateListingBody = { kind: "listing", ...input };
  const res = await fetch("/api/projects", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  const data = (await res.json()) as { project?: CivicProject; error?: string };
  if (!res.ok) {
    throw new Error(data.error ?? `Submit failed (${res.status})`);
  }
  if (!data.project) throw new Error("Invalid response");
  return data.project;
}

export async function postIdea(
  input: CreateIdeaPayload,
): Promise<CivicProject> {
  const body: CreateIdeaBody = { kind: "idea", ...input };
  const res = await fetch("/api/projects", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  const data = (await res.json()) as { project?: CivicProject; error?: string };
  if (!res.ok) {
    throw new Error(data.error ?? `Submit failed (${res.status})`);
  }
  if (!data.project) throw new Error("Invalid response");
  return data.project;
}

export async function postTeamMember(
  projectId: string,
  role: TeamRole,
): Promise<CivicProject> {
  const res = await fetch(`/api/projects/${projectId}/team`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ role }),
  });
  const data = (await res.json()) as { project?: CivicProject; error?: string };
  if (!res.ok) {
    throw new Error(data.error ?? `Join failed (${res.status})`);
  }
  if (!data.project) throw new Error("Invalid response");
  return data.project;
}
