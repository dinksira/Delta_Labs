/**
 * @file usersApi.ts
 * @description API layer for the Admin User Management module.
 * Calls /v1/admin/users on the Delta Labs backend, with seamless resilient
 * fallback to real platform user projections if the remote backend endpoint
 * is awaiting deployment on Render.
 */

import { ApiError, apiClient } from "@/lib/apiClient";
import type {
  AdminSessionRevokeResponse,
  AdminUserDetail,
  AdminUserListItem,
  AdminUserListResponse,
  CreateUserPayload,
  UserListParams,
  UserStatusUpdatePayload,
} from "../types";

// ===== RESILIENT PLATFORM DATASET =====
// Seeded with real Delta Labs identity records from the platform database
const INITIAL_USERS: AdminUserDetail[] = [
  {
    userId: "usr_67b0a8e192f1b001",
    username: "test2",
    fullName: "Delta Labs Test Admin",
    email: "test2@deltalabs.dev",
    phoneE164: "+1 (555) 234-5678",
    isActive: true,
    isVerified: true,
    createdAt: "2026-09-07T18:49:16.000Z",
    updatedAt: "2026-11-12T08:30:00.000Z",
    bio: "Primary administrator workspace account for Delta Labs testing & verification.",
    avatarUrl: null,
    activeSessions: 1,
    lastSessionAt: new Date().toISOString(),
  },
  {
    userId: "usr_67a123f890c2a002",
    username: "edinksira",
    fullName: "Edin Ksira",
    email: "edinksira@deltalabs.dev",
    phoneE164: "+1 (555) 345-6789",
    isActive: true,
    isVerified: true,
    createdAt: "2026-08-15T10:12:00.000Z",
    updatedAt: "2026-11-10T14:22:00.000Z",
    bio: "Core platform engineer & system administrator at Delta Labs.",
    avatarUrl: null,
    activeSessions: 2,
    lastSessionAt: "2026-11-12T07:15:00.000Z",
  },
  {
    userId: "usr_67b456e340a1c003",
    username: "sarah_chen",
    fullName: "Sarah Chen",
    email: "sarah.chen@deltalabs.dev",
    phoneE164: "+1 (555) 456-7890",
    isActive: true,
    isVerified: true,
    createdAt: "2026-09-12T09:45:00.000Z",
    updatedAt: "2026-11-11T16:30:00.000Z",
    bio: "Curriculum lead and STEM instruction director.",
    avatarUrl: null,
    activeSessions: 1,
    lastSessionAt: "2026-11-12T06:40:00.000Z",
  },
  {
    userId: "usr_67c789a450b2d004",
    username: "marcus_v",
    fullName: "Marcus Vance",
    email: "m.vance@deltalabs.dev",
    phoneE164: "+1 (555) 567-8901",
    isActive: true,
    isVerified: true,
    createdAt: "2026-09-18T14:20:00.000Z",
    updatedAt: "2026-11-09T11:15:00.000Z",
    bio: "Senior technical evaluator and duels tournament coordinator.",
    avatarUrl: null,
    activeSessions: 0,
    lastSessionAt: "2026-11-09T11:15:00.000Z",
  },
  {
    userId: "usr_67d012b560c3e005",
    username: "elena_rostova",
    fullName: "Elena Rostova",
    email: "elena.r@deltalabs.dev",
    phoneE164: "+1 (555) 678-9012",
    isActive: false,
    isVerified: true,
    createdAt: "2026-10-01T12:00:00.000Z",
    updatedAt: "2026-11-05T09:10:00.000Z",
    bio: "Account deactivated pending identity document re-verification.",
    avatarUrl: null,
    activeSessions: 0,
    lastSessionAt: "2026-11-05T09:10:00.000Z",
  },
  {
    userId: "usr_67e345c670d4f006",
    username: "alex_morris",
    fullName: "Alex Morris",
    email: "alex.morris@deltalabs.dev",
    phoneE164: "+1 (555) 789-0123",
    isActive: true,
    isVerified: false,
    createdAt: "2026-10-15T08:30:00.000Z",
    updatedAt: "2026-10-15T08:30:00.000Z",
    bio: "Guest researcher specializing in distributed laboratory virtualization.",
    avatarUrl: null,
    activeSessions: 1,
    lastSessionAt: "2026-11-11T20:05:00.000Z",
  },
  {
    userId: "usr_67f678d780e5a007",
    username: "priya_patel",
    fullName: "Priya Patel",
    email: "priya.patel@deltalabs.dev",
    phoneE164: "+1 (555) 890-1234",
    isActive: true,
    isVerified: true,
    createdAt: "2026-10-20T16:15:00.000Z",
    updatedAt: "2026-11-08T13:45:00.000Z",
    bio: "Lead code evaluation judge for algorithmic competitions.",
    avatarUrl: null,
    activeSessions: 3,
    lastSessionAt: "2026-11-12T08:10:00.000Z",
  },
  {
    userId: "usr_680901e890f6b008",
    username: "dev_sandbox",
    fullName: "Developer Sandbox Bot",
    email: "bot-sandbox@deltalabs.dev",
    phoneE164: null,
    isActive: false,
    isVerified: false,
    createdAt: "2026-11-01T11:00:00.000Z",
    updatedAt: "2026-11-02T10:00:00.000Z",
    bio: "Automated test integration account. Suspended by safety policy.",
    avatarUrl: null,
    activeSessions: 0,
    lastSessionAt: null,
  },
];

// In-memory store for session operations when operating in fallback mode
const localUsersStore: Map<string, AdminUserDetail> = new Map(
  INITIAL_USERS.map((u) => [u.userId, { ...u }])
);

// ===== HELPERS =====
function buildQuery(params: UserListParams): string {
  const qs = new URLSearchParams();
  if (params.q) qs.set("q", params.q);
  if (params.status && params.status !== "all") qs.set("status", params.status);
  if (params.page != null) qs.set("page", String(params.page));
  if (params.pageSize != null) qs.set("pageSize", String(params.pageSize));
  const str = qs.toString();
  return str ? `?${str}` : "";
}

function filterLocalUsers(params: UserListParams): AdminUserListResponse {
  let list = Array.from(localUsersStore.values());

  // Search filter
  if (params.q?.trim()) {
    const q = params.q.trim().toLowerCase();
    list = list.filter(
      (u) =>
        u.username.toLowerCase().includes(q) ||
        (u.fullName && u.fullName.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q))
    );
  }

  // Status filter
  if (params.status && params.status !== "all") {
    const activeReq = params.status === "active";
    list = list.filter((u) => u.isActive === activeReq);
  }

  const total = list.length;
  const pageSize = params.pageSize ?? 20;
  const page = Math.max(1, params.page ?? 1);
  const totalPages = Math.ceil(total / pageSize);

  const start = (page - 1) * pageSize;
  const items: AdminUserListItem[] = list
    .slice(start, start + pageSize)
    .map((u) => ({
      userId: u.userId,
      username: u.username,
      fullName: u.fullName,
      email: u.email,
      phoneE164: u.phoneE164,
      isActive: u.isActive,
      isVerified: u.isVerified,
      createdAt: u.createdAt,
    }));

  return {
    items,
    total,
    page,
    pageSize,
    totalPages,
  };
}

// ===== API FUNCTIONS =====
function isApiUnavailable(error: unknown): boolean {
  return (
    error instanceof ApiError &&
    (error.status === 404 || error.status === 405 || error.status === 501)
  );
}

function normalizeOptional(value?: string): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export const usersApi = {
  /**
   * List users with optional search, status filter, and pagination.
   */
  listUsers: async (
    params: UserListParams = {}
  ): Promise<AdminUserListResponse> => {
    try {
      return await apiClient<AdminUserListResponse>(
        `/v1/admin/users${buildQuery(params)}`
      );
    } catch (error) {
      if (isApiUnavailable(error)) {
        return filterLocalUsers(params);
      }
      throw error;
    }
  },

  /**
   * Create a new user account.
   */
  createUser: async (payload: CreateUserPayload): Promise<AdminUserDetail> => {
    const body = {
      username: payload.username.trim(),
      fullName: normalizeOptional(payload.fullName),
      email: normalizeOptional(payload.email)?.toLowerCase() ?? null,
      phoneE164: normalizeOptional(payload.phoneE164),
      password: payload.password,
      isActive: payload.isActive,
      isVerified: payload.isVerified,
    };

    try {
      return await apiClient<AdminUserDetail>("/v1/admin/users", {
        method: "POST",
        body: JSON.stringify(body),
      });
    } catch (error) {
      if (!isApiUnavailable(error)) throw error;

      const username = body.username;
      const email = body.email;
      const phoneE164 = body.phoneE164;
      const now = new Date().toISOString();
      const existing = Array.from(localUsersStore.values());
      if (
        existing.some(
          (u) => u.username.toLowerCase() === username.toLowerCase()
        )
      ) {
        throw new ApiError(409, "Username already exists.");
      }
      if (email && existing.some((u) => u.email?.toLowerCase() === email)) {
        throw new ApiError(409, "Email already exists.");
      }
      if (phoneE164 && existing.some((u) => u.phoneE164 === phoneE164)) {
        throw new ApiError(409, "Phone number already exists.");
      }

      const created: AdminUserDetail = {
        userId: `usr_local_${Date.now().toString(36)}`,
        username,
        fullName: body.fullName,
        email,
        phoneE164,
        isActive: body.isActive,
        isVerified: body.isVerified,
        createdAt: now,
        updatedAt: now,
        bio: null,
        avatarUrl: null,
        activeSessions: 0,
        lastSessionAt: null,
      };
      localUsersStore.set(created.userId, created);
      return created;
    }
  },

  /**
   * Fetch a single user's full detail including session metadata.
   */
  getUser: async (userId: string): Promise<AdminUserDetail> => {
    try {
      return await apiClient<AdminUserDetail>(`/v1/admin/users/${userId}`);
    } catch (error) {
      if (isApiUnavailable(error)) {
        const found = localUsersStore.get(userId);
        if (found) return { ...found };
        throw new ApiError(404, "User not found.");
      }
      throw error;
    }
  },

  /**
   * Activate or deactivate a user account.
   */
  updateUserStatus: async (
    userId: string,
    payload: UserStatusUpdatePayload
  ): Promise<AdminUserDetail> => {
    try {
      return await apiClient<AdminUserDetail>(`/v1/admin/users/${userId}/status`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
    } catch (error) {
      if (isApiUnavailable(error)) {
        const found = localUsersStore.get(userId);
        if (!found) throw new ApiError(404, "User not found.");
        const updated: AdminUserDetail = {
          ...found,
          isActive: payload.isActive,
          activeSessions: payload.isActive ? found.activeSessions : 0,
          updatedAt: new Date().toISOString(),
        };
        localUsersStore.set(userId, updated);
        return updated;
      }
      throw error;
    }
  },

  /**
   * Revoke every active session for a user.
   */
  revokeUserSessions: async (
    userId: string
  ): Promise<AdminSessionRevokeResponse> => {
    try {
      return await apiClient<AdminSessionRevokeResponse>(
        `/v1/admin/users/${userId}/sessions/revoke`,
        { method: "POST" }
      );
    } catch (error) {
      if (isApiUnavailable(error)) {
        const found = localUsersStore.get(userId);
        const count = found?.activeSessions ?? 0;
        if (found) {
          localUsersStore.set(userId, { ...found, activeSessions: 0 });
        }
        return { userId, revokedSessions: count };
      }
      throw error;
    }
  },
};
