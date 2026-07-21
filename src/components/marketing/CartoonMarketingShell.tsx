/** @doc Shared cartoon shell for public marketing pages — matches the Referrals page visual language. */
import { ReactNode, lazy, Suspense } from "react";
import { m as motion } from "framer-motion";
import LandingNavbar from "@/components/landing/LandingNavbar";
import {
  INK,
  SURFACE,
  BORDER,
  TEXT,
  MUTED,
  PAGE_BG,
  YELLOW,
  MINT,
} from "@/pages/billing/ReferralsPage";

const LandingFooter = lazy(() => import("@/components/landing/LandingFooter"));

export { INK, SURFACE, BORDER, TEXT, MUTED, PAGE_BG, YELLOW, MINT };

interface CartoonPageProps {
  children: ReactNode;
  /** When true, hides LandingNavbar/LandingFooter for chat-style full-height pages. */
  bare?: boolean;
}

export function CartoonMarketingPage({ children, bare = false }: CartoonPageProps) {
  return (
    <div
      data-theme="dark"
      dir="ltr"
      className="min-h-[100dvh] antialiased"
      style={{
        backgroundColor: PAGE_BG,
        color: TEXT,
        fontFamily: '"Space Grotesk", "Inter", system-ui, sans-serif',
      }}
    >
      {!bare && <LandingNavbar />}
      <main>{children}</main>
      {!bare && (
        <Suspense fallback={null}>
          <LandingFooter />
        </Suspense>
      )}
    </div>
  );
}

interface HeroProps {
  sticker?: string;
  bg: string;
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  cta?: ReactNode;
}

export function CartoonHero({ sticker, bg, eyebrow, title, subtitle, cta }: HeroProps) {
  return (
    <section className="px-4 pt-24 md:pt-32">
      <div className="mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="rounded-[36px] p-8 md:p-12 text-center"
          style={{
            backgroundColor: bg,
            border: `2.5px solid ${INK}`,
            boxShadow: `6px 6px 0 ${INK}`,
          }}
        >
          {sticker && (
            <img
              src={sticker}
              alt=""
              width={170}
              height={170}
              className="mx-auto mb-4 h-36 w-36 md:h-44 md:w-44 object-contain drop-shadow-[3px_3px_0_rgba(0,0,0,0.25)]"
            />
          )}
          {eyebrow && (
            <p
              className="text-[11px] uppercase tracking-[0.22em] mb-3"
              style={{ color: INK, fontWeight: 900, opacity: 0.7 }}
            >
              {eyebrow}
            </p>
          )}
          <h1
            className="text-[34px] md:text-[52px] leading-[0.98]"
            style={{ color: INK, fontWeight: 900, letterSpacing: "-0.03em" }}
          >
            {title}
          </h1>
          {subtitle && (
            <p
              className="mt-4 mx-auto max-w-[520px] text-[14px] md:text-[16px] leading-relaxed"
              style={{ color: INK, opacity: 0.78, fontWeight: 600 }}
            >
              {subtitle}
            </p>
          )}
          {cta && <div className="mt-6 flex flex-wrap justify-center gap-3">{cta}</div>}
        </motion.div>
      </div>
    </section>
  );
}

export function CartoonContainer({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`px-4 py-10 md:py-14 ${className}`}>
      <div className="mx-auto max-w-3xl">{children}</div>
    </section>
  );
}

export function CartoonCard({
  children,
  className = "",
  tone,
  flat = false,
}: {
  children: ReactNode;
  className?: string;
  tone?: string;
  flat?: boolean;
}) {
  return (
    <div
      className={`rounded-[26px] p-6 md:p-7 ${className}`}
      style={{
        backgroundColor: tone ?? SURFACE,
        border: `2px solid ${tone ? INK : BORDER}`,
        boxShadow: flat ? "none" : tone ? `4px 4px 0 ${INK}` : "none",
        color: tone ? INK : TEXT,
      }}
    >
      {children}
    </div>
  );
}

interface PillButtonProps {
  children: ReactNode;
  onClick?: () => void;
  href?: string;
  tone?: string;
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
  ariaLabel?: string;
}

export function PillButton({
  children,
  onClick,
  href,
  tone = YELLOW,
  className = "",
  type = "button",
  disabled,
  ariaLabel,
}: PillButtonProps) {
  const sharedStyle = {
    backgroundColor: tone,
    color: INK,
    border: `2.5px solid ${INK}`,
    boxShadow: `4px 4px 0 ${INK}`,
    fontWeight: 900,
  } as const;
  const sharedClass = `inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-[14px] transition active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed ${className}`;

  if (href) {
    return (
      <a href={href} aria-label={ariaLabel} className={sharedClass} style={sharedStyle}>
        {children}
      </a>
    );
  }
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={sharedClass}
      style={sharedStyle}
    >
      {children}
    </button>
  );
}

export function SectionEyebrow({ children }: { children: ReactNode }) {
  return (
    <p
      className="text-[11px] uppercase tracking-[0.24em] mb-2"
      style={{ color: MUTED, fontWeight: 900 }}
    >
      {children}
    </p>
  );
}

export function SectionTitle({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <h2
      className={`text-[28px] md:text-[40px] leading-[0.98] ${className}`}
      style={{ color: TEXT, fontWeight: 900, letterSpacing: "-0.025em" }}
    >
      {children}
    </h2>
  );
}
