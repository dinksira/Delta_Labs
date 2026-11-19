import { useMutation, useQueryClient } from "@tanstack/react-query";

import { endTopicBattle } from "@/modules/Competition/api";
import { topicBattleQueryKeys } from "@/modules/Competition/hooks/topicBattleQueryKeys";

export function useEndTopicBattle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (battleId: string) => endTopicBattle(battleId),
    onSuccess: (_, battleId) => {
      queryClient.invalidateQueries({ queryKey: topicBattleQueryKeys.list });
      queryClient.invalidateQueries({ queryKey: topicBattleQueryKeys.detail(battleId) });
      queryClient.invalidateQueries({ queryKey: topicBattleQueryKeys.participants(battleId) });
      queryClient.invalidateQueries({ queryKey: topicBattleQueryKeys.leaderboard(battleId) });
    },
  });
}

