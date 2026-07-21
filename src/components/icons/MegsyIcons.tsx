/** @doc Custom Megsy brand icons — clean, unique alternatives to generic Lucide icons. */
import * as React from "react";

type IconProps = {
  size?: number;
  color?: string;
  className?: string;
  title?: string;
};

/**
 * Megsy spend icon — a coin/dot leading into a downward-right arrow.
 * Clean, geometric, and unique to the MC credit outflow concept.
 */
export const MegsySpendIcon = React.forwardRef<SVGSVGElement, IconProps>(
  ({ size = 18, color, className, title }, ref) => (
    <svg
      ref={ref}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color ?? "currentColor"}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
    >
      {title ? <title>{title}</title> : null}
      <circle cx="7.5" cy="7.5" r="2.2" fill="currentColor" stroke="none" />
      <path d="M9.5 9.5l6.5 6.5" />
      <path d="M16 16h-4.5v-4.5" />
    </svg>
  )
);
MegsySpendIcon.displayName = "MegsySpendIcon";

/**
 * Megsy earn icon — a coin/dot leading into an upward-right arrow.
 * Mirror of the spend icon for MC credit inflow.
 */
export const MegsyEarnIcon = React.forwardRef<SVGSVGElement, IconProps>(
  ({ size = 18, color, className, title }, ref) => (
    <svg
      ref={ref}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color ?? "currentColor"}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
    >
      {title ? <title>{title}</title> : null}
      <circle cx="7.5" cy="16.5" r="2.2" fill="currentColor" stroke="none" />
      <path d="M9.5 14.5l6.5-6.5" />
      <path d="M16 8v4.5h-4.5" />
    </svg>
  )
);
MegsyEarnIcon.displayName = "MegsyEarnIcon";
