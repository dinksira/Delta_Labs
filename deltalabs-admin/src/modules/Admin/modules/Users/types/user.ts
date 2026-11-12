/**
 * @file user.ts
 * @description TypeScript types for the Admin User Management module.
 * Mirrors the backend AdminUserListItem / AdminUserDetail schemas.
 */

// ===== LIST ITEM =====
export interface AdminUserListItem {
  userId: string;
  username: string;
  fullName: string | null;
  email: string | null;
  phoneE164: string | null;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string; // ISO 8601
}

// ===== DETAIL =====
export interface AdminUserDetail extends AdminUserListItem {
  updatedAt: string; // ISO 8601
  bio: string | null;
  avatarUrl: string | null;
  activeSessions: number;
  lastSessionAt: string | null; // ISO 8601
}

// ===== PAGINATED RESPONSE =====
export interface AdminUserListResponse {
  items: AdminUserListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ===== FILTERS =====
export type UserStatusFilter = "all" | "active" | "inactive";

export interface UserListParams {
  q?: string;
  status?: UserStatusFilter;
  page?: number;
  pageSize?: number;
}

// ===== MUTATIONS =====
export interface UserStatusUpdatePayload {
  isActive: boolean;
  reason?: string;
}

export interface AdminSessionRevokeResponse {
  userId: string;
  revokedSessions: number;
}

// ===== UI STATE =====
export type UserSortField = "username" | "email" | "createdAt" | "isActive";
export type SortDirection = "asc" | "desc";

