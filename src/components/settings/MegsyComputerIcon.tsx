// Megsy OS icon — clean minimalist mark.
// A rounded display containing a single 4-point sparkle. No rays, no clutter.
import { type SVGProps } from "react";

type Props = SVGProps<SVGSVGElement> & { size?: number | string };

export const MegsyComputerIcon = ({ size = 24, strokeWidth = 1.6, className, ...rest }: Props) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
    {...rest}
  >
    {/* rounded display */}
    <rect x="3" y="4" width="18" height="13" rx="3" />
    {/* base */}
    <path d="M8.5 20.5h7" />
    {/* solid 4-point sparkle, centered */}
    <path
      d="M12 8.2c.35 1.55.95 2.15 2.5 2.5-1.55.35-2.15.95-2.5 2.5-.35-1.55-.95-2.15-2.5-2.5 1.55-.35 2.15-.95 2.5-2.5z"
      fill="currentColor"
      stroke="none"
    />
  </svg>
);

export default MegsyComputerIcon;
