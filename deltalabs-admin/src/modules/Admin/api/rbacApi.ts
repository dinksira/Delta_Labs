import { apiClient } from "@/lib/apiClient";

import type { AdminAccessProfile } from "../types";

interface OrgDto {
  id: string;
  slug: string;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface MyOrgsResponseDto {
  items: OrgDto[];
}

interface OrgAccessDto {
  orgId?: string;
  org_id?: string;
  roleKeys?: string[];
  role_keys?: string[];
  permissions?: string[];
  membershipState?: string;
  membership_state?: string;
}

export interface AdminOrgSummary {
  id: string;
  slug: string;
  name: string;
}

export const rbacApi = {
  async listMyOrgs(): Promise<AdminOrgSummary[]> {
    const data = await apiClient<MyOrgsResponseDto>("/v1/orgs/me");
    return data.items.map((org) => ({
      id: org.id,
      slug: org.slug,
      name: org.name,
    }));
  },

  async getOrgAccess(orgId: string): Promise<AdminAccessProfile> {
    const data = await apiClient<OrgAccessDto>(
      `/v1/orgs/${encodeURIComponent(orgId)}/access`
    );

    return {
      orgId: data.orgId ?? data.org_id ?? orgId,
      roleKeys: data.roleKeys ?? data.role_keys ?? [],
      permissions: data.permissions ?? [],
      membershipState:
        data.membershipState ?? data.membership_state ?? "unknown",
    };
  },
};
