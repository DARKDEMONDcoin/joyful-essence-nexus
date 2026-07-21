import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Check, Loader2 } from "lucide-react";
import type { Integration } from "@/lib/integrationsData";

interface IntegrationDetailModalProps {
  integration: Integration | null;
  isConnected: boolean;
  isLoading: boolean;
  meta?: any;
  onConnect: (form?: any) => void;
  onDisconnect: () => void;
  onClose: () => void;
}

import { brandLogoSources } from "@/lib/brandLogoSources";


function AppLogo({ integration, size = 56 }: { integration: Integration; size?: number }) {
  const [idx, setIdx] = useState(0);
  const sources = integration.domain ? brandLogoSources(integration.domain) : [];
  const url = sources[idx];
  if (!url) {
    return (
      <span className="font-semibold text-foreground/70" style={{ fontSize: size * 0.4 }}>
        {integration.name.charAt(0)}
      </span>
    );
  }
  return (
    <img
      src={url}
      alt=""
      width={size}
      height={size}
      style={{ width: size, height: size }}
      className="object-contain"
      loading="lazy"
      onError={() => setIdx((i) => i + 1)}
    />
  );
}

export default function IntegrationDetailModal({
  integration,
  isConnected,
  isLoading,
  onConnect,
  onDisconnect,
  onClose,
}: IntegrationDetailModalProps) {
  const open = !!integration;
  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent
        className="p-0 gap-0 border-foreground/10 bg-card sm:max-w-[420px] rounded-3xl overflow-hidden [&>button[aria-label='Close']]:hidden"
      >
        {integration && (
          <div className="relative">
            {/* Header */}
            <div className="pt-8 pb-5 px-6 flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-2xl bg-foreground/[0.05] border border-foreground/10 grid place-items-center shadow-sm">
                <AppLogo integration={integration} size={44} />
              </div>
              <h2 className="mt-4 text-[20px] font-semibold tracking-tight text-foreground">
                {integration.name}
              </h2>
              <p className="mt-0.5 text-[12px] font-medium uppercase tracking-[0.14em] text-foreground/40">
                {integration.category}
              </p>
              {isConnected && (
                <span className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-semibold">
                  <Check className="w-3 h-3" strokeWidth={2.8} />
                  Connected
                </span>
              )}
              <p className="mt-4 text-[14px] leading-relaxed text-foreground/70 max-w-[300px]">
                {integration.description}
              </p>
            </div>

            {/* Actions */}
            <div className="px-5 pb-5 space-y-2.5">
              {isConnected ? (
                <button
                  onClick={onDisconnect}
                  disabled={isLoading}
                  className="w-full h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[15px] font-semibold active:scale-[0.99] transition disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Disconnect
                </button>
              ) : (
                <button
                  onClick={() => onConnect()}
                  disabled={isLoading}
                  className="w-full h-12 rounded-2xl bg-foreground text-background text-[15px] font-semibold active:scale-[0.99] transition disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Connect
                </button>
              )}
              <button
                onClick={onClose}
                className="w-full h-12 rounded-2xl bg-foreground/[0.05] border border-foreground/10 text-foreground text-[15px] font-medium active:scale-[0.99] transition"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
