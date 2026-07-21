/** @doc Help center — searchable FAQ grouped by topic on the glass shell. */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ChevronDown } from "lucide-react";
import ProfileGlassShell, {
  GlassSection,
  GlassCard,
} from "@/components/profile/ProfileGlassShell";

const sections = [
  {
    title: "Getting started",
    items: [
      { q: "What is Megsy?", a: "Megsy is an all-in-one AI creative platform — chat, images, videos, websites/code, presentations, and file analysis, all running on Megsy Credits (MC)." },
      { q: "How do credits (MC) work?", a: "Every action consumes MC. Chat costs 1 MC, images start at 2 MC, videos at 8 MC, and Build projects vary by complexity. Your balance is shown in Settings → Billing." },
      { q: "How do I sign in?", a: "Go to /auth and sign in with email or Google. Forgot your password? Use the recovery link on the login screen." },
      { q: "Free vs paid plans", a: "Free includes a starter credit allowance. Paid plans (Starter, Pro, Elite, Enterprise) add monthly MC, faster models, and team features. Compare at /pricing." },
    ],
  },
  {
    title: "Chat",
    items: [
      { q: "How do I start a chat?", a: "Open /chat and type your prompt. You can attach files, enable web search, switch models, and pick agents from the composer." },
      { q: "Can Megsy remember things about me?", a: "Yes — important details are saved in Memory. Manage them from Settings → Memory." },
      { q: "How do I share a conversation?", a: "Open any chat → menu → Share. A read-only public link is created. You can revoke it anytime." },
      { q: "What is Deep Research?", a: "An agent that runs multi-source web research and returns a structured report with citations." },
      { q: "What is Slides mode?", a: "Generates a full editable presentation from a prompt. Export to PPTX from the slide deck view." },
    ],
  },
  {
    title: "Images & Video",
    items: [
      { q: "How do I generate an image?", a: "Open Media → Image Studio, pick a model, write your prompt, choose ratio and quality, then generate." },
      { q: "How do I generate a video?", a: "Open Media → Video Studio, pick a model, optionally upload a starting image, write your prompt, and generate." },
      { q: "What is Lip Sync?", a: "Upload a portrait video and an audio file, and Megsy syncs the mouth movements to the audio." },
      { q: "Can I edit a generated image?", a: "Yes — open the image and use the edit tools (inpaint, upscale, background remove). Each edit costs MC." },
      { q: "Where are my generations saved?", a: "Everything you generate lives in your Library, scoped to your account or active workspace." },
    ],
  },
  {
    title: "Build (websites & apps)",
    items: [
      { q: "How do I start a project?", a: "Open /build, describe what you want, and Megsy scaffolds a working project you can iterate on with chat." },
      { q: "Can I preview my project?", a: "Yes — every project has a live preview pane that updates as the AI edits files." },
      { q: "How do I publish a project?", a: "Open the project → Publish. You get a free megsy.app subdomain, or connect a custom domain from project Settings." },
      { q: "Can I connect a database?", a: "Yes — projects can use Lovable Cloud for auth, database, storage, and edge functions." },
    ],
  },
  {
    title: "Billing & Plans",
    items: [
      { q: "How do I buy credits?", a: "Settings → Billing → Buy credits. You can pay with card or supported local methods." },
      { q: "How do I upgrade my plan?", a: "Visit /pricing and choose a plan. Upgrades take effect immediately and unused credits roll over." },
      { q: "How do I cancel?", a: "Settings → Billing → Manage subscription → Cancel. You keep access until the end of the billing period." },
      { q: "Do you offer refunds?", a: "Yes within 14 days for unused credits. Contact our team from Help & Support → Contact our team." },
    ],
  },
  {
    title: "Integrations & API",
    items: [
      { q: "Which integrations are available?", a: "Settings → Integrations lists every connector. Connect once to use across chat and Build." },
      { q: "How do I get an API key?", a: "Visit api.megsyai.com → Dashboard → API keys. Each call consumes MC from the key's workspace." },
    ],
  },
  {
    title: "Settings & Privacy",
    items: [
      { q: "Where do I change my email or password?", a: "Settings → Account → Change email / Change password." },
      { q: "How do I delete my account?", a: "Settings → Account → Delete account. This is irreversible and wipes all personal data within 30 days." },
      { q: "Is my data used for training?", a: "No. Your prompts and outputs are never used to train models." },
      { q: "How do I enable two-factor auth?", a: "Settings → Account → Security → Enable 2FA. Use any TOTP app like 1Password or Authy." },
    ],
  },
  {
    title: "Troubleshooting",
    items: [
      { q: "A generation failed — am I charged?", a: "No. Failed generations are automatically refunded within a few minutes." },
      { q: "The app feels slow", a: "Check status.megsyai.com for incidents. Try a hard refresh, then sign out and back in." },
      { q: "I can't sign in", a: "Use the password reset link, check for typos in your email, and make sure cookies aren't blocked." },
      { q: "Where do I report a bug?", a: "Help & Support → Contact our team. Include screenshots and the URL where it happened." },
    ],
  },
];

export default function SettingsHelpPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [openKey, setOpenKey] = useState<string | null>(null);

  const filtered = sections
    .map((sec) => ({
      ...sec,
      items: sec.items.filter((it) =>
        (it.q + " " + it.a).toLowerCase().includes(query.trim().toLowerCase()),
      ),
    }))
    .filter((sec) => sec.items.length > 0);

  return (
    <ProfileGlassShell
      title="Help Center"
      subtitle="Search across everything, or browse by topic."
      onBack={() => navigate("/settings/support")}
    >
      <style>{css}</style>

      <div className="help-search liquid-glass">
        <Search className="w-4 h-4 opacity-60 shrink-0" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search FAQs"
        />
      </div>

      {filtered.map((sec) => (
        <GlassSection key={sec.title} title={sec.title}>
          <GlassCard>
            {sec.items.map((it, i) => {
              const key = `${sec.title}-${i}`;
              const open = openKey === key;
              return (
                <div key={key} className={`help-item ${open ? "is-open" : ""}`}>
                  <button
                    onClick={() => setOpenKey(open ? null : key)}
                    className="help-q"
                  >
                    <span>{it.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 opacity-60 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
                    />
                  </button>
                  <div className="help-a-wrap" style={{ gridTemplateRows: open ? "1fr" : "0fr" }}>
                    <div className="help-a-inner">
                      <p>{it.a}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </GlassCard>
        </GlassSection>
      ))}

      {filtered.length === 0 && (
        <GlassCard>
          <div className="help-empty">
            <p>No matches</p>
            <span>Try a different keyword.</span>
          </div>
        </GlassCard>
      )}
    </ProfileGlassShell>
  );
}

const css = `
.help-search {
  display: flex; align-items: center; gap: 10px;
  padding: 12px 14px; border-radius: 16px;
  color: #f2eee7; margin-bottom: 4px;
}
.help-search input {
  flex: 1; background: transparent; border: 0; outline: 0;
  font: inherit; font-size: 14.5px; color: inherit;
}
.help-search input::placeholder { color: rgba(255,255,255,0.4); }

.help-item { position: relative; }
.help-item + .help-item::before {
  content: ""; position: absolute; top: 0; left: 18px; right: 18px; height: 1px;
  background: var(--overlay-white-06);
}
.help-q {
  width: 100%; display: flex; align-items: center; gap: 12px;
  padding: 14px 18px; background: transparent; border: 0; text-align: left;
  color: #f2eee7; font: inherit; font-size: 14.5px; font-weight: 500;
  cursor: pointer;
}
.help-q > span { flex: 1; }
.help-q:hover { background: var(--overlay-white-03); }
.help-a-wrap {
  display: grid; grid-template-rows: 0fr;
  transition: grid-template-rows 260ms cubic-bezier(0.22,1,0.36,1);
}
.help-a-inner { overflow: hidden; }
.help-a-inner p {
  margin: 0; padding: 0 18px 16px;
  font-size: 13px; line-height: 1.6; color: rgba(242,238,231,0.7);
}
.help-empty { padding: 28px; text-align: center; }
.help-empty p { margin: 0; font-size: 14.5px; font-weight: 600; color: #f2eee7; }
.help-empty span { display: block; font-size: 12.5px; color: rgba(255,255,255,0.45); margin-top: 6px; }
`;
