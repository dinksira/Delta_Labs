/**
 * walletQueryKeys
 * Namespaced React Query keys for the Wallet module, extending the shared
 * `["dl", ...]` root from `@/lib/queryKeys`.
 *
 * @example
 * ```ts
 * queryClient.invalidateQueries({ queryKey: walletQueryKeys.all });
 * ```
 */

import { queryKeys } from "@/lib/queryKeys";

export const walletQueryKeys = {
  all: [...queryKeys.root, "wallet"] as const,
  balance: () => [...walletQueryKeys.all, "balance"] as const,
  methods: () => [...walletQueryKeys.all, "methods"] as const,
  transactions: () => [...walletQueryKeys.all, "transactions"] as const,
} as const;
