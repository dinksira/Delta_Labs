"use client";

import React from "react";
import { LogOut, ShieldAlert } from "lucide-react";

import { Button, Card } from "@/components/theme";
import { useAuth } from "../context/AuthContext";

export function AccessDenied() {
  const { logout, session } = useAuth();

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-canvas p-6">
      <Card className="w-full max-w-md p-8 text-center">
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
          <ShieldAlert size={28} />
        </div>
        <h1 className="text-xl font-black text-text-primary">
          Administrative access required
        </h1>
        <p className="mt-2 text-sm text-text-secondary">
          {session?.user.email
            ? `Your account (${session.user.email}) is signed in, but no administrative role is assigned.`
            : "Your account is signed in, but no administrative role is assigned."}
        </p>
        <p className="mt-1 text-xs text-text-tertiary">
          Contact a Super Admin or Organization Admin to request access.
        </p>
        <Button
          className="mt-6"
          fullWidth
          leftIcon={<LogOut size={16} />}
          onClick={() => void logout()}
        >
          Sign out
        </Button>
      </Card>
    </div>
  );
}
