import { cn } from "@/lib/utils";
import { t as uiT, useUserLang } from "@/lib/authI18n";

interface Props {
  className?: string;
  onClick?: () => void;
}

/**
 * Gold pill used on pricing cards (>= $25 plans). Shows the "Everything is Unlimited"
 * label centered across the full pill width.
 */
export function UnlimitedModelsButton({ className, onClick }: Props) {
  useUserLang();
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "umb-pill-v2 font-display select-none cursor-default justify-center",
        className
      )}
      aria-label={uiT("allModelsIncluded")}
    >
      <span className="umb-label w-full text-center">{uiT("allModelsIncluded")}</span>
    </button>
  );
}

export default UnlimitedModelsButton;


