import { useMutation } from "@tanstack/react-query";

import { authApi } from "../api/authApi";
import { useAuth } from "../context/AuthContext";
import type { AdminSession, LoginCredentials } from "../types";
import { adminMutationKeys } from "./mutationKeys";

export function useLoginMutation() {
  const { establishSession } = useAuth();

  return useMutation<AdminSession, Error, LoginCredentials>({
    mutationKey: adminMutationKeys.login,
    mutationFn: async (credentials) => {
      const session = await authApi.login(credentials);
      await establishSession(session);
      return session;
    },
  });
}
