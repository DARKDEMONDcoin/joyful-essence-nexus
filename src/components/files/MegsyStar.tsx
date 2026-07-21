import { memo } from "react";
import { m as motion } from "framer-motion";

/**
 * Brand sparkle — 8-point star.
 * - Solid `currentColor` (text-primary by default).
 * Sized via the `size` prop (px). Pass `static` to render without animation.
 */
const STAR_PATH = "M50 5 L60 40 L95 50 L60 60 L50 95 L40 60 L5 50 L40 40 Z";

const MegsyStar = ({
  size = 16,
  static: isStatic = false,
  className = "text-primary",
}: {
  size?: number;
  static?: boolean;
  className?: string;
}) => {
  if (isStatic) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        className={`shrink-0 ${className}`}
      >
        <path d={STAR_PATH} fill="currentColor" />
      </svg>
    );
  }
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      animate={{ rotate: [0, 180, 360], scale: [1, 1.1, 1] }}
      transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
    >
      <path d={STAR_PATH} fill="currentColor" />
    </motion.svg>
  );
};

export default memo(MegsyStar);
