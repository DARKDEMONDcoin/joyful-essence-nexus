import { useState } from "react";
import { Settings2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { MobileBottomSheet } from "@/components/ui/MobileBottomSheet";
import { supabase } from "@/integrations/supabase/client";
import ComposerModelMenu from "../ComposerModelMenu";
import SlidesTemplateButton from "./SlidesTemplateButton";
import ResearchDepthDropdown from "./ResearchDepthDropdown";
import { MediaSettingsPanel } from "@/components/chat/mobile/MediaSettingsMenu";
import type { ChatMode } from "../chatConstants";
import type { AgentDef } from "@/lib/agentRegistry";


interface ComposerInlineSlotProps {
  isMobileViewport: boolean;
  chatMode: ChatMode;
  setChatMode?: (m: ChatMode) => void;
  tierMenuOpen: boolean;
  setTierMenuOpen: (v: boolean) => void;
  selectedModel: any;
  setSelectedModel: (m: any) => void;
  megsyTier: any;
  setMegsyTier: (t: any) => void;
  userPlan: string | null | undefined;
  mediaModel: any;
  setMediaModel: (m: any) => void;
  chatUserId: string | null;
  selectedAgent: AgentDef | null;
  slidesTemplate: any;
  setSlidesPickerOpen: (v: boolean) => void;
  researchDepth: any;
  setResearchDepth: (v: any) => void;
  researchDepthOpen: boolean;
  setResearchDepthOpen: (v: boolean) => void;
  setVideoDurationSec?: (n: any) => void;
}

/** Inline pills/menus rendered inside the composer (AnimatedInput.inlineSlot). */
export function ComposerInlineSlot(props: ComposerInlineSlotProps) {
  const {
    chatMode,
    setChatMode,
    tierMenuOpen,
    setTierMenuOpen,
    selectedModel,
    setSelectedModel,
    megsyTier,
    setMegsyTier,
    userPlan,
    mediaModel,
    setMediaModel,
    chatUserId,
    selectedAgent,
    slidesTemplate,
    setSlidesPickerOpen,
    researchDepth,
    setResearchDepth,
    researchDepthOpen,
    setResearchDepthOpen,
    setVideoDurationSec,
  } = props;

  const [settingsOpen, setSettingsOpen] = useState(false);
  const isMobile = props.isMobileViewport;

  const isSlidesMode =
    chatMode === "slides" ||
    chatMode === "slides-images" ||
    selectedAgent?.id === "slides" ||
    selectedAgent?.id === "slides-images";

  const isMediaMode = chatMode === "images" || chatMode === "video";
  const mediaMode: "images" | "video" = chatMode === "video" ? "video" : "images";

  const isDeepResearch = chatMode === "deep-research";
  const hideModelMenu = isDeepResearch || isSlidesMode;

  return (
    <>
      {!hideModelMenu && (
        <ComposerModelMenu
          mode={chatMode}
          open={tierMenuOpen}
          onOpenChange={setTierMenuOpen}
          selectedModel={selectedModel}
          megsyTier={megsyTier}
          userPlan={userPlan as any}
          mediaModel={mediaModel}
          onTierSelect={(tier) => {
            setSelectedModel(null);
            setMegsyTier(tier);
            if (chatUserId) {
              void supabase
                .from("ai_personalization")
                .upsert({ user_id: chatUserId, preferred_tier: tier } as any, {
                  onConflict: "user_id",
                });
            }
          }}
          onChatModelSelect={(model) =>
            setSelectedModel({ id: model.id, label: model.label, cost: 0 })
          }
          onMediaModelSelect={setMediaModel}
          onModeChange={setChatMode}
          side="top"
          align="center"
        />
      )}
      {isMediaMode ? (
        isMobile ? (
          <>
            <button
              type="button"
              aria-label="Generation settings"
              onClick={() => setSettingsOpen(true)}
              className="shrink-0 inline-flex items-center justify-center h-7 w-7 text-foreground/60 hover:text-foreground transition-colors"
            >
              <Settings2 className="h-4 w-4" strokeWidth={2} />
            </button>
            <MobileBottomSheet
              open={settingsOpen}
              onClose={() => setSettingsOpen(false)}
              initialExpanded
            >
              <div className="px-1 pb-4 pt-1">
                <MediaSettingsPanel
                  mode={mediaMode}
                  onChange={(s) => {
                    if (s.duration !== undefined) setVideoDurationSec?.(s.duration);
                  }}
                />
              </div>
            </MobileBottomSheet>
          </>
        ) : (
          <Popover open={settingsOpen} onOpenChange={setSettingsOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                aria-label="Generation settings"
                className="shrink-0 inline-flex items-center justify-center h-7 w-7 text-foreground/60 hover:text-foreground transition-colors"
              >
                <Settings2 className="h-4 w-4" strokeWidth={2} />
              </button>
            </PopoverTrigger>
            <PopoverContent
              data-tier-menu
              data-media-settings-menu
              side="top"
              align="start"
              sideOffset={8}
              className="w-[min(340px,calc(100vw-24px))] p-3 rounded-2xl unified-menu-surface"
            >
              <MediaSettingsPanel
                mode={mediaMode}
                onChange={(s) => {
                  if (s.duration !== undefined) setVideoDurationSec?.(s.duration);
                }}
              />
            </PopoverContent>
          </Popover>
        )
      ) : null}
      {isSlidesMode ? (
        <SlidesTemplateButton
          slidesTemplate={slidesTemplate}
          onOpenPicker={() => setSlidesPickerOpen(true)}
        />
      ) : null}
      {chatMode === "deep-research" ? (
        <ResearchDepthDropdown
          researchDepth={researchDepth}
          setResearchDepth={setResearchDepth}
          researchDepthOpen={researchDepthOpen}
          setResearchDepthOpen={setResearchDepthOpen}
        />
      ) : null}
    </>
  );
}



