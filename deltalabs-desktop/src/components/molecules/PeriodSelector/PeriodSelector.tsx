/**
 * PeriodSelector
 * Molecule: a compact inline dropdown for choosing a reporting period
 * ("Month", "Quarter", "Year"). Implements the ARIA listbox pattern so it is
 * operable by keyboard and announced correctly, rather than faking one with a
 * styled `<div>`.
 *
 * @example
 * ```tsx
 * <span className="flex items-center gap-1 text-sm text-text-primary">
 *   <span>Enrollment /</span>
 *   <PeriodSelector
 *     value={period}
 *     onChange={setPeriod}
 *     options={["Month", "Quarter", "Year"]}
 *     ariaLabel="Enrollment period"
 *   />
 * </span>
 * ```
 */

import React, { useId } from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { usePeriodMenu } from "./usePeriodMenu";
import type { PeriodSelectorProps } from "./PeriodSelector.types";

const triggerClasses =
  "inline-flex items-center gap-1 rounded-md px-1 font-semibold text-text-primary transition-colors hover:text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300";

const optionClasses = "cursor-pointer px-2 py-1.5 text-sm text-text-primary hover:bg-primary-50";

const selectedOptionClasses = "bg-primary-50 font-semibold text-primary-700";

function PeriodTrigger({
  value,
  isOpen,
  listboxId,
  triggerRef,
  onToggle,
  onKeyDown,
}: Readonly<{
  value: string;
  isOpen: boolean;
  listboxId: string;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  onToggle: () => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLButtonElement>) => void;
}>) {
  return (
    <button
      ref={triggerRef}
      type="button"
      aria-haspopup="listbox"
      aria-expanded={isOpen}
      aria-controls={isOpen ? listboxId : undefined}
      className={triggerClasses}
      onClick={onToggle}
      onKeyDown={onKeyDown}
    >
      {value}
      <ChevronDown
        aria-hidden="true"
        className={cn("size-4 transition-transform", isOpen && "rotate-180")}
      />
    </button>
  );
}

function PeriodListbox<T extends string>({
  listboxId,
  ariaLabel,
  options,
  value,
  activeIndex,
  onSelect,
  onKeyDown,
}: Readonly<{
  listboxId: string;
  ariaLabel: string;
  options: readonly T[];
  value: T;
  activeIndex: number;
  onSelect: (option: T) => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLUListElement>) => void;
}>) {
  return (
    <ul
      id={listboxId}
      role="listbox"
      aria-label={ariaLabel}
      className="absolute bottom-full left-0 z-20 mb-1 min-w-full overflow-hidden rounded-lg border border-border-default bg-surface-default py-1 shadow-md"
      onKeyDown={onKeyDown}
    >
      {options.map((option, index) => (
        <li
          key={option}
          role="option"
          tabIndex={index === activeIndex ? 0 : -1}
          aria-selected={option === value}
          className={cn(
            optionClasses,
            option === value && selectedOptionClasses,
            index === activeIndex && "ring-1 ring-primary-300 ring-inset",
          )}
          onClick={() => onSelect(option)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              onSelect(option);
            }
          }}
        >
          {option}
        </li>
      ))}
    </ul>
  );
}

export function PeriodSelector<T extends string>({
  value,
  options,
  onChange,
  ariaLabel,
  className,
}: Readonly<PeriodSelectorProps<T>>) {
  const listboxId = useId();
  const { isOpen, activeIndex, rootRef, triggerRef, open, close, select, handleListKeyDown } =
    usePeriodMenu({ value, options, onChange });

  const handleTriggerKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      open(true);
    } else if (event.key === "Escape" && isOpen) {
      event.preventDefault();
      close(true);
    }
  };

  return (
    <span ref={rootRef} className={cn("relative inline-flex", className)}>
      <PeriodTrigger
        value={value}
        isOpen={isOpen}
        listboxId={listboxId}
        triggerRef={triggerRef}
        onToggle={() => (isOpen ? close(false) : open(false))}
        onKeyDown={handleTriggerKeyDown}
      />

      {isOpen && (
        <PeriodListbox
          listboxId={listboxId}
          ariaLabel={ariaLabel}
          options={options}
          value={value}
          activeIndex={activeIndex}
          onSelect={select}
          onKeyDown={handleListKeyDown}
        />
      )}
    </span>
  );
}

PeriodSelector.displayName = "PeriodSelector";

export default PeriodSelector;
