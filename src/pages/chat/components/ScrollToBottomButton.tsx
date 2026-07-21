import { memo } from "react";
import { AnimatePresence, m as motion } from "framer-motion";
import { ArrowDown } from "lucide-react";

interface ScrollToBottomButtonProps {
  visible: boolean;
  newMessagesCount: number;
  onClick: () => void;
}

const ScrollToBottomButtonImpl = ({
  visible,
  newMessagesCount,
  onClick,
}: ScrollToBottomButtonProps) => {
  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, y: 12, scale: 0.85 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.85 }}
          transition={{ type: "spring", stiffness: 360, damping: 26 }}
          onClick={onClick}
          className={`fixed bottom-40 left-1/2 -translate-x-1/2 z-20 inline-flex items-center justify-center rounded-full transition-all backdrop-blur-md ring-1 ring-border ${
            newMessagesCount > 0
              ? "h-10 px-4 gap-2 text-primary-foreground"
              : "w-11 h-11 bg-background/85 text-foreground/80 hover:bg-background"
          }`}
          style={
            newMessagesCount > 0
              ? {
                  background:
                    "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.78) 100%)",
                  boxShadow: "0 10px 30px -10px hsl(var(--primary) / 0.55)",
                }
              : undefined
          }
          aria-label={
            newMessagesCount > 0
              ? `${newMessagesCount} new message${newMessagesCount > 1 ? "s" : ""}, jump to latest`
              : "Jump to latest"
          }
        >
          <ArrowDown className="w-4 h-4" strokeWidth={2.4} />
          {newMessagesCount > 0 && (
            <span className="text-[12.5px] font-semibold leading-none">{newMessagesCount} new</span>
          )}
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export const ScrollToBottomButton = memo(ScrollToBottomButtonImpl);

export default ScrollToBottomButton;
