import type { Metadata } from "next";
import { Suspense } from "react";

import { LoginView } from "@/modules/Admin/views";

export const metadata: Metadata = {
  title: "Sign in & Organization Request | Delta Labs Admin Portal",
  description: "Secure administrative access and enterprise tenancy onboarding.",
};

function LoginFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-canvas">
      <span className="size-8 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginView />
    </Suspense>
  );
}
