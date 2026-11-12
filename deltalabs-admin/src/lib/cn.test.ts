import { describe, it, expect } from "vitest";
import { cn } from "@/lib/cn";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("px-2", "font-bold")).toBe("px-2 font-bold");
  });

  it("ignores falsy values", () => {
    expect(cn("px-2", false && "hidden", undefined, null)).toBe("px-2");
  });

  it("resolves conflicting tailwind classes to the last one", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });
});
