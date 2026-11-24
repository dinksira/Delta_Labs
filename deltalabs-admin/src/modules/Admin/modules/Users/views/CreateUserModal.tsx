"use client";

/**
 * @file CreateUserModal.tsx
 * @description Centered modal for creating a new platform user from admin.
 */

// ===== IMPORTS =====
import React, { useEffect, useState } from "react";

import { Eye, EyeOff, Mail, Phone, ShieldCheck, UserPlus } from "lucide-react";

import { ApiError } from "@/lib/apiClient";
import { Button } from "@/components/theme/Button";
import { Input } from "@/components/theme/Input";
import { Modal } from "@/components/theme/Modal";
import { useCreateUserMutation } from "../hooks/useUserMutations";
import type { CreateUserPayload } from "../types";

// ===== TYPES =====
interface CreateUserModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (message: string) => void;
}

interface FormState {
  username: string;
  fullName: string;
  email: string;
  phoneE164: string;
  password: string;
  isActive: boolean;
  isVerified: boolean;
}

type FormErrors = Partial<Record<keyof FormState | "form", string>>;

// ===== CONSTANTS =====
const INITIAL_FORM: FormState = {
  username: "",
  fullName: "",
  email: "",
  phoneE164: "",
  password: "",
  isActive: true,
  isVerified: false,
};

// ===== HELPERS =====
function validateForm(form: FormState): FormErrors {
  const errors: FormErrors = {};
  const username = form.username.trim();
  const email = form.email.trim();
  const phone = form.phoneE164.trim();
  const password = form.password;

  if (username.length < 3) errors.username = "Username must be at least 3 characters.";
  if (!email && !phone) errors.email = "Provide an email or phone number.";
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Enter a valid email address.";
  }
  if (password.length < 10) errors.password = "Password must be at least 10 characters.";
  if (!/[A-Z]/.test(password)) errors.password = "Include an uppercase letter.";
  else if (!/[a-z]/.test(password)) errors.password = "Include a lowercase letter.";
  else if (!/[0-9]/.test(password)) errors.password = "Include a number.";
  else if (!/[^A-Za-z0-9]/.test(password)) errors.password = "Include a symbol.";

  return errors;
}

function toPayload(form: FormState): CreateUserPayload {
  return {
    username: form.username.trim(),
    fullName: form.fullName.trim() || undefined,
    email: form.email.trim() || undefined,
    phoneE164: form.phoneE164.trim() || undefined,
    password: form.password,
    isActive: form.isActive,
    isVerified: form.isVerified,
  };
}

// ===== COMPONENT =====
export function CreateUserModal({ open, onClose, onCreated }: CreateUserModalProps) {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const createUser = useCreateUserMutation();

  useEffect(() => {
    if (!open) return;
    setForm(INITIAL_FORM);
    setErrors({});
    setShowPassword(false);
    createUser.reset();
  }, [open, createUser]);

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined, form: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const nextErrors = validateForm(form);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    try {
      const created = await createUser.mutateAsync(toPayload(form));
      onCreated(`User @${created.username} created successfully.`);
      onClose();
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : "Failed to create user.";
      setErrors({ form: message });
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title="Add New User"
      description="Create a platform account with credentials and initial status."
      className="overflow-hidden"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={createUser.isPending}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="create-user-form"
            leftIcon={<UserPlus size={16} />}
            isLoading={createUser.isPending}
          >
            Create User
          </Button>
        </>
      }
    >
      <form id="create-user-form" onSubmit={handleSubmit} className="space-y-5">
        {errors.form && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {errors.form}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-text-tertiary">
              Username
            </label>
            <Input
              value={form.username}
              onChange={(e) => setField("username", e.target.value)}
              placeholder="jane_doe"
              autoComplete="off"
              required
            />
            {errors.username && <p className="text-xs text-red-600">{errors.username}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-text-tertiary">
              Full Name
            </label>
            <Input
              value={form.fullName}
              onChange={(e) => setField("fullName", e.target.value)}
              placeholder="Jane Doe"
              autoComplete="off"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-text-tertiary">
              Email
            </label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setField("email", e.target.value)}
              placeholder="jane@deltalabs.dev"
              leftIcon={<Mail size={15} />}
              autoComplete="off"
            />
            {errors.email && <p className="text-xs text-red-600">{errors.email}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-text-tertiary">
              Phone
            </label>
            <Input
              value={form.phoneE164}
              onChange={(e) => setField("phoneE164", e.target.value)}
              placeholder="+1 555 123 4567"
              leftIcon={<Phone size={15} />}
              autoComplete="off"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-text-tertiary">
            Temporary Password
          </label>
          <Input
            type={showPassword ? "text" : "password"}
            value={form.password}
            onChange={(e) => setField("password", e.target.value)}
            placeholder="Min 10 chars, upper/lower/number/symbol"
            autoComplete="new-password"
            required
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="pointer-events-auto rounded-md p-1 text-text-tertiary hover:text-text-primary"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            }
          />
          {errors.password ? (
            <p className="text-xs text-red-600">{errors.password}</p>
          ) : (
            <p className="text-xs text-text-tertiary">
              User can change this after signing in.
            </p>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex items-start gap-3 rounded-xl border border-border-subtle bg-surface-muted/40 p-3">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setField("isActive", e.target.checked)}
              className="mt-0.5 size-4 accent-primary-700"
            />
            <div>
              <p className="text-sm font-semibold text-text-primary">Active account</p>
              <p className="text-xs text-text-tertiary">Allow immediate sign-in.</p>
            </div>
          </label>

          <label className="flex items-start gap-3 rounded-xl border border-border-subtle bg-surface-muted/40 p-3">
            <input
              type="checkbox"
              checked={form.isVerified}
              onChange={(e) => setField("isVerified", e.target.checked)}
              className="mt-0.5 size-4 accent-primary-700"
            />
            <div>
              <p className="flex items-center gap-1 text-sm font-semibold text-text-primary">
                <ShieldCheck size={14} className="text-primary-600" />
                Verified
              </p>
              <p className="text-xs text-text-tertiary">Mark identity as verified.</p>
            </div>
          </label>
        </div>
      </form>
    </Modal>
  );
}
