/**
 * RequirementCard
 * Molecule: one course requirement as a 16:10 media card with an optional status
 * badge overlaid top-right, a title, an icon-led spec list, and a full-width
 * "Look for Resource" call to action pinned to the bottom edge.
 *
 * @example
 * ```tsx
 * <RequirementCard requirement={requirement} onFindResource={handleFind} />
 * ```
 */

import React from "react";
import Image from "next/image";

import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/theme";
import { cn } from "@/lib/utils";
import type { RequirementCardProps, RequirementSpec } from "./RequirementCard.types";
import { cardClasses, bodyClasses, ctaClasses, mediaClasses, specIconClasses, specIconMap, titleClasses } from "./variants";

const statusBadgeClasses = "bg-surface-default text-xs font-medium normal-case text-text-primary";

const SpecRow: React.FC<Readonly<RequirementSpec>> = ({ icon, label }) => {
  const Icon = specIconMap[icon];

  return (
    <li className="flex items-center gap-2 text-sm font-medium text-text-secondary">
      <Icon className={specIconClasses} aria-hidden="true" />
      {label}
    </li>
  );
};

export const RequirementCard: React.FC<Readonly<RequirementCardProps>> = ({
  requirement,
  onFindResource,
  ctaLabel = "Look for Resource",
  className,
}) => (
  <article aria-label={requirement.title} className={cn(cardClasses, className)}>
    <div className={mediaClasses}>
      <Image
        src={requirement.imageSrc}
        alt={requirement.imageAlt}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        className="object-cover"
      />

      {requirement.status && (
        <Badge variant="default" className={cn("absolute top-3 right-3", statusBadgeClasses)}>
          {requirement.status}
        </Badge>
      )}
    </div>

    <div className={bodyClasses}>
      <h3 className={titleClasses}>{requirement.title}</h3>

      <ul className="mb-4 flex flex-1 flex-col gap-2">
        {requirement.specs.map((spec, index) => (
          <SpecRow key={`${spec.icon}-${index}`} icon={spec.icon} label={spec.label} />
        ))}
      </ul>

      {onFindResource && (
        <Button variant="primary" className={ctaClasses} onClick={() => onFindResource(requirement.id)}>
          {ctaLabel}
        </Button>
      )}
    </div>
  </article>
);

RequirementCard.displayName = "RequirementCard";

export default RequirementCard;
