/**
 * NativeTitleBar / FloatingWindowControls
 * Atomic Level: Atom
 * 
 * Floating, auto-hiding Window Controls for frameless Electron window.
 * The static title bar is completely removed from the layout so application
 * content takes 100% of the screen. Controls gracefully appear in a modern
 * glassmorphism capsule when hovering over the top-right corner.
 */

import React, { useEffect, useRef, useState } from "react";
import { Copy, Minus, Square, X } from "lucide-react";

import type { NativeTitleBarProps } from "./NativeTitleBar.types";
import { cn } from "@/lib/utils";

// ============================================================================
// COMPONENT
// ============================================================================

export const NativeTitleBar: React.FC<NativeTitleBarProps> = ({
  showControls = true,
  className,
  ...props
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isElectron = typeof window !== "undefined" && Boolean(window.electron?.isElectron);

  useEffect(() => {
    if (!isElectron || !window.electron?.window) return;

    // Check initial maximized state if supported
    window.electron.window.isMaximized?.().then?.((max) => {
      setIsMaximized(max);
    });

    // Subscribe to IPC maximize changes if supported
    const unsubscribe = window.electron.window.onMaximizeChange?.((max) => {
      setIsMaximized(max);
    });

    return () => {
      unsubscribe?.();
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }
    };
  }, [isElectron]);

  // ── ZERO-FOOTPRINT HOVER DETECTION ────────────────────────────────────────
  // We listen to document mousemove rather than placing an invisible div over
  // the top-right corner. This way NO overlay ever blocks the Login / Signup
  // buttons or any other header element.
  useEffect(() => {
    if (!isElectron) return;

    const TRIGGER_WIDTH = 320;  // px from right edge
    const TRIGGER_HEIGHT = 80; // px from top edge
    const HIDE_DELAY_MS = 400;

    const onMouseMove = (e: MouseEvent) => {
      const inZone =
        e.clientX >= window.innerWidth - TRIGGER_WIDTH &&
        e.clientY <= TRIGGER_HEIGHT;

      if (inZone) {
        if (hideTimerRef.current) {
          clearTimeout(hideTimerRef.current);
          hideTimerRef.current = null;
        }
        setIsHovered(true);
      } else {
        if (!hideTimerRef.current) {
          hideTimerRef.current = setTimeout(() => {
            setIsHovered(false);
            hideTimerRef.current = null;
          }, HIDE_DELAY_MS);
        }
      }
    };

    document.addEventListener("mousemove", onMouseMove);
    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }
    };
  }, [isElectron]);

  // Remove old div-based handlers (no longer needed)
  const handleMinimize = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.electron?.window.minimize();
  };

  const handleMaximize = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.electron?.window.maximize();
    setIsMaximized((prev) => !prev);
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.electron?.window.close();
  };

  if (!isElectron || !showControls) {
    return null;
  }


  return (
    <>
      {/* Draggable top-edge strip — ends before the right-side capsule area */}
      <div
        className="fixed top-0 left-0 right-48 h-6 z-40"
        style={{ WebkitAppRegion: "drag" } as React.CSSProperties}
        aria-hidden="true"
      />

      {/*
        ZERO-FOOTPRINT CONTAINER: pointer-events-none at all times.
        The capsule floats inside; hover state is driven by the document
        mousemove listener (see useEffect above) so this div never blocks
        clicks on the Login / Signup / any header buttons underneath.
      */}
      <div
        className={cn(
          "fixed top-3 right-3 z-[9999] flex items-center justify-end",
          "pointer-events-none",
          className
        )}
        aria-hidden={!isHovered}
        {...props}
      >
        {/* Subtle corner glow indicator — pulses when controls are collapsed */}
        <div
          className={cn(
            "absolute -top-3 right-2 h-[3px] w-14 rounded-b-full",
            "bg-gradient-to-r from-indigo-400/0 via-indigo-400/70 to-indigo-400/0",
            "shadow-[0_0_10px_2px_rgba(99,102,241,0.35)]",
            "transition-all duration-500 ease-out",
            isHovered
              ? "opacity-0 scale-x-0"
              : "opacity-100 scale-x-100 animate-pulse"
          )}
          aria-hidden="true"
        />

        {/* Glassmorphism Controls Capsule — only interactive when visible */}
        <div
          className={cn(
            "flex items-center gap-1 px-2.5 py-2 rounded-2xl select-none",
            "bg-white/85 dark:bg-slate-900/90 backdrop-blur-2xl",
            "border border-slate-200/80 dark:border-white/10",
            "shadow-[0_8px_32px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.08)]",
            "dark:shadow-[0_8px_32px_rgba(0,0,0,0.45),0_2px_8px_rgba(0,0,0,0.3)]",
            "transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
            isHovered
              ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
              : "opacity-0 -translate-y-2 scale-95 pointer-events-none"
          )}
          style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
        >
          {/* Minimize — amber */}
          <button
            type="button"
            onClick={handleMinimize}
            className={cn(
              "group relative flex size-7 items-center justify-center rounded-full",
              "text-slate-500 dark:text-slate-400",
              "transition-all duration-150 cursor-pointer",
              "hover:bg-amber-100 dark:hover:bg-amber-500/20",
              "hover:text-amber-600 dark:hover:text-amber-400",
              "active:scale-90"
            )}
            title="Minimize"
            aria-label="Minimize Window"
          >
            <Minus className="size-3.5 stroke-[2.5] transition-transform group-hover:scale-110" />
          </button>

          {/* Maximize / Restore — emerald */}
          <button
            type="button"
            onClick={handleMaximize}
            className={cn(
              "group relative flex size-7 items-center justify-center rounded-full",
              "text-slate-500 dark:text-slate-400",
              "transition-all duration-150 cursor-pointer",
              "hover:bg-emerald-100 dark:hover:bg-emerald-500/20",
              "hover:text-emerald-600 dark:hover:text-emerald-400",
              "active:scale-90"
            )}
            title={isMaximized ? "Restore" : "Maximize"}
            aria-label={isMaximized ? "Restore Window" : "Maximize Window"}
          >
            {isMaximized ? (
              <Copy className="size-3 stroke-[2.2] transition-transform group-hover:scale-110" />
            ) : (
              <Square className="size-3 stroke-[2.2] transition-transform group-hover:scale-110" />
            )}
          </button>

          <div className="w-px h-3.5 bg-slate-200 dark:bg-white/10 mx-0.5" aria-hidden="true" />

          {/* Close — rose */}
          <button
            type="button"
            onClick={handleClose}
            className={cn(
              "group relative flex size-7 items-center justify-center rounded-full",
              "text-slate-500 dark:text-slate-400",
              "transition-all duration-150 cursor-pointer",
              "hover:bg-rose-500 hover:text-white dark:hover:bg-rose-600",
              "active:scale-90 shadow-sm hover:shadow-rose-500/30"
            )}
            title="Close"
            aria-label="Close Window"
          >
            <X className="size-3.5 stroke-[2.5] transition-transform group-hover:scale-110" />
          </button>
        </div>
      </div>
    </>
  );

};

NativeTitleBar.displayName = "NativeTitleBar";

// ============================================================================
// EXPORTS
// ============================================================================

export default NativeTitleBar;
