"use client";

import { LogOut } from "lucide-react";

import { Button } from "@/components/theme/Button";
import { cn } from "@/lib/utils";

export interface QuitBattleButtonProps {
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

export function QuitBattleButton({ onClick, disabled, className }: Readonly<QuitBattleButtonProps>) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "gap-1.5 border-error-300 text-error-600 hover:bg-error-50 dark:border-error-800 dark:text-error-400 dark:hover:bg-error-950/40",
        className,
      )}
    >
      <LogOut className="size-4 shrink-0" aria-hidden />
      <span>Quit Battle</span>
    </Button>
  );
}

export default QuitBattleButton;

