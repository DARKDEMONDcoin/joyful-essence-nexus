import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";

/**
 * Promise-based confirmation dialog. Use through `useConfirm()` so any
 * destructive button can `await confirm({...})` and continue based on the
 * user's choice. Supports a "type-to-confirm" mode for high-risk actions
 * like deleting an account or workspace.
 */

type ConfirmOptions = {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  /** If set, the confirm button is disabled until the user types this exact text. */
  typeToConfirm?: string;
};

type Resolver = (ok: boolean) => void;

type Ctx = {
  confirm: (opts: ConfirmOptions) => Promise<boolean>;
};

const ConfirmContext = createContext<Ctx | null>(null);

export const ConfirmProvider = ({ children }: { children: React.ReactNode }) => {
  const [opts, setOpts] = useState<ConfirmOptions | null>(null);
  const [typed, setTyped] = useState("");
  const resolverRef = useRef<Resolver | null>(null);

  const confirm = useCallback((next: ConfirmOptions) => {
    setTyped("");
    setOpts(next);
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  const resolve = (ok: boolean) => {
    resolverRef.current?.(ok);
    resolverRef.current = null;
    setOpts(null);
    setTyped("");
  };

  const value = useMemo<Ctx>(() => ({ confirm }), [confirm]);
  const expected = opts?.typeToConfirm?.trim();
  const typedOk = expected ? typed.trim() === expected : true;

  return (
    <ConfirmContext.Provider value={value}>
      {children}
      <AlertDialog
        open={!!opts}
        onOpenChange={(open) => {
          if (!open) resolve(false);
        }}
      >
        {opts && (
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{opts.title}</AlertDialogTitle>
              {opts.description && (
                <AlertDialogDescription>{opts.description}</AlertDialogDescription>
              )}
            </AlertDialogHeader>
            {expected && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  Type <span className="font-mono font-semibold text-foreground">{expected}</span>{" "}
                  to confirm.
                </p>
                <Input
                  autoFocus
                  value={typed}
                  onChange={(e) => setTyped(e.target.value)}
                  placeholder={expected}
                  aria-label="Type to confirm"
                />
              </div>
            )}
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => resolve(false)}>
                {opts.cancelLabel ?? "Cancel"}
              </AlertDialogCancel>
              <AlertDialogAction
                disabled={!typedOk}
                onClick={() => resolve(true)}
                className={
                  opts.destructive
                    ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    : undefined
                }
              >
                {opts.confirmLabel ?? "Confirm"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        )}
      </AlertDialog>
    </ConfirmContext.Provider>
  );
};

export const useConfirm = () => {
  const ctx = useContext(ConfirmContext);
  if (!ctx) {
    throw new Error("useConfirm must be used inside <ConfirmProvider>");
  }
  return ctx.confirm;
};
