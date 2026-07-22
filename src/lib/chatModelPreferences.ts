export type ModelEffort = "low" | "medium" | "high" | "extra" | "max";

export interface ChatModelPreferences {
  effort: ModelEffort;
  deepThinking: boolean;
}

const STORAGE_KEY = "megsy.chat-model-preferences.v1";
const DEFAULTS: ChatModelPreferences = { effort: "medium", deepThinking: false };

export function readChatModelPreferences(): ChatModelPreferences {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null") as Partial<ChatModelPreferences> | null;
    const effort = stored?.effort;
    return {
      effort: effort && ["low", "medium", "high", "extra", "max"].includes(effort) ? effort : DEFAULTS.effort,
      deepThinking: stored?.deepThinking === true,
    };
  } catch {
    return DEFAULTS;
  }
}

export function setChatModelPreferences(preferences: ChatModelPreferences) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    window.dispatchEvent(new CustomEvent("megsy:chat-model-preferences", { detail: preferences }));
  } catch {}
}

export function chatModelPreferenceHint(preferences = readChatModelPreferences()) {
  const effortHints: Record<ModelEffort, string> = {
    low: "استخدم أقل قدر مناسب من الاستدلال وأجب بسرعة.",
    medium: "استخدم استدلالاً متوازناً يناسب المهمة.",
    high: "حلّل المهمة بعناية وقدّم إجابة قوية ومدروسة.",
    extra: "استخدم استدلالاً عميقاً وتحقق من التفاصيل قبل الإجابة.",
    max: "استخدم أقصى قوة استدلال متاحة للمسائل شديدة التعقيد.",
  };
  const thinkingHint = preferences.deepThinking
    ? "فعّل التفكير العميق للمهام الطويلة: خطط داخلياً، راجع النتيجة، ثم قدّم الإجابة النهائية بوضوح."
    : "";
  return [effortHints[preferences.effort], thinkingHint].filter(Boolean).join(" ");
}