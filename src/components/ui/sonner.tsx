import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

/**
 * Premium toast — Dynamic Island inspired pill.
 * - Floats from the top, glassy, compact
 * - Crisp colored icon dot + clean typography
 * - Smooth spring-like enter/exit
 */
const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      position="top-center"
      offset={"max(12px, env(safe-area-inset-top))" as unknown as number}
      duration={2000}
      visibleToasts={1}
      gap={8}
      className="toaster group"
      toastOptions={{
        unstyled: false,
        classNames: {
          toast: [
            "group toast pointer-events-auto select-none",
            "!w-auto !max-w-[88vw] mx-auto",
            "inline-flex items-center gap-2",
            "!pl-3 !pr-3.5 !py-2",
            "rounded-full",
            "bg-[hsl(var(--popover)/0.92)] backdrop-blur-xl",
            "border border-border/50",
            "shadow-[0_8px_24px_-10px_hsl(var(--foreground)/0.35)]",
            "text-popover-foreground antialiased",
          ].join(" "),
          title: "text-[12.5px] font-medium leading-none tracking-[-0.01em] truncate",
          description: "text-[11.5px] font-normal leading-snug text-muted-foreground",
          icon: [
            "shrink-0 grid place-items-center",
            "[&_svg]:w-[14px] [&_svg]:h-[14px] [&_svg]:stroke-[2.5]",
          ].join(" "),
          content: "flex-1 min-w-0",
          actionButton:
            "!bg-foreground !text-background rounded-full px-2.5 py-1 text-[11.5px] font-semibold hover:!opacity-90 transition",
          cancelButton:
            "!bg-muted !text-muted-foreground rounded-full px-2.5 py-1 text-[11.5px] font-medium hover:!bg-muted/70 transition",
          closeButton: "!hidden",
          success: "[&_[data-icon]_svg]:!text-emerald-500",
          error: "[&_[data-icon]_svg]:!text-rose-500",
          info: "[&_[data-icon]_svg]:!text-sky-500",
          warning: "[&_[data-icon]_svg]:!text-amber-500",
          loading: "[&_[data-icon]_svg]:!text-muted-foreground",
        },
      }}
      style={
        {
          "--width": "auto",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster, toast };
