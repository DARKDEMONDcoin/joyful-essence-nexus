/** @doc Privacy & Data — review policies, manage stored data, delete account. Glass redesign. */
import { useNavigate } from "react-router-dom";
import { FileText, Cookie, Brain, Mail, KeyRound, Trash2, Shield, Download } from "lucide-react";
import ProfileGlassShell, {
  GlassSection,
  GlassCard,
  GlassRow,
} from "@/components/profile/ProfileGlassShell";

export default function SettingsPrivacyPage() {
  const navigate = useNavigate();

  return (
    <ProfileGlassShell
      title="Privacy & Data"
      subtitle="Control what Megsy stores and how your data is used."
      onBack={() => navigate("/settings")}
    >
      <GlassSection title="Policies">
        <GlassCard>
          <GlassRow
            icon={<Shield className="w-[18px] h-[18px]" strokeWidth={1.6} />}
            label="Privacy Policy"
            hint="How we handle your data"
            onClick={() => navigate("/privacy")}
          />
          <GlassRow
            icon={<FileText className="w-[18px] h-[18px]" strokeWidth={1.6} />}
            label="Terms of Service"
            hint="The rules of the road"
            onClick={() => navigate("/terms")}
          />
          <GlassRow
            icon={<Cookie className="w-[18px] h-[18px]" strokeWidth={1.6} />}
            label="Cookie Policy"
            hint="What we store on your device"
            onClick={() => navigate("/cookies")}
          />
        </GlassCard>
      </GlassSection>

      <GlassSection title="Your data">
        <GlassCard>
          <GlassRow
            icon={<Brain className="w-[18px] h-[18px]" strokeWidth={1.6} />}
            label="Memory"
            hint="Review what Megsy remembers"
            onClick={() => navigate("/settings/memory")}
          />
          <GlassRow
            icon={<Mail className="w-[18px] h-[18px]" strokeWidth={1.6} />}
            label="Change email"
            onClick={() => navigate("/settings/change-email")}
          />
          <GlassRow
            icon={<KeyRound className="w-[18px] h-[18px]" strokeWidth={1.6} />}
            label="Change password"
            onClick={() => navigate("/settings/change-password")}
          />
          <GlassRow
            icon={<Download className="w-[18px] h-[18px]" strokeWidth={1.6} />}
            label="Export my data"
            hint="Download a copy of everything"
            onClick={() => navigate("/settings/support/contact")}
          />
        </GlassCard>
      </GlassSection>

      <GlassSection title="Account">
        <GlassCard>
          <GlassRow
            icon={<Trash2 className="w-[18px] h-[18px]" strokeWidth={1.6} />}
            label="Delete account"
            hint="Permanently remove your data"
            danger
            onClick={() => navigate("/settings/delete-account")}
          />
        </GlassCard>
      </GlassSection>
    </ProfileGlassShell>
  );
}
