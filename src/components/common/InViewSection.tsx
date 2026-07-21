/**
 * @doc InViewSection — renders children only when the placeholder is near the
 * viewport. Keeps LandingPage sections from all downloading at once on load.
 */
import { Suspense, type ReactNode } from "react";
import { useInView } from "@/lib/lazyOnVisible";

interface Props {
  children: ReactNode;
  fallback: ReactNode;
  rootMargin?: string;
  minHeight?: number | string;
}

const InViewSection = ({ children, fallback, rootMargin = "400px", minHeight = 200 }: Props) => {
  const { ref, inView } = useInView<HTMLDivElement>({ rootMargin });
  return (
    <div
      ref={ref}
      className="cv-auto"
      style={{ minHeight: inView ? undefined : minHeight }}
    >
      {inView ? <Suspense fallback={fallback}>{children}</Suspense> : fallback}
    </div>
  );
};

export default InViewSection;
