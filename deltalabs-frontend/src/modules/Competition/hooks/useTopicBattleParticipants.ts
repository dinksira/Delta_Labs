import { useQuery } from "@tanstack/react-query";

import { fetchBattleParticipants } from "@/modules/Competition/api";
import { topicBattleQueryKeys } from "@/modules/Competition/hooks/topicBattleQueryKeys";

export function useTopicBattleParticipants(battleId: string, enabled = true) {
  return useQuery({
    queryKey: topicBattleQueryKeys.participants(battleId),
    queryFn: () => fetchBattleParticipants(battleId),
    enabled: Boolean(battleId) && enabled,
    refetchInterval: 10_000,
  });
}

