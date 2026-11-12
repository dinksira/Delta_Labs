/**
 * @file useUserMutations.ts
 * @description TanStack Mutation hooks for user moderation actions:
 * activate/deactivate account and revoke all sessions.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { usersApi } from "../api";
import type { UserStatusUpdatePayload } from "../types";
import { userQueryKeys } from "./queryKeys";

// ===== UPDATE STATUS =====
export function useUpdateUserStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      payload,
    }: {
      userId: string;
      payload: UserStatusUpdatePayload;
    }) => usersApi.updateUserStatus(userId, payload),

    onSuccess: (updatedUser) => {
      // Invalidate list so table refreshes
      void queryClient.invalidateQueries({ queryKey: userQueryKeys.lists() });
      // Seed detail cache with fresh data
      queryClient.setQueryData(
        userQueryKeys.detail(updatedUser.userId),
        updatedUser
      );
    },
  });
}

// ===== REVOKE SESSIONS =====
export function useRevokeSessionsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => usersApi.revokeUserSessions(userId),

    onSuccess: (_data, userId) => {
      // Invalidate the user detail so activeSessions count refreshes
      void queryClient.invalidateQueries({
        queryKey: userQueryKeys.detail(userId),
      });
    },
  });
}

