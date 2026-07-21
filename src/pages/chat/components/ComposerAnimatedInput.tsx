import AnimatedInput from "@/components/chat/AnimatedInput";
import type { AgentDef, AgentModel } from "@/lib/agentRegistry";
import type { ChatMode } from "../chatConstants";
import { ComposerInlineSlot } from "./ComposerInlineSlot";

interface ComposerAnimatedInputProps {
  // Input state
  input: string;
  setInput: (v: string) => void;
  handleSend: () => unknown | Promise<unknown>;
  handleCancel: () => void;
  // Plus menu
  plusMenuOpen: boolean;
  setPlusMenuOpen: (v: boolean) => void;
  setPlusView: (v: any) => void;
  // Loading/disabled
  isLoading: boolean;
  remoteAiBusy: unknown;
  activeResearchJobId: string | null;
  // Questions
  pendingQuestions: any;
  handleQuestionAnswer: (...args: any[]) => void;
  handleQuestionSkip: (...args: any[]) => void;
  // Agent / model
  chatMode: ChatMode;
  setChatMode: (m: ChatMode) => void;
  selectedAgent: AgentDef | null;
  setSelectedAgent: (a: AgentDef | null) => void;
  selectedModel: any;
  setSelectedModel: (m: any) => void;
  setSearchEnabled: (v: boolean) => void;
  handleModeChange: (m: ChatMode) => void;
  tryActivateMegsyOs: () => void;
  // Editing
  editingIndex: number | null;
  cancelEdit: () => void;
  // ComposerInlineSlot
  isMobileViewport: boolean;
  tierMenuOpen: boolean;
  setTierMenuOpen: (v: boolean) => void;
  megsyTier: any;
  setMegsyTier: (t: any) => void;
  userPlan: string | null | undefined;
  mediaModel: any;
  setMediaModel: (m: any) => void;
  chatUserId: string | null;
  slidesTemplate: any;
  setSlidesPickerOpen: (v: boolean) => void;
  researchDepth: any;
  setResearchDepth: (v: any) => void;
  researchDepthOpen: boolean;
  setResearchDepthOpen: (v: boolean) => void;
  /** Whether the composer is rendered inside the chat page (vs. landing/preview). */
  chatContext?: boolean;
  onInputFocusChange?: (focused: boolean) => void;
}

export function ComposerAnimatedInput(props: ComposerAnimatedInputProps) {
  const {
    input,
    setInput,
    handleSend,
    handleCancel,
    plusMenuOpen,
    setPlusMenuOpen,
    setPlusView,
    isLoading,
    remoteAiBusy,
    activeResearchJobId,
    pendingQuestions,
    handleQuestionAnswer,
    handleQuestionSkip,
    chatMode,
    setChatMode,
    selectedAgent,
    setSelectedAgent,
    selectedModel,
    setSelectedModel,
    setSearchEnabled,
    handleModeChange,
    tryActivateMegsyOs,
    editingIndex,
    cancelEdit,
    chatContext,
    onInputFocusChange,
    ...inlineSlotProps
  } = props;

  return (
    <AnimatedInput
      value={input}
      onChange={setInput}
      onSend={handleSend as any}
      onCancel={handleCancel}
      onPlusClick={() => {
        if (!plusMenuOpen) setPlusView("main");
        setPlusMenuOpen(!plusMenuOpen);
      }}
      disabled={isLoading || !!remoteAiBusy || !!activeResearchJobId}
      isLoading={isLoading || !!activeResearchJobId}
      pendingQuestions={pendingQuestions}
      onQuestionAnswer={handleQuestionAnswer}
      onQuestionSkip={handleQuestionSkip}
      activeAgent={
        chatMode !== "normal"
          ? chatMode
          : selectedAgent?.id === "docs"
            ? null
            : selectedAgent?.id || null
      }
      activeAgentDef={selectedAgent?.id === "docs" ? null : selectedAgent || null}
      onAgentSelect={(agent: AgentDef) => {
        if (agent.id === "operator") {
          tryActivateMegsyOs();
          return;
        }
        const modeMap: Record<string, ChatMode> = {
          learning: "learning",
          shopping: "shopping",
          "deep-research": "deep-research",
          operator: "operator",
        };
        if (modeMap[agent.id]) {
          setSelectedAgent(null);
          setSelectedModel(null);
          handleModeChange(modeMap[agent.id]);
          return;
        }
        setChatMode("normal");
        setSelectedAgent(agent);
        setSelectedModel(null);
      }}
      onAgentRemove={() => {
        setChatMode("normal");
        setSelectedAgent(null);
        setSelectedModel(null);
        if (chatMode === "deep-research") setSearchEnabled(false);
      }}
      selectedModel={selectedModel}
      onModelSelect={(model: AgentModel) => setSelectedModel(model)}
      onModelRemove={() => setSelectedModel(null)}
      accentMode={chatMode === "learning" ? "learn" : null}
      isEditing={editingIndex !== null}
      onCancelEdit={cancelEdit}
      chatContext={chatContext}
      onFocusChange={onInputFocusChange}
      inlineSlot={
        <ComposerInlineSlot
          {...inlineSlotProps}
          chatMode={chatMode}
          setChatMode={setChatMode}
          selectedAgent={selectedAgent}
          selectedModel={selectedModel}
          setSelectedModel={setSelectedModel}
        />
      }
      headerSlot={(props as any).activeServiceHeader ?? null}
    />
  );
}
