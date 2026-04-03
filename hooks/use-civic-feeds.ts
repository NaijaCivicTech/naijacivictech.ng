"use client";

import {
  civicProjectKeys,
  fetchProjectsListPage,
  fetchProjectsStats,
} from "@/lib/services/client/projects";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

const DIRECTORY_PAGE_SIZE = 24;
const PIPELINE_PAGE_SIZE = 36;
const HOME_DIRECTORY_LIMIT = 12;
const HOME_PIPELINE_LIMIT = 72;

function useViewerSession() {
  const { data: session, status } = useSession();
  const viewerKey =
    status === "loading" ? "pending" : (session?.user?.id ?? "guest");
  return { session, status, viewerKey };
}

export function useCivicProjectsStats() {
  const { status } = useViewerSession();
  return useQuery({
    queryKey: [...civicProjectKeys.all, "stats"] as const,
    queryFn: fetchProjectsStats,
    enabled: status !== "loading",
    staleTime: 45_000,
  });
}

export type DirectoryFeedSort = "latest" | "oldest" | "votes";

export function useDirectoryProjectsInfinite(
  category: string,
  search: string,
  enabled = true,
  sortMode: DirectoryFeedSort = "votes",
) {
  const { status, viewerKey } = useViewerSession();
  const q = search.trim();
  const sortApi: DirectoryFeedSort =
    sortMode === "votes" || sortMode === "oldest" ? sortMode : "latest";
  return useInfiniteQuery({
    queryKey: civicProjectKeys.directory(viewerKey, category, q, sortApi),
    initialPageParam: null as string | null,
    queryFn: ({ pageParam }) =>
      fetchProjectsListPage({
        scope: "directory",
        limit: DIRECTORY_PAGE_SIZE,
        cursor: pageParam ?? undefined,
        sort: sortApi,
        category: category !== "all" ? category : undefined,
        q: q || undefined,
      }),
    getNextPageParam: (last) => last.nextCursor,
    enabled: enabled && status !== "loading",
  });
}

export type PipelineFeedSort = "latest" | "oldest" | "votes";

export function usePipelineProjectsInfinite(
  sortMode: PipelineFeedSort,
  enabled = true,
) {
  const { status, viewerKey } = useViewerSession();
  const sortApi: PipelineFeedSort =
    sortMode === "votes" || sortMode === "oldest" ? sortMode : "latest";
  return useInfiniteQuery({
    queryKey: civicProjectKeys.pipeline(viewerKey, sortApi),
    initialPageParam: null as string | null,
    queryFn: ({ pageParam }) =>
      fetchProjectsListPage({
        scope: "pipeline",
        limit: PIPELINE_PAGE_SIZE,
        cursor: pageParam ?? undefined,
        sort: sortApi,
      }),
    getNextPageParam: (last) => last.nextCursor,
    enabled: enabled && status !== "loading",
  });
}

export function useHomeDirectoryPreview(enabled = true) {
  const { status, viewerKey } = useViewerSession();
  return useQuery({
    queryKey: civicProjectKeys.homeDirectoryPreview(viewerKey),
    queryFn: () =>
      fetchProjectsListPage({
        scope: "directory",
        limit: HOME_DIRECTORY_LIMIT,
        sort: "votes",
      }),
    enabled: enabled && status !== "loading",
    staleTime: 30_000,
  });
}

export function useHomePipelinePreview(enabled = true) {
  const { status, viewerKey } = useViewerSession();
  return useQuery({
    queryKey: civicProjectKeys.homePipelinePreview(viewerKey),
    queryFn: () =>
      fetchProjectsListPage({
        scope: "pipeline",
        limit: HOME_PIPELINE_LIMIT,
        sort: "votes",
      }),
    enabled: enabled && status !== "loading",
    staleTime: 30_000,
  });
}
