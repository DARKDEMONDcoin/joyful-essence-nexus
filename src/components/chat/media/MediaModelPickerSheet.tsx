import { useMemo } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";

import { useDynamicModels } from "@/hooks/useModels";
import { Check, Image as ImageIcon, Video as VideoIcon } from "lucide-react";
import { glassModelMenu, glassModelMenuStyle } from "@/components/model-picker/glassModelMenuStyles";
import { BrandIcon, hasBrandIcon } from "@/components/chat/media/BrandIcon";
import megsyIcon from "@/assets/megsy-icon-transparent.png";


export interface MediaModelChoice {
  slug: string;
  name: string;
  provider: string;
  credits: number;
  thumbnail?: string;
  type: "image" | "video";
  isPremium?: boolean;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "images" | "video";
  selectedSlug?: string;
  onSelect: (model: MediaModelChoice) => void;
}

export default function MediaModelPickerSheet({
  open,
  onOpenChange,
  mode,
  selectedSlug,
  onSelect,
}: Props) {
  const { models, loading } = useDynamicModels();

  const filtered = useMemo(() => {
    const target = mode === "video" ? ["video", "video-i2v"] : ["image"];
    return models
      .filter((m) => target.includes(m.type as string))
      .sort((a, b) => {
        const fa = a.isFeatured ? 1 : 0;
        const fb = b.isFeatured ? 1 : 0;
        if (fa !== fb) return fb - fa;
        return (a.credits || 0) - (b.credits || 0);
      });
  }, [models, mode]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className={`h-[78dvh] ${glassModelMenu.bottomSheet}`}
        style={glassModelMenuStyle}
      >
        <SheetHeader className="px-5 pt-4 pb-3 border-b border-foreground/10">
          <SheetTitle className="flex items-center gap-2 text-base font-black text-foreground">
            {mode === "video" ? (
              <VideoIcon className="w-4 h-4" />
            ) : (
              <ImageIcon className="w-4 h-4" />
            )}
            {mode === "video" ? "Choose video model" : "Choose image model"}
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(78dvh-60px)]">
          <div className="p-3 grid grid-cols-1 min-[380px]:grid-cols-2 gap-2.5">
            {loading && (
              <div className="col-span-2 text-center py-10 text-sm text-muted-foreground">
                Loading models…
              </div>
            )}
            {!loading && filtered.length === 0 && (
              <div className="col-span-2 text-center py-10 text-sm text-muted-foreground">
                No models available right now
              </div>
            )}
            {filtered.map((m) => {
              const active = m.slug === selectedSlug;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() =>
                    onSelect({
                      slug: m.slug || m.id,
                      name: m.name,
                      provider: m.provider,
                      credits: m.credits,
                      thumbnail: m.thumbnailUrl || m.iconUrl,
                      type: mode === "video" ? "video" : "image",
                      isPremium: !!m.isPremium,
                    })
                  }
                  className={glassModelMenu.card(active, "text-start rounded-[20px] active:scale-[0.98]")}
                >
                  <div className="aspect-[4/3] w-full rounded-xl overflow-hidden mb-2 flex items-center justify-center">
                    {hasBrandIcon(m.name, m.provider) ? (
                      <BrandIcon name={m.name} provider={m.provider} size={64} variant="color" />
                    ) : m.thumbnailUrl ? (
                      <img
                        src={m.thumbnailUrl}
                        alt={m.name}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img
                        src={megsyIcon}
                        alt="Megsy"
                        className="w-14 h-14 object-contain"
                      />
                    )}
                  </div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1 flex items-center gap-1.5">
                      {hasBrandIcon(m.name, m.provider) ? (
                        <BrandIcon name={m.name} provider={m.provider} size={16} variant="color" className="shrink-0" />
                      ) : (
                        <img src={megsyIcon} alt="" className="w-4 h-4 shrink-0 object-contain" />
                      )}
                      <div className="font-black text-sm truncate text-foreground">
                        {m.name}
                      </div>
                    </div>
                    {active && <Check className="w-4 h-4 text-brand-action shrink-0 mt-0.5" />}
                  </div>
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
