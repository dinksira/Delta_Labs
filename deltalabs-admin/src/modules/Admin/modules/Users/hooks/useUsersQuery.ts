/**
 * @file useUsersQuery.ts
 * @description TanStack Query hook for fetching the paginated admin user list.
 */

import { useQuery } from "@tanstack/react-query";

import { usersApi } from "../api";
import type { UserListParams } from "../types";
import { userQueryKeys } from "./queryKeys";

// ===== HOOK =====
export function useUsersQuery(params: UserListParams = {}) {
  return useQuery({
    queryKey: userQueryKeys.list(params),
    queryFn: () => usersApi.listUsers(params),
    staleTime: 30_000, // 30 s — balance freshness vs. API calls
    placeholderData: (prev) => prev, // keep previous page visible during refetch
  });
}

