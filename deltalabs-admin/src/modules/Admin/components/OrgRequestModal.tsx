/**
 * @file OrgRequestModal.tsx
 * @description Accessible dialog for requesting new organization tenancy and administrative access.
 * Adheres strictly to Delta Labs design tokens and atomic design guidelines.
 * @example
 * <OrgRequestModal open={isOpen} onClose={() => setIsOpen(false)} />
 */

// ===== IMPORTS =====
import React, { useState } from "react";
import { Building2, CheckCircle2, Mail, Send, User } from "lucide-react";

import { Button, Input, Modal } from "@/components/theme";

// ===== TYPES =====
export interface OrgRequestModalProps {
  open: boolean;
  onClose: () => void;
}

interface FormState {
  name: string;
  email: string;
  orgName: string;
  role: string;
  notes: string;
}

const INITIAL_FORM: FormState = {
  name: "",
  email: "",
  orgName: "",
  role: "Org Admin",
  notes: "",
};

// ===== CONSTANTS =====
const ROLE_OPTIONS = [
  "Org Admin",
  "School Principal",
  "Content Moderator",
  "Auditor / Finance",
] as const;

// ===== COMPONENT =====
export function OrgRequestModal({ open, onClose }: OrgRequestModalProps) {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    setIsSubmitted(false);
    setError(null);
    setForm(INITIAL_FORM);
    onClose();
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (form.name.trim().length < 2) {
      setError("Please provide the administrator full name.");
      return;
    }

    if (!form.email.includes("@") || !form.email.includes(".")) {
      setError("Please provide a valid work email address.");
      return;
    }

    if (form.orgName.trim().length < 2) {
      setError("Please provide your school or organization name.");
      return;
    }

    setIsSubmitting(true);
    // Simulate network submission of onboarding inquiry
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 600);
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={isSubmitted ? undefined : "Request Organization Tenancy"}
      description={
        isSubmitted
          ? undefined
          : "Submit an onboarding inquiry to provision an isolated tenant workspace with role-based governance."
      }
      size="md"
    >
      {isSubmitted ? (
        <div className="flex flex-col items-center py-6 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200">
            <CheckCircle2 size={32} />
          </div>

          <h3 className="mt-4 text-xl font-bold text-text-primary">
            Onboarding Request Received
          </h3>

          <p className="mt-2 max-w-sm text-sm leading-relaxed text-text-secondary">
            Your request for <span className="font-semibold text-text-primary">{form.orgName}</span> has been logged. Our operations team will verify credentials and route an activation invite to <span className="font-semibold text-text-primary">{form.email}</span> within 1 business day.
          </p>

          <div className="mt-6 w-full max-w-xs">
            <Button
              type="button"
              variant="primary"
              fullWidth
              onClick={handleClose}
            >
              Return to Sign In
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <Input
            label="Administrator Full Name"
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Dr. Alex Vance"
            leftIcon={<User size={16} />}
            required
          />

          <Input
            label="Institutional / Work Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="alex.vance@quantum-institute.edu"
            leftIcon={<Mail size={16} />}
            required
          />

          <Input
            label="Organization or School Name"
            type="text"
            value={form.orgName}
            onChange={(e) => setForm({ ...form, orgName: e.target.value })}
            placeholder="Quantum Institute of Technology"
            leftIcon={<Building2 size={16} />}
            required
          />

          <div className="flex flex-col gap-1.5">
            <label htmlFor="org-role" className="text-xs font-bold text-text-secondary">
              Requested Role Scope
            </label>
            <select
              id="org-role"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="h-10 w-full rounded-xl border border-border-subtle bg-surface-secondary px-3 text-sm text-text-primary outline-none transition-colors focus:border-primary-600 focus-visible:ring-2 focus-visible:ring-primary-600/20"
            >
              {ROLE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="org-notes" className="text-xs font-bold text-text-secondary">
              Intended Usage & Requirements (Optional)
            </label>
            <textarea
              id="org-notes"
              rows={3}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="e.g. 500 enrolled students, custom grading rubric, multi-campus setup"
              className="w-full resize-none rounded-xl border border-border-subtle bg-surface-secondary p-3 text-sm text-text-primary outline-none transition-colors placeholder:text-text-tertiary focus:border-primary-600 focus-visible:ring-2 focus-visible:ring-primary-600/20"
            />
          </div>

          {error ? (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700"
            >
              {error}
            </div>
          ) : null}

          <div className="flex items-center justify-end gap-3 pt-3">
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              rightIcon={<Send size={15} />}
            >
              Submit Request
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}

