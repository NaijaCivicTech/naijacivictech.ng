"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useCallback } from "react";
import {
  findProjectInCaches,
  patchProjectVotesInCaches,
} from "@/lib/civic-query-cache";
import { civicProjectKeys, postVote } from "@/lib/civic-api";

export function useCivicVote() {
  const queryClient = useQueryClient();
  const { status } = useSession();
  const canVote = status === "authenticated";

  const { mutate: runVote } = useMutation({
    mutationFn: ({ id }: { id: string }) => postVote(id),
    onMutate: async ({ id }) => {
      const p = findProjectInCaches(queryClient, id);
      const hasVoted = p?.viewerHasVoted === true;
      const delta = hasVoted ? -1 : 1;
      await queryClient.cancelQueries({ queryKey: civicProjectKeys.all });
      const previousEntries = queryClient.getQueriesData({
        queryKey: civicProjectKeys.all,
      });
      patchProjectVotesInCaches(
        queryClient,
        id,
        (p?.votes ?? 0) + delta,
        !hasVoted,
      );
      return { previousEntries };
    },
    onError: (_err, _vars, context) => {
      for (const [key, data] of context?.previousEntries ?? []) {
        queryClient.setQueryData(key, data);
      }
    },
    onSuccess: (data) => {
      patchProjectVotesInCaches(
        queryClient,
        data.id,
        data.votes,
        data.viewerHasVoted,
      );
    },
  });

  const toggleVote = useCallback(
    (id: string) => {
      if (!canVote) return;
      runVote({ id });
    },
    [canVote, runVote],
  );

  return { canVote, toggleVote };
}
