"use client";

/**
 * @file LoginView.tsx
 * @description Enterprise split-screen authentication view for Delta Labs Admin Portal.
 * Composed from design tokens, semantic components, and strict role-based access flows.
 * @example
 * <LoginView />
 */

// ===== IMPORTS =====
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import {
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
  Mail,
} from "lucide-react";

import { Badge, Button, Card, Input } from "@/components/theme";
import { ApiError } from "@/lib/apiClient";
import { OrgRequestModal } from "../components/OrgRequestModal";
import { useAuth } from "../context/AuthContext";
import { useLoginMutation } from "../hooks/useLoginMutation";

// ===== TYPES =====
export type SupportedRole =
  | "Super Admin"
  | "Org Admin"
  | "School Principal"
  | "Content Moderator"
  | "Auditor / Finance";

// ===== COMPONENT =====
export function LoginView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isInitializing, roles } = useAuth();
  const loginMutation = useLoginMutation();

  const [identity, setIdentity] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOrgModalOpen, setIsOrgModalOpen] = useState(false);

  const requestedNext = searchParams.get("next");
  const nextPath =
    requestedNext && requestedNext.startsWith("/") ? requestedNext : "/";

  useEffect(() => {
    if (!isInitializing && isAuthenticated && roles.length > 0) {
      router.replace(nextPath);
    }
  }, [isInitializing, isAuthenticated, roles.length, nextPath, router]);

  const handleQuickFill = () => {
    setIdentity("test2@deltalabs.dev");
    setPassword("Test@123456");
    setError(null);
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    event.preventDefault();
    setError(null);

    if (identity.trim().length < 3) {
      setError("Enter your email, phone number, or username.");
      return;
    }

    if (password.length < 1) {
      setError("Enter your password.");
      return;
    }

    try {
      await loginMutation.mutateAsync({
        identity: identity.trim(),
        password,
      });
      router.replace(nextPath);
    } catch (caught) {
      setError(
        caught instanceof ApiError
          ? caught.message
          : "Unable to sign in. Please verify your credentials and backend connection."
      );
    }
  };

  return (
    <div className="grid min-h-screen bg-surface-canvas lg:grid-cols-12 selection:bg-primary-600 selection:text-white">
      <aside className="relative hidden overflow-hidden bg-primary-950 p-12 text-white lg:flex lg:col-span-5 lg:flex-col lg:justify-between xl:col-span-6">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary-950 via-primary-900 to-primary-950" />

        <div className="pointer-events-none absolute -right-48 -top-48 size-128 rounded-full bg-primary-600/20 blur-3xl" />
        <div className="brand-sheen pointer-events-none absolute -inset-y-32 left-1/3 w-24 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="brand-logo-drift pointer-events-none absolute -bottom-24 -left-24 size-96 opacity-20 xl:size-128">
          <Image
            src="/delta-logo.svg"
            alt=""
            aria-hidden="true"
            width={384}
            height={384}
            className="size-full object-contain"
          />
        </div>
        <div className="brand-logo-drift-reverse pointer-events-none absolute -right-32 -top-24 size-96 opacity-10 xl:size-128">
          <Image
            src="/delta-logo.svg"
            alt=""
            aria-hidden="true"
            width={384}
            height={384}
            className="size-full object-contain"
          />
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <Image
            src="/delta-logo.svg"
            alt="Delta Labs"
            width={36}
            height={36}
            className="size-9 object-contain drop-shadow"
          />
          <div>
            <p className="text-sm font-black tracking-widest text-white">DELTA LABS</p>
            <p className="text-xs font-medium text-white/60">Admin Console</p>
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-xs font-bold uppercase tracking-widest text-white/40">
            Platform governance
          </p>
          <h1 className="mt-6 max-w-xl text-4xl font-black leading-tight tracking-tight text-white xl:text-5xl">
            One console.
            <br />
            Every lab.
          </h1>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/60">
            A quieter way to command the Delta Labs ecosystem.
          </p>
        </div>

        <div className="relative z-10 flex items-end justify-between gap-6 border-t border-white/10 pt-6">
          <div>
            <p className="text-xs font-bold tracking-widest text-white/70">SECURE ADMIN ACCESS</p>
            <p className="mt-1 text-xs text-white/40">Authorized operations only</p>
          </div>
          <span className="h-px w-16 bg-white/30" aria-hidden="true" />
        </div>
      </aside>

      {/* Right Authentication Form Panel */}
      <main className="flex lg:col-span-7 xl:col-span-6 min-h-screen items-center justify-center p-6 sm:p-12 lg:min-h-0 bg-surface-canvas">
        <div className="w-full max-w-md">
          {/* Mobile Brand Header */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <Image
              src="/delta-logo.svg"
              alt="Delta Labs"
              width={36}
              height={36}
              className="size-9 object-contain"
            />
            <div>
              <p className="text-xs font-bold tracking-wide text-text-primary">
                DELTA LABS
              </p>
              <p className="text-[11px] text-text-tertiary">Admin Portal</p>
            </div>
          </div>

          <Card className="p-8 shadow-xl shadow-slate-200/50 border border-border-subtle bg-surface-secondary rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <Badge variant="primary" size="sm">
                Administrative Sign In
              </Badge>
              <button
                type="button"
                onClick={handleQuickFill}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-600 hover:text-primary-900 transition-colors bg-primary-50 border border-primary-100 px-2.5 py-1 rounded-lg"
                title="Fill Super Admin test credentials"
              >
                <KeyRound size={13} />
                <span>Quick-fill Admin</span>
              </button>
            </div>

            <h2 className="text-2xl font-bold tracking-tight text-text-primary">
              Welcome back
            </h2>
            <p className="mt-1.5 text-sm text-text-secondary">
              Sign in with your administrative credentials to access the console.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
              <Input
                label="Email, phone, or username"
                type="text"
                value={identity}
                onChange={(event) => setIdentity(event.target.value)}
                placeholder="test2@deltalabs.dev"
                autoComplete="username"
                leftIcon={<Mail size={16} />}
              />

              <div className="space-y-1">
                <Input
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  leftIcon={<LockKeyhole size={16} />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="text-text-tertiary transition-colors hover:text-text-secondary p-1"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  }
                />
              </div>

              {error ? (
                <div
                  role="alert"
                  className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs font-medium text-red-700 animate-in fade-in slide-in-from-top-1 duration-200"
                >
                  <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-600" />
                  <span>{error}</span>
                </div>
              ) : null}

              <div className="pt-2">
                <Button
                  type="submit"
                  fullWidth
                  size="lg"
                  variant="primary"
                  isLoading={loginMutation.isPending}
                  rightIcon={<ArrowRight size={16} />}
                  className="w-full h-12 shadow-md shadow-primary-900/15"
                >
                  Sign in to Admin Console
                </Button>
              </div>
            </form>

            <div className="mt-6 border-t border-border-subtle pt-5 text-center text-sm text-text-secondary">
              <span>Need a new tenant workspace? </span>
              <button
                type="button"
                onClick={() => setIsOrgModalOpen(true)}
                className="font-semibold text-primary-600 hover:text-primary-900 hover:underline transition-colors"
              >
                Request Org Tenancy
              </button>
            </div>

          </Card>
        </div>
      </main>

      {/* Tenancy Onboarding Modal */}
      <OrgRequestModal
        open={isOrgModalOpen}
        onClose={() => setIsOrgModalOpen(false)}
      />
    </div>
  );
}

// ===== EXPORTS =====
export default LoginView;
