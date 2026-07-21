/** @doc Showcase — a clean, editorial gallery of hero/landing prompts. Free items copy instantly; Pro items route users to the Plus upgrade page. */
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowUpRight, Check, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Helmet } from "react-helmet-async";

type Item = {
  id: string;
  name: string;
  description: string | null;
  category: string;
  media_type: string;
  media_url: string;
  thumbnail_url: string | null;
  is_pro: boolean;
  display_order: number;
};

const LandingGalleryPage = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data, error } = await supabase
        .from("landing_page_prompts_public" as any)
        .select("*")
        .order("display_order", { ascending: false })
        .order("created_at", { ascending: false });
      if (!alive) return;
      if (error) {
        console.error(error);
        toast.error("Failed to load showcase");
      } else {
        setItems((data as any) ?? []);
      }
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, []);

  const handleCopy = async (item: Item) => {
    setBusyId(item.id);
    try {
      const { data, error } = await supabase.rpc("get_landing_page_prompt" as any, {
        item_id: item.id,
      });
      if (error) throw error;
      const prompt = (data as string | null) ?? null;
      if (!prompt) {
        toast.error("Prompt unavailable");
        return;
      }
      await navigator.clipboard.writeText(prompt);
      setCopiedId(item.id);
      toast.success("Prompt copied");
      setTimeout(() => setCopiedId((c) => (c === item.id ? null : c)), 1800);
    } catch (e) {
      console.error(e);
      toast.error("Copy failed");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <Helmet>
        <title>Showcase — ready-to-copy landing page prompts</title>
        <meta
          name="description"
          content="A curated showcase of hero and landing page prompts with live previews. Copy free prompts instantly; unlock premium prompts with Plus."
        />
        <link rel="canonical" href="/showcase" />
      </Helmet>

      {/* Hero */}
      <section className="border-b border-border/60">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 pt-8 pb-10 sm:pt-12 sm:pb-14">
          <button
            onClick={() => (window.history.length > 1 ? navigate(-1) : navigate("/"))}
            className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-foreground transition mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <p className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground mb-4">
            Showcase
          </p>
          <h1 className="text-4xl sm:text-6xl font-semibold tracking-tight leading-[1.02] max-w-3xl">
            Landing pages,
            <br />
            <span className="text-muted-foreground">ready to copy.</span>
          </h1>
          <p className="mt-5 max-w-xl text-[15px] text-muted-foreground leading-relaxed">
            A curated set of hero prompts. Preview the result, then copy the exact prompt
            into your build session.
          </p>
        </div>
      </section>

      {/* Grid */}
      <section className="max-w-6xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[4/3] rounded-xl bg-muted/40 border border-border/60 animate-pulse"
              />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-24 text-muted-foreground">
            Nothing yet. Check back soon.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => {
              const isBusy = busyId === item.id;
              const isCopied = copiedId === item.id;
              return (
                <article
                  key={item.id}
                  className="group flex flex-col gap-4"
                >
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-muted border border-border/60">
                    {item.media_type === "video" ? (
                      <video
                        src={item.media_url}
                        poster={item.thumbnail_url ?? undefined}
                        className="w-full h-full object-cover"
                        autoPlay
                        muted
                        loop
                        playsInline
                      />
                    ) : (
                      <img
                        src={item.media_url}
                        alt={item.name}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.02]"
                      />
                    )}
                    {item.is_pro && (
                      <div className="absolute top-3 left-3 rounded-full bg-background/85 backdrop-blur-md px-2.5 py-1 text-[10px] font-semibold tracking-[0.16em] uppercase text-foreground border border-border/60">
                        Pro
                      </div>
                    )}
                  </div>

                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="font-medium text-[15px] truncate">{item.name}</h3>
                      <p className="text-[13px] text-muted-foreground line-clamp-1 mt-0.5">
                        {item.description ?? item.category.replace(/-/g, " ")}
                      </p>
                    </div>
                    {item.is_pro ? (
                      <button
                        onClick={() => navigate("/pricing")}
                        className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-foreground text-background text-[12px] font-medium px-3.5 py-1.5 hover:opacity-90 transition"
                      >
                        Unlock
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleCopy(item)}
                        disabled={isBusy}
                        className="shrink-0 inline-flex items-center gap-1.5 rounded-full border border-border bg-background text-foreground text-[12px] font-medium px-3.5 py-1.5 hover:bg-muted disabled:opacity-60 transition"
                      >
                        {isBusy ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            Copying
                          </>
                        ) : isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            Copied
                          </>
                        ) : (
                          "Copy prompt"
                        )}
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <div className="mt-16 pt-10 border-t border-border/60 text-center text-[13px] text-muted-foreground">
          Pro prompts unlock with any active subscription.
        </div>
      </section>
    </div>
  );
};

export default LandingGalleryPage;
