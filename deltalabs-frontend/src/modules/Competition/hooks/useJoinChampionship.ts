/**
 * useJoinChampionship
 * Mutation hook that enrolls the current user in the active Championship season
 * (`POST /v1/competitions/championship/join`). On success the Championship query
 * is refreshed so the stage ladder and join state re-render immediately.
 *
 * @example
 * ```ts
 * const join = useJoinChampionship();
 * <Button onClick={() => join.mutate()}>Join Tournament</Button>
 * ```
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { joinChampionship } from "@/modules/Competition/api";
import { championshipQueryKeys } from "@/modules/Competition/hooks/championshipQueryKeys";

export function useJoinChampionship() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: joinChampionship,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: championshipQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: [["competitions", "hub"]] });
    },
  });
}

