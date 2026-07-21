/** @doc Settings home — soft lavender mobile layout with centered profile and grouped rows. */
import { useState, useEffect, useMemo, type FC, type SVGProps } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Check, Globe, Sparkles, Brain } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import DesktopSettingsLayout from "@/components/settings/DesktopSettingsLayout";
import DesktopSettingsHome from "@/components/settings/DesktopSettingsHome";
import CoffeeProfileMobile from "@/components/settings/CoffeeProfileMobile";

import { supabase } from "@/integrations/supabase/client";

import OliveAvatar from "@/components/branding/OliveAvatar";
import MegsyStar from "@/components/branding/MegsyStar";
import {
  AccountIcon,
  BillingIcon,
  AppearanceIcon,
  IntegrationsIcon,
  SupportIcon,
  PrivacyIcon,
  StatusIcon,
  LogoutIcon,
} from "@/components/settings/SettingsIcons";
import { useActiveAccount } from "@/hooks/useActiveAccount";
import {
  t as authT,
  useUserLang,
  setUserLang,
  AVAILABLE_LANGS,
  type AuthLang,
} from "@/lib/authI18n";


type Row = { icon: FC<SVGProps<SVGSVGElement>>; label: string; path?: string; onClick?: () => void; trailing?: string };
type Group = { title: string; rows: Row[] };

const SettingsPage = () => {
  const navigate = useNavigate();
  const go = (path: string) => navigate(path);
  const account = useActiveAccount();
  const lang = useUserLang();
  const [langSheet, setLangSheet] = useState(false);

  const [userEmail, setUserEmail] = useState("");
  const [plan, setPlan] = useState("free");

  const userName = account.name || userEmail.split("@")[0] || "User";
  const avatarUrl = account.avatarUrl;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || cancelled) return;
      setUserEmail(user.email || "");
      const { data: profile } = await supabase
        .from("profiles").select("plan").eq("id", user.id).single();
      if (profile && !cancelled) setPlan(profile.plan || "free");
    })();
    return () => { cancelled = true; };
  }, []);

  const isPremium = useMemo(
    () => !["free", "", null, undefined].includes((plan || "").toLowerCase()),
    [plan]
  );
  void isPremium;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    go("/auth");
  };

  const currentLangLabel = useMemo(
    () => AVAILABLE_LANGS.find((l) => l.code === lang)?.native ?? "English",
    [lang],
  );

  const groups: Group[] = [
    {
      title: authT("settingsAccount"),
      rows: [
        { icon: AccountIcon, label: authT("rowAccount"), path: "/settings/profile" },
        { icon: BillingIcon, label: authT("rowBilling"), path: "/settings/billing" },
      ],
    },
    {
      title: authT("settingsPreferences"),
      rows: [
        { icon: AppearanceIcon, label: authT("rowAppearance"), path: "/settings/customization" },
        
        { icon: (props: SVGProps<SVGSVGElement>) => <Brain {...props} />, label: "Memory", path: "/settings/memory" },
        { icon: IntegrationsIcon, label: authT("rowIntegrations"), path: "/settings/integrations" },
        {
          icon: (props: SVGProps<SVGSVGElement>) => <Globe {...props} />,
          label: authT("rowLanguage"),
          path: "/settings/language",
          trailing: currentLangLabel,
        },
      ],
    },
    {
      title: authT("settingsMore"),
      rows: [
        { icon: SupportIcon, label: authT("rowHelp"), path: "/settings/support" },
        { icon: PrivacyIcon, label: authT("rowPrivacy"), path: "/settings/privacy" },
        { icon: StatusIcon, label: authT("rowStatus"), path: "/settings/system-status" },
      ],
    },
  ];

  const isMobile = useIsMobile();
  if (!isMobile) {
    return (
      <DesktopSettingsLayout>
        <DesktopSettingsHome />
      </DesktopSettingsLayout>
    );
  }
  return <CoffeeProfileMobile />;
  // eslint-disable-next-line no-unreachable


  const iosSpring = { type: "spring" as const, stiffness: 280, damping: 28, mass: 0.9 };
  const pressCurve = "cubic-bezier(0.34, 1.35, 0.64, 1)";

  const handlePickLang = async (code: AuthLang) => {
    setLangSheet(false);
    await setUserLang(code);
    toast.success(authT("languageSaved"));
  };

  return (
    <div className="min-h-[100dvh] bg-background text-foreground">
      <div className="max-w-md mx-auto px-5 pb-10" style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 1rem)" }}>
        {/* Top bar */}
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...iosSpring, stiffness: 320, damping: 30 }}
          className="relative flex items-center justify-center h-11"
        >
          <button
            onClick={() => go("/chat")}
            aria-label={authT("back")}
            className="absolute left-0 w-10 h-10 rounded-full bg-foreground/[0.06] border border-foreground/10 flex items-center justify-center"
            style={{ transition: `transform 260ms ${pressCurve}` }}
            onPointerDown={(e) => (e.currentTarget.style.transform = "scale(0.92)")}
            onPointerUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
            onPointerLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-[17px] font-semibold tracking-tight">{authT("settingsTitle")}</h1>
        </motion.div>

        {/* Profile */}
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ ...iosSpring, delay: 0.05 }}
          className="mt-6 flex flex-col items-center"
        >
          <div className="w-[92px] h-[92px] rounded-full overflow-hidden ring-2 ring-foreground/15 shadow-[0_8px_28px_rgba(0,0,0,0.45)]">
            {avatarUrl
              ? <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
              : <OliveAvatar seed={userEmail || userName} className="w-full h-full" />}
          </div>
          <p className="mt-3 text-[18px] font-semibold tracking-tight">{userName}</p>
          <p className="text-[13px] text-foreground/55 mt-0.5">{userEmail || "—"}</p>
        </motion.div>

        {/* Premium upgrade CTA */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...iosSpring, delay: 0.12 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => go("/pricing")}
          className="mt-6 w-full rounded-2xl px-4 py-3.5 flex items-center gap-3 text-left text-white border border-white/10"
          style={{
            background: "linear-gradient(135deg, #8B5CF6 0%, #6366F1 50%, #4F46E5 100%)",
            boxShadow: "0 12px 28px -12px rgba(99, 102, 241, 0.6)",
            transition: `transform 260ms ${pressCurve}, box-shadow 260ms ${pressCurve}`,
          }}
        >
          <MegsyStar className="w-6 h-6 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[15px] font-semibold leading-tight">{authT("upgradePremium")}</p>
          </div>
        </motion.button>


        {/* Groups */}
        <div className="mt-6 space-y-5">
          {groups.map((group, gIdx) => (
            <motion.section
              key={group.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...iosSpring, delay: 0.18 + gIdx * 0.06 }}
            >
              <h2 className="text-[12px] font-medium text-foreground/50 px-1 mb-2">
                {group.title}
              </h2>
              <div className="rounded-2xl bg-card border border-foreground/10 overflow-hidden">
                {group.rows.map((row, rIdx) => {
                  const Icon = row.icon;
                  return (
                    <motion.button
                      key={row.label}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ ...iosSpring, delay: 0.22 + gIdx * 0.06 + rIdx * 0.04 }}
                      whileTap={{ scale: 0.985, backgroundColor: "hsl(var(--foreground) / 0.06)" }}
                      onClick={() => (row.onClick ? row.onClick() : row.path && go(row.path))}
                      className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-foreground/[0.03]"
                      style={{ transition: `background-color 200ms ease` }}
                    >
                      <Icon className="w-[18px] h-[18px] text-foreground/80 shrink-0" />
                      <span className="flex-1 text-[15px] font-medium text-foreground">{row.label}</span>
                      {row.trailing && (
                        <span className="text-[13px] text-foreground/55 shrink-0">{row.trailing}</span>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </motion.section>
          ))}

          {/* Logout group */}
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...iosSpring, delay: 0.42 }}
          >
            <div className="rounded-2xl bg-card border border-foreground/10 overflow-hidden">
              <motion.button
                whileTap={{ scale: 0.985 }}
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-foreground/[0.03] active:bg-foreground/[0.06]"
                style={{ transition: `background-color 200ms ease` }}
              >
                <LogoutIcon className="w-[18px] h-[18px] text-rose-400 shrink-0" />
                <span className="flex-1 text-[15px] font-medium text-rose-400">{authT("rowLogout")}</span>
              </motion.button>
            </div>
          </motion.section>
        </div>

      </div>

      {/* Language bottom sheet */}
      <AnimatePresence>
        {langSheet && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLangSheet(false)}
              className="fixed inset-0 bg-black/50 z-40"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-background rounded-t-3xl border-t border-foreground/10"
              style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 1rem)" }}
            >
              <div className="mx-auto max-w-md px-5 pt-4 pb-2">
                <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-foreground/20" />
                <h3 className="text-[16px] font-semibold text-center mb-3">{authT("languageSheetTitle")}</h3>
                <div className="rounded-2xl bg-card border border-foreground/10 overflow-hidden">
                  {AVAILABLE_LANGS.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => handlePickLang(l.code)}
                      className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-foreground/[0.04]"
                    >
                      <span className="flex-1 text-[15px] font-medium">{l.native}</span>
                      <span className="text-[12px] text-foreground/50">{l.label}</span>
                      {lang === l.code && (
                        <Check className="w-4 h-4 text-foreground/80" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SettingsPage;
