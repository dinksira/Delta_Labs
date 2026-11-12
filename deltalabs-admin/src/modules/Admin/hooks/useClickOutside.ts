import { useEffect, type RefObject } from "react";

export function useClickOutside(
  ref: RefObject<HTMLElement | null>,
  onOutside: () => void,
  active = true
): void {
  useEffect(() => {
    if (!active) return;

    const handlePointerDown = (event: MouseEvent) => {
      const element = ref.current;
      if (!element) return;
      if (!element.contains(event.target as Node)) {
        onOutside();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [ref, onOutside, active]);
}
