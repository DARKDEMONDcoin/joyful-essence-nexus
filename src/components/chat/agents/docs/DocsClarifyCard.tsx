// Clarify wizard disabled by user request: never show questions to the user.
// Instead, auto-submit "no preference, use best defaults" answers for every
// question so the docs generator proceeds without blocking the user.
import { useEffect, useRef } from "react";
import type { DocsClarifyQuestion, DocsClarifyUi } from "@/lib/agent/docs/types";

interface Props {
  reason: string;
  questions: DocsClarifyQuestion[];
  ui?: DocsClarifyUi;
  onSubmit: (answers: Record<string, string>) => void;
  busy?: boolean;
}

export default function DocsClarifyCard({ questions, onSubmit }: Props) {
  const submittedRef = useRef(false);

  useEffect(() => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    const filled: Record<string, string> = {};
    for (const q of questions) {
      filled[q.id] = "__skip__: no preference, use best defaults";
    }
    onSubmit(filled);
    // Only submit once per mount; new clarify rounds mount a fresh card via key.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
