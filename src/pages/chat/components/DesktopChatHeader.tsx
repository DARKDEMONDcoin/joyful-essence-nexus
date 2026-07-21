import { MobileSidebarButton } from "@/components/shared/MobileSidebarButton";
import { ChatOptionsDropdown } from "./ChatOptionsDropdown";
import MegsyStar from "@/components/files/MegsyStar";
import { prefetchRoute } from "@/hooks/usePrefetchRoute";

interface DesktopChatHeaderProps {
  chatMode: "normal" | "learning" | "shopping" | "images" | "video" | "music" | "slides" | "slides-images" | "deep-research" | "operator" | "code";
  hasConversation: boolean;
  userPlan: string | null;
  navigate: (path: string) => void;
  setSidebarOpen: (open: boolean) => void;
  conversationId: string | null;
  conversationTitle: string;
  isPinned: boolean;
  isDeleting: boolean;
  renameValue: string;
  setRenameValue: (v: string) => void;
  inviteEmail: string;
  setInviteEmail: (v: string) => void;
  inviteLink: string | null;
  inviteLoading: boolean;
  shareMode: "private" | "public";
  setShareMode: (m: "private" | "public") => void;
  generatedShareUrl: string | null;
  setGeneratedShareUrl: (v: string | null) => void;
  chatMenuView: any;
  setChatMenuView: (v: any) => void;
  onNewChat: () => void;
  onTogglePin: () => void;
  onRename: () => void;
  onSendInvite: () => void;
  onCopyInviteLink: () => void;
  onCopyShareLink: () => void;
  onCreateShareLink: () => void;
  onOpenInvite: () => void;
  onConfirmDelete: () => void;
}

/**
 * Sticky chat header rendered on top of the messages area.
 * Aether-inspired: hairline bottom border, tiny brand mark on the left when empty,
 * minimal controls on the right. Desktop-only styling — mobile branch is untouched.
 */
export function DesktopChatHeader(props: DesktopChatHeaderProps) {
  const { chatMode, hasConversation, setSidebarOpen, conversationId, navigate } = props;
  const prefetchPricing = () => {
    void prefetchRoute("/pricing");
  };
  const hideOptions =
    chatMode === "deep-research" || chatMode === "slides" || chatMode === "slides-images";

  return (
    <div
      data-desktop-chat-header="true"
      className="hidden md:flex absolute top-0 inset-x-0 z-20 items-center gap-2 px-5 py-3 min-h-[48px] pointer-events-none [&>*]:pointer-events-auto"
      style={{ background: "transparent" }}
    >
      <MobileSidebarButton onClick={() => setSidebarOpen(true)} />

      <div className="hidden md:flex items-center gap-2 min-w-0">
        {hasConversation && conversationId && !hideOptions ? (
          <ChatOptionsDropdown variant="desktop" {...props} />
        ) : null}
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-2">
        <button
          type="button"
          onPointerDown={prefetchPricing}
          onMouseEnter={prefetchPricing}
          onFocus={prefetchPricing}
          onClick={() => {
            prefetchPricing();
            navigate("/pricing");
          }}
          aria-label="Get Plus"
          className="relative inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full text-[12.5px] font-bold shrink-0 transition-all hover:-translate-y-[1px] active:translate-y-[1px] active:shadow-none bg-black text-white border border-black hover:bg-white hover:text-black"
          style={{
            boxShadow:
              "inset 1px 1px 1px 0 var(--overlay-white-18), inset -1px -1px 1px 0 var(--overlay-white-08), 0 4px 12px rgba(0,0,0,0.18)",
          }}
        >
          <MegsyStar size={16} static className="text-white shrink-0" />

          <span>Get Plus</span>
        </button>

        {hasConversation && conversationId && !hideOptions && (
          <ChatOptionsDropdown variant="mobile" {...props} />
        )}
      </div>
    </div>
  );
}
