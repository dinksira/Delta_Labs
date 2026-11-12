import { apiClient } from "@/lib/apiClient";

import type {
  AdminSession,
  AdminSessionInfo,
  AdminUser,
  LoginCredentials,
} from "../types";

interface AuthUserDto {
  user_id: string;
  username: string;
  full_name: string | null;
  email: string | null;
  phone_e164: string | null;
  bio: string | null;
  avatar_url: string | null;
  followers_count: number;
  following_count: number;
  is_verified: boolean;
}

interface SessionDto {
  session_id: string;
  user_id: string;
  expires_at: string;
}

interface AuthIssuedResponseDto {
  access_token: string;
  session: SessionDto;
  user: AuthUserDto;
}

interface AuthSuccessResponseDto {
  session: SessionDto;
  user: AuthUserDto;
}

function parseExpiry(value: string): number {
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? Date.now() + 24 * 60 * 60 * 1000 : parsed;
}

function mapUser(dto: AuthUserDto): AdminUser {
  return {
    id: dto.user_id,
    username: dto.username,
    fullName: dto.full_name,
    email: dto.email,
    phone: dto.phone_e164,
    bio: dto.bio,
    avatarUrl: dto.avatar_url,
    followersCount: dto.followers_count,
    followingCount: dto.following_count,
    isVerified: dto.is_verified,
  };
}

function mapSessionInfo(
  session: SessionDto,
  user: AuthUserDto
): AdminSessionInfo {
  return {
    expiresAt: parseExpiry(session.expires_at),
    user: mapUser(user),
  };
}

export const authApi = {
  async login(credentials: LoginCredentials): Promise<AdminSession> {
    const data = await apiClient<AuthIssuedResponseDto>("/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({
        identity: credentials.identity,
        password: credentials.password,
      }),
    });

    return {
      accessToken: data.access_token,
      expiresAt: parseExpiry(data.session.expires_at),
      user: mapUser(data.user),
    };
  },

  async getSession(): Promise<AdminSessionInfo> {
    const data = await apiClient<AuthSuccessResponseDto>("/v1/auth/session");
    return mapSessionInfo(data.session, data.user);
  },

  async logout(): Promise<void> {
    await apiClient<{ status: string }>("/v1/auth/logout", { method: "POST" });
  },
};
