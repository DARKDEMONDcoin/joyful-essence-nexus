/** @doc Enterprise plan — SSO, audit logs, custom contracts, dedicated support. */
import { useState } from "react";
import {
  Send,
  Shield,
  Zap,
  Users,
  Server,
  Headphones,
  Lock,
  BarChart3,
  Clock,
  Globe,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import SEOHead from "@/components/common/SEOHead";
import {
  CartoonMarketingPage,
  CartoonHero,
  CartoonContainer,
  CartoonCard,
  PillButton,
  SectionEyebrow,
  SectionTitle,
  INK,
  MUTED,
  TEXT,
  BORDER,
  YELLOW,
  MINT,
} from "@/components/marketing/CartoonMarketingShell";
import { PEACH, LAVENDER, PINK, BLUE } from "@/pages/billing/ReferralsPage";
import enterpriseSticker from "@/assets/settings/enterprise-sticker.png";

const companySizes = ["1-10", "11-50", "51-200", "201-500", "500+"];
const needs = [
  "Image generation at scale",
  "Video generation at scale",
  "Custom AI models",
  "API access & webhooks",
  "Dedicated infrastructure",
  "SLA guarantees",
  "Priority support",
  "Custom integrations",
  "Data privacy & compliance",
  "Advanced analytics",
];

const features = [
  {
    icon: Zap,
    title: "Custom credit allocation",
    desc: "A monthly MC volume sized to your real usage, on one invoice.",
    tone: YELLOW,
  },
  {
    icon: Users,
    title: "Team workspaces",
    desc: "Shared seats, central billing, per-member visibility.",
    tone: MINT,
  },
  {
    icon: Headphones,
    title: "Priority support channel",
    desc: "Direct line to the founders for setup and escalations.",
    tone: PEACH,
  },
  {
    icon: Server,
    title: "Higher rate limits",
    desc: "Raised concurrent generation & API limits for production.",
    tone: LAVENDER,
  },
  {
    icon: Globe,
    title: "Data residency on request",
    desc: "Regional deployment options depending on jurisdiction.",
    tone: BLUE,
  },
  {
    icon: Lock,
    title: "Custom data agreements",
    desc: "DPA, retention windows, training opt-outs on every plan.",
    tone: PINK,
  },
  {
    icon: BarChart3,
    title: "Usage reporting",
    desc: "Monthly breakdowns per team, per feature, per workspace.",
    tone: YELLOW,
  },
  {
    icon: Clock,
    title: "Onboarding session",
    desc: "Live setup, team training and Q&A with the team.",
    tone: MINT,
  },
  {
    icon: Shield,
    title: "Contracts & invoicing",
    desc: "Annual deals, POs, NET-30, tax-compliant invoicing.",
    tone: PEACH,
  },
];

const fieldStyle = {
  backgroundColor: "hsl(var(--surface-3))",
  border: `2px solid ${BORDER}`,
  color: TEXT,
  fontWeight: 600,
} as const;
const fieldClass =
  "w-full px-4 py-3 rounded-2xl text-[14px] outline-none transition placeholder:opacity-60 focus:border-[color:hsl(var(--brand-action))]";

const EnterprisePage = () => {
  const navigate = useNavigate();
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [selectedNeeds, setSelectedNeeds] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const toggleNeed = (need: string) =>
    setSelectedNeeds((prev) =>
      prev.includes(need) ? prev.filter((n) => n !== need) : [...prev, need],
    );

  const handleSubmit = async () => {
    if (!companyName || !contactName || !email) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setSubmitting(true);
    try {
      await supabase.from("contact_submissions").insert({
        name: contactName,
        email,
        message: `Company: ${companyName}\nSize: ${companySize}\nNeeds: ${selectedNeeds.join(", ")}\n\n${message}`,
        form_type: "enterprise",
        subject: `Enterprise Inquiry - ${companyName}`,
      });
      toast.success("Your inquiry has been submitted. We'll get back to you soon.");
      navigate("/pricing");
    } catch {
      toast.error("Failed to submit. Please try again.");
    }
    setSubmitting(false);
  };

  return (
    <CartoonMarketingPage>
      <SEOHead
        title="Megsy AI for Enterprise — Custom Plans for Teams"
        description="Custom credit volume, team workspaces, priority support and tailored contracts for organizations using Megsy AI at scale."
        path="/enterprise"
      />

      <CartoonHero
        sticker={enterpriseSticker}
        bg={YELLOW}
        eyebrow="For teams"
        title={
          <>
            Megsy for <span style={{ color: "hsl(var(--brand-blush))" }}>your team.</span>
          </>
        }
        subtitle="Custom credit volume, shared workspaces, priority support and tailored contracts — sized to how your team actually uses Megsy."
        cta={
          <>
            <PillButton
              tone={INK}
              onClick={() =>
                document.getElementById("ent-form")?.scrollIntoView({ behavior: "smooth" })
              }
            >
              <Send className="w-4 h-4" strokeWidth={2.5} style={{ color: YELLOW }} />
              <span style={{ color: YELLOW }}>Talk to sales</span>
            </PillButton>
            <PillButton tone={MINT} onClick={() => navigate("/pricing")}>
              See pricing
            </PillButton>
          </>
        }
      />

      {/* Annual & multi-year band */}
      <CartoonContainer>
        <SectionEyebrow>Annual & multi-year</SectionEyebrow>
        <SectionTitle className="mb-6">Lock pricing. Save up to 30%.</SectionTitle>
        <CartoonCard tone={LAVENDER}>
          <p
            className="text-[14px] md:text-[15px] leading-relaxed"
            style={{ color: INK, fontWeight: 600 }}
          >
            Every paid plan can be billed yearly (2 months free + bonus MC upfront). Enterprise
            contracts add custom MC pools, NET-30 invoicing, POs, multi-year price locks and volume
            discounts that scale with your team.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              {
                k: "Pro / Elite / Business yearly",
                v: "≈17% off + 480 / 1,000 / 2,400 bonus MC. Self-serve from /pricing.",
              },
              {
                k: "Enterprise annual contract",
                v: "Custom MC volume, single invoice, NET-30, PO support.",
              },
              {
                k: "Multi-year contracts",
                v: "Lock today's per-MC price for 2–3 years + volume discount.",
              },
            ].map((row) => (
              <div
                key={row.k}
                className="rounded-2xl p-4"
                style={{ backgroundColor: "rgba(255,255,255,0.55)", border: `2px solid ${INK}` }}
              >
                <p
                  className="text-[11.5px] uppercase tracking-[0.14em]"
                  style={{ color: INK, fontWeight: 900 }}
                >
                  {row.k}
                </p>
                <p
                  className="mt-2 text-[12.5px] leading-relaxed"
                  style={{ color: INK, fontWeight: 600, opacity: 0.85 }}
                >
                  {row.v}
                </p>
              </div>
            ))}
          </div>
        </CartoonCard>
      </CartoonContainer>

      {/* Features grid */}
      <CartoonContainer>
        <SectionEyebrow>What's included</SectionEyebrow>
        <SectionTitle className="mb-6">Built around your team.</SectionTitle>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-[22px] p-5"
              style={{
                backgroundColor: f.tone,
                border: `2.5px solid ${INK}`,
                boxShadow: `4px 4px 0 ${INK}`,
                color: INK,
              }}
            >
              <div
                className="mb-3 grid h-10 w-10 place-items-center rounded-xl"
                style={{ backgroundColor: "rgba(255,255,255,0.55)", border: `2px solid ${INK}` }}
              >
                <f.icon className="w-5 h-5" strokeWidth={2.5} />
              </div>
              <p className="text-[14.5px]" style={{ fontWeight: 900 }}>
                {f.title}
              </p>
              <p
                className="mt-1.5 text-[12.5px] leading-relaxed"
                style={{ opacity: 0.78, fontWeight: 600 }}
              >
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </CartoonContainer>

      {/* Form */}
      <CartoonContainer>
        <div id="ent-form" />
        <SectionEyebrow>Get in touch</SectionEyebrow>
        <SectionTitle className="mb-6">Build a custom plan.</SectionTitle>

        <CartoonCard className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                className="text-[11px] uppercase tracking-[0.16em] mb-1.5 block"
                style={{ color: MUTED, fontWeight: 900 }}
              >
                Company name *
              </label>
              <input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className={fieldClass}
                style={fieldStyle}
                placeholder="Acme Inc."
              />
            </div>
            <div>
              <label
                className="text-[11px] uppercase tracking-[0.16em] mb-1.5 block"
                style={{ color: MUTED, fontWeight: 900 }}
              >
                Contact name *
              </label>
              <input
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className={fieldClass}
                style={fieldStyle}
                placeholder="Jane Doe"
              />
            </div>
          </div>
          <div>
            <label
              className="text-[11px] uppercase tracking-[0.16em] mb-1.5 block"
              style={{ color: MUTED, fontWeight: 900 }}
            >
              Business email *
            </label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              className={fieldClass}
              style={fieldStyle}
              placeholder="jane@company.com"
            />
          </div>

          <div>
            <label
              className="text-[11px] uppercase tracking-[0.16em] mb-1.5 block"
              style={{ color: MUTED, fontWeight: 900 }}
            >
              Company size
            </label>
            <div className="flex flex-wrap gap-2">
              {companySizes.map((size) => {
                const active = companySize === size;
                return (
                  <button
                    key={size}
                    onClick={() => setCompanySize(size)}
                    className="rounded-full px-4 py-2 text-[13px] transition active:translate-x-[1px] active:translate-y-[1px]"
                    style={{
                      backgroundColor: active ? YELLOW : "hsl(var(--surface-3))",
                      color: active ? INK : TEXT,
                      border: `2px solid ${active ? INK : BORDER}`,
                      boxShadow: active ? `3px 3px 0 ${INK}` : "none",
                      fontWeight: 800,
                    }}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label
              className="text-[11px] uppercase tracking-[0.16em] mb-1.5 block"
              style={{ color: MUTED, fontWeight: 900 }}
            >
              What do you need?
            </label>
            <div className="flex flex-wrap gap-2">
              {needs.map((need) => {
                const active = selectedNeeds.includes(need);
                return (
                  <button
                    key={need}
                    onClick={() => toggleNeed(need)}
                    className="rounded-full px-3 py-2 text-[12.5px] transition active:translate-x-[1px] active:translate-y-[1px]"
                    style={{
                      backgroundColor: active ? MINT : "hsl(var(--surface-3))",
                      color: active ? INK : TEXT,
                      border: `2px solid ${active ? INK : BORDER}`,
                      boxShadow: active ? `3px 3px 0 ${INK}` : "none",
                      fontWeight: 700,
                    }}
                  >
                    {need}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label
              className="text-[11px] uppercase tracking-[0.16em] mb-1.5 block"
              style={{ color: MUTED, fontWeight: 900 }}
            >
              Additional details
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className={`${fieldClass} resize-none`}
              style={fieldStyle}
              placeholder="Tell us about your use case…"
            />
          </div>

          <PillButton
            onClick={handleSubmit}
            disabled={submitting || !companyName || !contactName || !email}
            tone={YELLOW}
            className="w-full"
          >
            <Send className="w-4 h-4" strokeWidth={2.5} />
            {submitting ? "Submitting…" : "Submit inquiry"}
          </PillButton>
        </CartoonCard>
      </CartoonContainer>
    </CartoonMarketingPage>
  );
};

export default EnterprisePage;
