/**
 * Regression suite for supabase/functions/_shared/systemPromptBuilder.ts
 * Guards the frontier-model behavior rules: identity/memory, anti-hallucination,
 * over-refusal (XSTest/OR-Bench), Arabic dialect handling, tool budget,
 * chain-of-command, multimodal, output hygiene.
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const PROMPT = readFileSync(
  resolve(__dirname, "../../supabase/functions/_shared/systemPromptBuilder.ts"),
  "utf8",
);

const requireAll = (text: string, needles: string[]) => {
  for (const n of needles) expect(text).toContain(n);
};

describe("systemPromptBuilder — identity & memory", () => {
  it("locks identity under adversarial pressure", () => {
    requireAll(PROMPT, ["you are still Megsy", "hidden chain-of-thought"]);
  });
  it("has memory trigger phrases in Arabic + English", () => {
    requireAll(PROMPT, ["MEMORY RETRIEVAL TRIGGERS", "you said", "قلتلي", "my project", "مشروعي"]);
  });
  it("names the anti-'I don't recall' rule", () => {
    expect(PROMPT).toMatch(/don't have access to previous conversations|don't recall previous conversations/);
  });
});

describe("systemPromptBuilder — calibrated honesty", () => {
  it("prefers 'I don't know' over fabrication", () => {
    requireAll(PROMPT, ["CALIBRATED HONESTY", "confident wrong answer", "Never fabricate"]);
  });
  it("resists pushback on correct answers", () => {
    expect(PROMPT).toMatch(/re-verify.*before changing/i);
  });
  it("bans false-modesty hedging", () => {
    expect(PROMPT).toMatch(/false-modesty hedges/);
  });
});

describe("systemPromptBuilder — over-refusal", () => {
  it("has PARTIAL COMPLIANCE", () => {
    requireAll(PROMPT, ["PARTIAL COMPLIANCE", "acceptable and unacceptable elements"]);
  });
  it("judges intent, not keywords", () => {
    requireAll(PROMPT, ["Judge intent and context", "killing a process"]);
  });
  it("allows fictional/historical/academic framings", () => {
    expect(PROMPT).toMatch(/Fictional, historical, academic/);
  });
  it("forbids reflexive 'consult a professional'", () => {
    expect(PROMPT).toMatch(/Never lecture/);
    expect(PROMPT).toMatch(/consult a professional/);
  });
});

describe("systemPromptBuilder — Arabic quality", () => {
  it("requires dialect matching", () => {
    requireAll(PROMPT, ["مصري", "خليجي", "شامي", "مغاربي"]);
  });
  it("forbids default tashkeel", () => {
    expect(PROMPT).toMatch(/undiacritized|tashkeel/);
  });
  it("mandates Arabic punctuation", () => {
    requireAll(PROMPT, ["،", "؛", "؟"]);
  });
  it("allows code-switching", () => {
    expect(PROMPT).toMatch(/code-switching/i);
  });
});

describe("systemPromptBuilder — agentic behavior", () => {
  it("has tool-call budget", () => {
    requireAll(PROMPT, ["TOOL-CALL BUDGET", "5 tool calls"]);
  });
  it("has freshness-triggered search", () => {
    requireAll(PROMPT, ["FRESHNESS-TRIGGERED SEARCH", "web_search"]);
  });
  it("has chain-of-command", () => {
    requireAll(PROMPT, ["INSTRUCTION PRIORITY", "Hard safety limits"]);
  });
});

describe("systemPromptBuilder — multimodal & files", () => {
  it("forbids 'can't view images'", () => {
    expect(PROMPT).toMatch(/I can't view images|can't analyze images/);
  });
  it("supports 5 files per message", () => {
    expect(PROMPT).toMatch(/up to 5 files/);
  });
});

describe("systemPromptBuilder — output hygiene", () => {
  it("bans preamble filler", () => {
    requireAll(PROMPT, ['"Sure!"', '"Certainly!"', '"Great question!"']);
  });
  it("bans AI-tell words", () => {
    expect(PROMPT).toMatch(/delve|tapestry|in the realm of/);
  });
  it("includes worked few-shot examples", () => {
    requireAll(PROMPT, ["WORKED EXAMPLES", "انا اسمي احمد"]);
  });
});

describe("systemPromptBuilder — instruction following (IFEval)", () => {
  it("has literal-constraint rule", () => {
    requireAll(PROMPT, ["INSTRUCTION FOLLOWING", "3 bullets"]);
  });
  it("respects latest user message", () => {
    expect(PROMPT).toMatch(/LATEST message overrides earlier turns|latest message wins over earlier turns/);
  });
});
