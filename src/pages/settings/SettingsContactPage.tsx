/** @doc Contact — write to a human. Glass shell redesign matching Security. */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Send, Clock, CheckCircle2, Mail } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import ProfileGlassShell, {
  GlassSection,
  GlassCard,
  GlassField,
  GlassPrimaryButton,
} from "@/components/profile/ProfileGlassShell";
import { translateExactText, useUserLang } from "@/lib/authI18n";

export default function SettingsContactPage() {
  const navigate = useNavigate();
  const lang = useUserLang();
  const tx = (s: string) => translateExactText(s, lang);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const u = data.user;
      if (!u) return;
      setEmail(u.email || "");
      const meta = (u.user_metadata as Record<string, unknown>) || {};
      const full = (meta.full_name as string) || (meta.name as string) || "";
      setName(full || u.email?.split("@")[0] || "");
    });
  }, []);

  const submit = async () => {
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error(tx("Please fill in name, email and message"));
      return;
    }
    setSending(true);
    const { error } = await supabase.from("contact_submissions").insert({
      name: name.trim(),
      email: email.trim(),
      subject: subject.trim() || null,
      message: message.trim(),
      form_type: "support",
    });
    setSending(false);
    if (error) {
      toast.error(tx("Failed to send. Please try again."));
      return;
    }
    toast.success(tx("Message sent"));
    setSent(true);
    setSubject("");
    setMessage("");
  };

  const canSend = !!(name.trim() && email.trim() && message.trim() && !sending);

  return (
    <ProfileGlassShell
      title={tx("Contact")}
      subtitle={tx("Reach out and a real human on our team will reply within 24 hours.")}
      onBack={() => navigate("/settings/support")}
    >
      <style>{css}</style>

      {sent ? (
        <GlassSection>
          <GlassCard>
            <div className="ct-success">
              <div className="ct-success-ic">
                <CheckCircle2 className="w-7 h-7" strokeWidth={1.6} />
              </div>
              <p className="ct-success-title">{tx("Message sent")}</p>
              <p className="ct-success-body">
                {tx("Thanks")} {name.split(" ")[0]}. {tx("We'll reply to")} <b>{email}</b> {tx("within 24 hours.")}
              </p>
              <button className="ct-success-again" onClick={() => setSent(false)}>
                {tx("Send another message")}
              </button>
            </div>
          </GlassCard>
        </GlassSection>
      ) : (
        <>
          <GlassSection title={tx("Direct")}>
            <GlassCard>
              <a href="mailto:support@megsyai.com" className="ct-mail">
                <span className="ct-mail-ic"><Mail className="w-[18px] h-[18px]" strokeWidth={1.6} /></span>
                <span className="ct-mail-body">
                  <span className="ct-mail-label">{tx("Email")}</span>
                  <span className="ct-mail-value">support@megsyai.com</span>
                </span>
                <span className="ct-mail-eta"><Clock className="w-3 h-3" />~24h</span>
              </a>
            </GlassCard>
          </GlassSection>

          <GlassSection title={tx("Send a message")}>
            <GlassCard>
              <div className="ct-form">
                <GlassField
                  label={tx("Name")}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={tx("Your full name")}
                />
                <GlassField
                  label={tx("Email")}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
                <GlassField
                  label={tx("Subject")}
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder={tx("Optional")}
                />
                <label className="ng-field">
                  <span className="ng-field-label">{tx("Message")}</span>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={5}
                    placeholder={tx("Tell us what's happening…")}
                    className="ng-input liquid-glass ct-textarea"
                  />
                </label>
              </div>
            </GlassCard>
          </GlassSection>

          <GlassSection>
            <GlassPrimaryButton onClick={submit} disabled={!canSend}>
              {sending ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> {tx("Sending")}</>
              ) : (
                <><Send className="w-4 h-4" /> {tx("Send message")}</>
              )}
            </GlassPrimaryButton>
          </GlassSection>
        </>
      )}
    </ProfileGlassShell>
  );
}

const css = `
.ct-mail {
  display: flex; align-items: center; gap: 14px;
  padding: 16px 18px; text-decoration: none; color: #f2eee7;
}
.ct-mail:hover { background: rgba(255,255,255,0.03); }
.ct-mail-ic {
  width: 38px; height: 38px; border-radius: 12px;
  display: grid; place-items: center;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.08);
}
.ct-mail-body { flex: 1; display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.ct-mail-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.14em; color: rgba(255,255,255,0.5); }
.ct-mail-value { font-size: 14.5px; font-weight: 500; }
.ct-mail-eta {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 11.5px; color: rgba(255,255,255,0.5);
  padding: 4px 10px; border-radius: 999px;
  background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
}
.ct-form { padding: 16px; display: flex; flex-direction: column; gap: 14px; }
.ct-textarea { resize: none; min-height: 128px; padding-top: 12px; padding-bottom: 12px; line-height: 1.5; }

.ct-success { padding: 28px 20px; text-align: center; }
.ct-success-ic {
  width: 56px; height: 56px; border-radius: 999px; margin: 0 auto 16px;
  display: grid; place-items: center;
  background: rgba(52,199,89,0.14); color: #34c759;
  border: 1px solid rgba(52,199,89,0.3);
}
.ct-success-title { margin: 0; font-size: 17px; font-weight: 600; color: #f2eee7; }
.ct-success-body { margin: 8px 0 0; font-size: 13.5px; line-height: 1.55; color: rgba(255,255,255,0.6); }
.ct-success-body b { color: #f2eee7; font-weight: 500; }
.ct-success-again {
  margin-top: 18px; background: transparent; border: 0;
  font: inherit; font-size: 13px; font-weight: 500;
  color: #f2eee7; text-decoration: underline; text-underline-offset: 4px;
  cursor: pointer;
}
`;
