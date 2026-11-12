export interface AdminUser {
  id: string;
  username: string;
  fullName: string | null;
  email: string | null;
  phone: string | null;
  bio: string | null;
  avatarUrl: string | null;
  followersCount: number;
  followingCount: number;
  isVerified: boolean;
}

export interface AdminSession {
  accessToken: string;
  expiresAt: number;
  user: AdminUser;
}

export interface AdminSessionInfo {
  expiresAt: number;
  user: AdminUser;
}

export interface LoginCredentials {
  identity: string;
  password: string;
}
