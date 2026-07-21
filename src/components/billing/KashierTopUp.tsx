/** @doc Kashier top-up card — lets MENA users pay in EGP with card or Vodafone Cash and get MC credits. */
import { useState } from "react";
import { CreditCard, Smartphone, Loader2, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

type Method = "card" | "vodafone_cash";

// Preset packs — priced in EGP. 1 USD ~= 48 EGP baseline; adjust to match pricing table.
// UI-only labels. Real price/credits come from server catalog (billing_skus).
// sku values MUST match rows in public.billing_skus.
const PACKS: Array<{ id: string; sku: string; label: string; amount: number; credits: number; badge?: string }> = [
  { id: "starter", sku: "topup_starter", label: "Starter", amount: 149, credits: 250 },
  { id: "pro",     sku: "topup_pro",     label: "Pro",     amount: 299, credits: 500, badge: "Best seller" },
  { id: "elite",   sku: "topup_elite",   label: "Elite",   amount: 799, credits: 1500, badge: "Best value" },
];

export default function KashierTopUp() {
  const [method, setMethod] = useState<Method>("card");
  const [packId, setPackId] = useState<string>("pro");
  const [loading, setLoading] = useState(false);

  const pack = PACKS.find((p) => p.id === packId)!;

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        toast({ title: "Sign in required", description: "Please sign in to continue payment." });
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke("kashier-checkout", {
        body: {
          sku: pack.sku,
          method,
          display: "en",
        },
      });

      if (error || !data?.checkout_url) {
        console.error(error);
        toast({
          title: "Could not start payment",
          description: "Please try again later or choose another method.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      window.location.href = data.checkout_url;
    } catch (e) {
      console.error(e);
      toast({ title: "Unexpected error", variant: "destructive" });
      setLoading(false);
    }
  };

  return (
    <div dir="ltr" className="rounded-2xl border border-border/70 bg-card p-4 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-[15px] font-semibold text-foreground">Local payments</h3>
          <p className="text-[12.5px] text-muted-foreground mt-0.5">
            Visa · Mastercard · Meeza · Vodafone Cash · E-wallets
          </p>
        </div>
        <span className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
          <Shield className="w-3 h-3" /> Secure
        </span>
      </div>

      {/* Method */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setMethod("card")}
          className={`flex items-center justify-center gap-2 h-11 rounded-xl border text-[13px] font-medium transition ${
            method === "card"
              ? "border-foreground bg-foreground text-background"
              : "border-border/70 text-foreground hover:bg-foreground/[0.04]"
          }`}
        >
          <CreditCard className="w-4 h-4" /> Bank card
        </button>
        <button
          type="button"
          onClick={() => setMethod("vodafone_cash")}
          className={`flex items-center justify-center gap-2 h-11 rounded-xl border text-[13px] font-medium transition ${
            method === "vodafone_cash"
              ? "border-red-500 bg-red-500 text-white"
              : "border-border/70 text-foreground hover:bg-red-500/5"
          }`}
        >
          <Smartphone className="w-4 h-4" /> Vodafone Cash
        </button>
      </div>

      {/* Packs */}
      <div className="grid grid-cols-3 gap-2">
        {PACKS.map((p) => {
          const active = packId === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setPackId(p.id)}
              className={`relative rounded-xl border p-3 text-right transition ${
                active
                  ? "border-foreground bg-foreground/[0.04]"
                  : "border-border/70 hover:border-foreground/40"
              }`}
            >
              {p.badge && (
                <span className="absolute -top-2 right-2 text-[9.5px] px-1.5 py-0.5 rounded-full bg-amber-500 text-black font-bold">
                  {p.badge}
                </span>
              )}
              <p className="text-[12px] text-muted-foreground">{p.label}</p>
              <p className="text-[16px] font-bold text-foreground mt-0.5 tabular-nums">
                {p.amount} <span className="text-[11px] font-normal text-muted-foreground">EGP</span>
              </p>
              <p className="text-[11px] text-emerald-500 mt-1 tabular-nums">+{p.credits} MC</p>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={handleCheckout}
        disabled={loading}
        className="w-full h-11 rounded-xl bg-foreground text-background text-[13.5px] font-semibold hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> Preparing payment...
          </>
        ) : (
          <>
            Pay {pack.amount} EGP with {method === "vodafone_cash" ? "Vodafone Cash" : "card"}
          </>
        )}
      </button>

      <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
        You will be redirected to secure checkout. Credits are added automatically after payment.
      </p>
    </div>
  );
}
