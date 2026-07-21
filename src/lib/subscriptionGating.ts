import { FREE_MODEL_IDS } from "@/lib/modelDetails";

export const PAID_PLANS = [
  "starter",
  "pro",
  "pro_plus",
  "plus",
  "elite",
  "max",
  "business",
  "team",
  "enterprise",
  "ultimate",
  "premium",
];

export const FREE_IMAGE_MODEL_IDS = [
  "megsy-image",
  "nano-banana",
  "wan2.7-image-pro",
  "wan2.7-image",
  "wan2.6-image",
  "wan2.6-t2i",
  "qwen-image",
  "z-image-turbo",
];

export const isFreeModel = (modelId: string): boolean => {
  const normalized = (modelId || "").toLowerCase();
  return (
    FREE_MODEL_IDS.includes(modelId) ||
    FREE_IMAGE_MODEL_IDS.includes(normalized) ||
    normalized.startsWith("megsy-lite")
  );
};

export const isPaidUser = (plan: string | null | undefined): boolean => {
  return PAID_PLANS.includes((plan || "free").toLowerCase());
};

export const canUseModel = (modelId: string, plan: string | null | undefined): boolean => {
  return isFreeModel(modelId) || isPaidUser(plan);
};

export const canUseCodeWorkspace = (plan: string | null | undefined): boolean => {
  return isPaidUser(plan);
};
