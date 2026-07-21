/** @doc Contact form for sales, partnerships and press inquiries. */
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, MessageSquare, Building2, Twitter, Clock, ShieldCheck, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
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
  SURFACE,
  BORDER,
  YELLOW,
  MINT,
} from "@/components/marketing/CartoonMarketingShell";
import { PEACH, LAVENDER, PINK, BLUE } from "@/pages/billing/ReferralsPage";
import contactSticker from "@/assets/settings/contact-sticker.png";

const supportSchema = z.object({
  username: z.string().trim().min(1, "Username is required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  message: z.string().trim().min(1, "Please describe your issue").max(2000),
});

const enterpriseSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(100),
  lastName: z.string().trim().min(1, "Last name is required").max(100),
  workEmail: z.string().trim().email("Invalid email").max(255),
  company: z.string().trim().min(1, "Company name is required").max(200),
  country: z.string().trim().min(1, "Country is required"),
  companySize: z.string().trim().min(1, "Company size is required"),
  needs: z.string().trim().min(1, "Please tell us about your needs").max(2000),
});

type SupportData = z.infer<typeof supportSchema>;
type EnterpriseData = z.infer<typeof enterpriseSchema>;

const countries = [
  "Egypt",
  "United States",
  "United Kingdom",
  "Germany",
  "France",
  "Saudi Arabia",
  "UAE",
  "Canada",
  "Australia",
  "Japan",
  "India",
  "Brazil",
  "South Korea",
  "Other",
];
const companySizes = ["1-10", "11-50", "51-200", "201-1000", "1000+"];

const fieldStyle = {
  backgroundColor: "hsl(var(--surface-3))",
  border: `2px solid ${BORDER}`,
  color: TEXT,
  fontWeight: 600,
} as const;
const fieldClass =
  "w-full px-4 py-3 rounded-2xl text-[14px] outline-none transition placeholder:opacity-60 focus:border-[color:hsl(var(--brand-action))]";

const ContactPage = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"support" | "enterprise">("support");
  const [submitting, setSubmitting] = useState(false);

  const supportForm = useForm<SupportData>({ resolver: zodResolver(supportSchema) });
  const enterpriseForm = useForm<EnterpriseData>({ resolver: zodResolver(enterpriseSchema) });

  const onSupportSubmit = async (data: SupportData) => {
    setSubmitting(true);
    try {
      const { error } = await supabase.from("contact_submissions").insert({
        name: data.username,
        email: data.email,
        message: data.message,
        form_type: "support",
      });
      if (error) throw error;
      toast.success("Request submitted!");
      supportForm.reset();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const onEnterpriseSubmit = async (data: EnterpriseData) => {
    setSubmitting(true);
    try {
      const { error } = await supabase.from("contact_submissions").insert({
        name: `${data.firstName} ${data.lastName}`,
        email: data.workEmail,
        message: data.needs,
        subject: `Enterprise - ${data.company}`,
        form_type: "enterprise",
      });
      if (error) throw error;
      toast.success("Inquiry submitted!");
      enterpriseForm.reset();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const channels = [
    {
      icon: MessageSquare,
      title: "Instant AI support",
      desc: "24/7 chat — answers in seconds.",
      cta: "Open chat",
      onClick: () => navigate("/support"),
      tone: MINT,
    },
    {
      icon: Mail,
      title: "Email a human",
      desc: "support@megsyai.com — reply within 24h.",
      cta: "Copy email",
      onClick: () => {
        navigator.clipboard?.writeText("support@megsyai.com");
        toast.success("Email copied");
      },
      tone: LAVENDER,
    },
    {
      icon: Building2,
      title: "Enterprise sales",
      desc: "Custom MC, SSO, SLA, annual contracts.",
      cta: "Talk to sales",
      onClick: () => navigate("/enterprise"),
      tone: YELLOW,
    },
    {
      icon: Twitter,
      title: "Follow @megsyai",
      desc: "Product updates & behind-the-scenes.",
      cta: "Open X",
      onClick: () => window.open("https://twitter.com/megsyai", "_blank"),
      tone: PEACH,
    },
  ];

  return (
    <CartoonMarketingPage>
      <SEOHead
        title="Contact Megsy AI — Support & Enterprise"
        description="Reach Megsy AI support or talk to our enterprise team for custom plans, SSO, and dedicated onboarding."
        path="/contact"
      />

      <CartoonHero
        sticker={contactSticker}
        bg={PEACH}
        eyebrow="Contact"
        title={
          <>
            Talk to <span style={{ color: "hsl(var(--brand-action))" }}>a real human.</span>
          </>
        }
        subtitle="Pick the form that fits — we read every message and reply ourselves."
      />

      {/* Channels grid */}
      <CartoonContainer>
        <SectionEyebrow>Pick a channel</SectionEyebrow>
        <SectionTitle className="mb-6">The fastest route to a real answer.</SectionTitle>
        <div className="grid gap-4 sm:grid-cols-2">
          {channels.map((c) => (
            <button
              key={c.title}
              onClick={c.onClick}
              className="text-left rounded-[24px] p-5 transition active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
              style={{
                backgroundColor: c.tone,
                border: `2.5px solid ${INK}`,
                boxShadow: `4px 4px 0 ${INK}`,
                color: INK,
              }}
            >
              <div
                className="mb-3 grid h-11 w-11 place-items-center rounded-2xl"
                style={{ backgroundColor: "rgba(255,255,255,0.55)", border: `2px solid ${INK}` }}
              >
                <c.icon className="w-5 h-5" strokeWidth={2.5} />
              </div>
              <p className="text-[15px]" style={{ fontWeight: 900 }}>
                {c.title}
              </p>
              <p
                className="mt-1 text-[12.5px] leading-relaxed"
                style={{ opacity: 0.78, fontWeight: 600 }}
              >
                {c.desc}
              </p>
              <p
                className="mt-3 text-[11.5px] uppercase tracking-[0.16em]"
                style={{ fontWeight: 900 }}
              >
                {c.cta} →
              </p>
            </button>
          ))}
        </div>

        <div
          className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11.5px]"
          style={{ color: MUTED, fontWeight: 700 }}
        >
          <span className="inline-flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> Replies within 24h
          </span>
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" /> GDPR & DPA-ready
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5" /> support@megsyai.com
          </span>
        </div>
      </CartoonContainer>

      {/* Tabs + form */}
      <CartoonContainer>
        <SectionEyebrow>Write us</SectionEyebrow>
        <SectionTitle className="mb-6">Open a ticket.</SectionTitle>

        <div
          className="inline-flex items-center rounded-full p-1 mb-6"
          style={{ backgroundColor: SURFACE, border: `2px solid ${BORDER}` }}
        >
          {(["support", "enterprise"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="rounded-full px-5 py-2 text-[13px] transition"
              style={{
                backgroundColor: tab === t ? YELLOW : "transparent",
                color: tab === t ? INK : TEXT,
                fontWeight: 800,
                border: tab === t ? `2px solid ${INK}` : "2px solid transparent",
              }}
            >
              {t === "support" ? "Support & billing" : "Enterprise sales"}
            </button>
          ))}
        </div>

        <CartoonCard className="space-y-4">
          {tab === "support" ? (
            <form onSubmit={supportForm.handleSubmit(onSupportSubmit)} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <input
                    {...supportForm.register("username")}
                    placeholder="Your Megsy username *"
                    className={fieldClass}
                    style={fieldStyle}
                  />
                  {supportForm.formState.errors.username && (
                    <p className="mt-1.5 text-[12px]" style={{ color: PINK, fontWeight: 700 }}>
                      {supportForm.formState.errors.username.message}
                    </p>
                  )}
                </div>
                <div>
                  <input
                    {...supportForm.register("email")}
                    placeholder="Email address *"
                    className={fieldClass}
                    style={fieldStyle}
                  />
                  {supportForm.formState.errors.email && (
                    <p className="mt-1.5 text-[12px]" style={{ color: PINK, fontWeight: 700 }}>
                      {supportForm.formState.errors.email.message}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <textarea
                  {...supportForm.register("message")}
                  placeholder="Describe your issue *"
                  rows={6}
                  className={`${fieldClass} resize-none`}
                  style={fieldStyle}
                />
                {supportForm.formState.errors.message && (
                  <p className="mt-1.5 text-[12px]" style={{ color: PINK, fontWeight: 700 }}>
                    {supportForm.formState.errors.message.message}
                  </p>
                )}
              </div>
              <PillButton type="submit" disabled={submitting} tone={MINT} className="w-full">
                <Send className="w-4 h-4" strokeWidth={2.5} />
                {submitting ? "Submitting…" : "Submit request"}
              </PillButton>
            </form>
          ) : (
            <form onSubmit={enterpriseForm.handleSubmit(onEnterpriseSubmit)} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <input
                  {...enterpriseForm.register("firstName")}
                  placeholder="First name *"
                  className={fieldClass}
                  style={fieldStyle}
                />
                <input
                  {...enterpriseForm.register("lastName")}
                  placeholder="Last name *"
                  className={fieldClass}
                  style={fieldStyle}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <input
                  {...enterpriseForm.register("workEmail")}
                  placeholder="Work email *"
                  className={fieldClass}
                  style={fieldStyle}
                />
                <input
                  {...enterpriseForm.register("company")}
                  placeholder="Company name *"
                  className={fieldClass}
                  style={fieldStyle}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <select
                  {...enterpriseForm.register("country")}
                  className={`${fieldClass} appearance-none`}
                  style={fieldStyle}
                  defaultValue=""
                >
                  <option value="" disabled>
                    Country *
                  </option>
                  {countries.map((c) => (
                    <option key={c} value={c} style={{ background: "hsl(var(--brand-ink))" }}>
                      {c}
                    </option>
                  ))}
                </select>
                <select
                  {...enterpriseForm.register("companySize")}
                  className={`${fieldClass} appearance-none`}
                  style={fieldStyle}
                  defaultValue=""
                >
                  <option value="" disabled>
                    Company size *
                  </option>
                  {companySizes.map((s) => (
                    <option key={s} value={s} style={{ background: "hsl(var(--brand-ink))" }}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <textarea
                {...enterpriseForm.register("needs")}
                placeholder="Tell us about your needs *"
                rows={5}
                className={`${fieldClass} resize-none`}
                style={fieldStyle}
              />
              <PillButton type="submit" disabled={submitting} tone={YELLOW} className="w-full">
                <Send className="w-4 h-4" strokeWidth={2.5} />
                {submitting ? "Submitting…" : "Submit inquiry"}
              </PillButton>
            </form>
          )}

          <p className="text-[11px] leading-relaxed" style={{ color: MUTED, fontWeight: 600 }}>
            By submitting this form, I agree to receive updates and communications from Megsy, as
            outlined in the{" "}
            <a href="/privacy" className="underline" style={{ color: BLUE }}>
              Privacy & Cookie Policy
            </a>
            .
          </p>
        </CartoonCard>
      </CartoonContainer>
    </CartoonMarketingPage>
  );
};

export default ContactPage;
