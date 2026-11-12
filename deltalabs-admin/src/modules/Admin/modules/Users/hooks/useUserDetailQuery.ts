/**
 * @file useUserDetailQuery.ts
 * @description TanStack Query hook for fetching a single admin user detail.
 */

import { useQuery } from "@tanstack/react-query";

import { usersApi } from "../api";
import { userQueryKeys } from "./queryKeys";

// ===== HOOK =====
export function useUserDetailQuery(userId: string | null) {
  return useQuery({
    queryKey: userQueryKeys.detail(userId ?? ""),
    queryFn: () => usersApi.getUser(userId!),
    enabled: userId != null && userId.length > 0,
    staleTime: 15_000,
  });
}

