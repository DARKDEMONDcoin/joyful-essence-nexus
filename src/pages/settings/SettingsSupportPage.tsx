/** @doc Support hub — entry to help center, AI support and human contact. Glass redesign. */
import { useNavigate } from "react-router-dom";
import { HelpCircle, MessageSquare, Mail, BookOpen } from "lucide-react";
import ProfileGlassShell, {
  GlassSection,
  GlassCard,
  GlassRow,
} from "@/components/profile/ProfileGlassShell";

export default function SettingsSupportPage() {
  const navigate = useNavigate();

  return (
    <ProfileGlassShell
      title="Help & Support"
      subtitle="Find answers fast or reach a human whenever you need one."
      onBack={() => navigate("/settings")}
    >
      <GlassSection title="Get help">
        <GlassCard>
          <GlassRow
            icon={<HelpCircle className="w-[18px] h-[18px]" strokeWidth={1.6} />}
            label="Help Center"
            hint="Browse FAQs by topic"
            onClick={() => navigate("/settings/support/help")}
          />
          <GlassRow
            icon={<MessageSquare className="w-[18px] h-[18px]" strokeWidth={1.6} />}
            label="Ask AI"
            hint="Instant answers from Megsy"
            onClick={() => navigate("/support")}
          />
          <GlassRow
            icon={<Mail className="w-[18px] h-[18px]" strokeWidth={1.6} />}
            label="Write to a human"
            hint="Real reply within 24 hours"
            onClick={() => navigate("/settings/support/contact")}
          />
        </GlassCard>
      </GlassSection>

      <GlassSection title="Resources">
        <GlassCard>
          <GlassRow
            icon={<BookOpen className="w-[18px] h-[18px]" strokeWidth={1.6} />}
            label="Documentation"
            hint="Full product & API guides"
            onClick={() => navigate("/docs")}
          />
        </GlassCard>
      </GlassSection>
    </ProfileGlassShell>
  );
}
