/**
 * @file queryKeys.ts
 * @description TanStack Query key factory for the Admin Users module.
 * All keys are namespaced under ["dl", "admin", "users"].
 */

import type { UserListParams } from "../types";

// ===== KEY FACTORY =====
export const userQueryKeys = {
  all: ["dl", "admin", "users"] as const,

  lists: () => [...userQueryKeys.all, "list"] as const,

  list: (params: UserListParams) =>
    [...userQueryKeys.lists(), params] as const,

  details: () => [...userQueryKeys.all, "detail"] as const,

  detail: (userId: string) =>
    [...userQueryKeys.details(), userId] as const,
};

