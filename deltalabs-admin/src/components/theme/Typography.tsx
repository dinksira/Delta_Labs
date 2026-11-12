import React from "react";
import { cn } from "@/lib/cn";

export type HeadingLevel = 1 | 2 | 3 | 4;

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level?: HeadingLevel;
}

const headingClasses: Record<HeadingLevel, string> = {
  1: "text-3xl font-black",
  2: "text-2xl font-black",
  3: "text-xl font-black",
  4: "text-base font-bold",
};

const headingTags: Record<HeadingLevel, "h1" | "h2" | "h3" | "h4"> = {
  1: "h1",
  2: "h2",
  3: "h3",
  4: "h4",
};

export function Heading({
  level = 2,
  className,
  ...props
}: HeadingProps) {
  const Tag = headingTags[level];
  return (
    <Tag
      className={cn(
        "text-text-primary",
        headingClasses[level],
        className
      )}
      {...props}
    />
  );
}

export type TextVariant = "body" | "secondary" | "caption" | "label";

const textClasses: Record<TextVariant, string> = {
  body: "text-sm text-text-primary",
  secondary: "text-sm text-text-secondary",
  caption: "text-xs text-text-tertiary",
  label: "text-xs font-bold uppercase tracking-wider text-text-secondary",
};

export interface TextProps
  extends React.HTMLAttributes<HTMLParagraphElement> {
  variant?: TextVariant;
  as?: "p" | "span" | "div";
}

export function Text({
  variant = "body",
  as: Tag = "p",
  className,
  ...props
}: TextProps) {
  return <Tag className={cn(textClasses[variant], className)} {...props} />;
}
