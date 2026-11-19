"use client";

import { useEffect, useRef, type Ref } from "react";
import { AlertTriangle, LogOut } from "lucide-react";

import { Button } from "@/components/theme/Button";
import { Dialog } from "@/components/theme/Dialog";

export interface QuitTopicBattleModalProps {
  open: boolean;
  title?: string;
  isPending?: boolean;
  onClose: () => void;
  onConfirm: () => void;
  className?: string;
}

interface ConfirmContentProps {
  title?: string;
  isPending?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  confirmRef: Ref<HTMLButtonElement>;
}

function ConfirmContent({
  title,
  isPending = false,
  onCancel,
  onConfirm,
  confirmRef,
}: Readonly<ConfirmContentProps>) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 px-6 py-5">
        <div className="flex size-12 items-center justify-center rounded-full bg-error-50 dark:bg-error-900/40">
          <AlertTriangle className="size-6 text-error-600" aria-hidden />
        </div>
        <div>
          <h4 className="text-base font-bold text-text-primary">Quit this topic battle?</h4>
          <p className="mt-1 text-sm leading-relaxed text-text-secondary">
            {title
              ? `Are you sure you want to quit "${title}"? Your current duel session will be ended and you will forfeit this battle.`
              : "Are you sure you want to quit this competition? Your current session will be ended and you will forfeit this battle."}
          </p>
        </div>
      </div>
      <div className="flex items-center justify-end gap-3 border-t border-border-default px-6 py-4">
        <Button variant="ghost" onClick={onCancel} disabled={isPending}>
          Stay in battle
        </Button>
        <Button
          ref={confirmRef}
          variant="primary"
          size="lg"
          onClick={onConfirm}
          disabled={isPending}
          className="min-w-36 bg-error-600 hover:bg-error-700 focus-visible:ring-error-300"
        >
          <LogOut className="mr-1.5 size-4" />
          {isPending ? "Quitting..." : "Quit Battle"}
        </Button>
      </div>
    </div>
  );
}

export function QuitTopicBattleModal({
  open,
  title,
  isPending,
  onClose,
  onConfirm,
  className,
}: Readonly<QuitTopicBattleModalProps>) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      confirmRef.current?.focus();
    }
  }, [open]);

  return (
    <Dialog isOpen={open} onClose={onClose} title="Quit Topic Battle" size="sm" className={className}>
      <ConfirmContent
        title={title}
        isPending={isPending}
        onCancel={onClose}
        onConfirm={onConfirm}
        confirmRef={confirmRef}
      />
    </Dialog>
  );
}

export default QuitTopicBattleModal;

