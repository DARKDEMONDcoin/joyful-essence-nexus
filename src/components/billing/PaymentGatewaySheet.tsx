/** @doc Payment options menu — minimal bordered rows, no icons, no descriptions. */
import { memo, useEffect } from "react";
import { m as motion } from "framer-motion";

import { IOS_SPRING as iosSpring } from "@/pages/chat/constants/motion";

export type PayOption = "global" | "local" | "wallets";
export type Gateway = PayOption; // backwards compat

const mobileFont =
  "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', system-ui, sans-serif";

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (option: PayOption) => void | Promise<void>;
  loading?: PayOption | null;
  title?: string;
  subtitle?: string;
}

const ROWS: Array<{ id: PayOption; label: string }> = [
  { id: "global", label: "Global" },
  { id: "local", label: "Local" },
  { id: "wallets", label: "E-Wallets" },
];

function PaymentGatewaySheetImpl({
  open,
  onClose,
  onSelect,
  loading = null,
  title = "Choose payment method",
  subtitle = "Pick an option.",
}: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:justify-center pointer-events-none"
      dir="ltr"
    >
      <div
        className="absolute inset-0 bg-transparent pointer-events-auto"
        onClick={onClose}
      />
      <motion.div
        data-plus-menu
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, y: 10, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.985 }}
        transition={{ duration: 0.16, ease: [0.22, 0.9, 0.3, 1] }}
        className="mobile-plus-glass-menu pointer-events-auto relative z-[101] w-full sm:max-w-[420px] sm:rounded-[28px] md:max-h-[70vh] overflow-y-auto rounded-t-[28px] px-3 sm:px-4 pb-[calc(env(safe-area-inset-bottom,0px)+16px)] flex flex-col"
        style={{
          fontFamily: mobileFont,
          background: "rgba(0, 0, 0, 0.32)",
          color: "hsl(var(--brand-parchment))",
          backdropFilter: "blur(22px) saturate(160%)",
          WebkitBackdropFilter: "blur(22px) saturate(160%)",
          boxShadow:
            "inset 0 1px 1px rgba(255,255,255,0.16), 0 0 0 1px rgba(255,255,255,0.18), 0 22px 60px -18px rgba(0,0,0,0.7)",
        }}
      >
        <div className="sm:hidden pt-2.5 pb-2 flex items-center justify-center shrink-0">
          <div className="h-1.5 w-10 rounded-full bg-foreground/30" />
        </div>

        <div className="px-1 pt-1 pb-3">
          <p className="text-[13.5px] font-medium text-foreground leading-none">{title}</p>
          <p className="text-[12px] text-foreground/55 mt-1 leading-snug">{subtitle}</p>
        </div>

        <div
          className="flex flex-col gap-2 p-2.5 rounded-2xl border border-foreground/10"
          style={{
            background: "rgba(255, 255, 255, 0.08)",
            backdropFilter: "blur(20px) saturate(150%)",
            WebkitBackdropFilter: "blur(20px) saturate(150%)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.12), 0 8px 30px rgba(0,0,0,0.18)",
          }}
        >
          {ROWS.map((row) => {
            const isLoading = loading === row.id;
            const disabled = loading !== null && !isLoading;
            return (
              <motion.button
                data-no-neo
                key={row.id}
                type="button"
                disabled={disabled || isLoading}
                whileTap={{ scale: disabled ? 1 : 0.985 }}
                transition={iosSpring}
                onClick={() => onSelect(row.id)}
                className={`w-full flex items-center justify-between border border-foreground/10 rounded-xl bg-foreground/[0.03] px-4 py-3.5 text-left transition-colors ${
                  disabled ? "opacity-40 cursor-not-allowed" : "hover:bg-foreground/[0.07] active:bg-foreground/[0.10]"
                }`}
              >
                <span className="text-[15px] font-medium text-foreground leading-[1.15]">
                  {row.label}
                </span>
                {isLoading ? (
                  <span className="w-4 h-4 border-2 border-foreground/25 border-t-foreground rounded-full animate-spin shrink-0" />
                ) : (
                  <span className="text-foreground/40 shrink-0" aria-hidden>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}

const PaymentGatewaySheet = memo(PaymentGatewaySheetImpl);
export default PaymentGatewaySheet;
