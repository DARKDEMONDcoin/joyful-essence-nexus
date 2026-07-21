/** @doc The page you're reading — the comprehensive, self-updating Megsy AI documentation. */
// Megsy AI — Comprehensive Docs page (/docs)
// Cartoon / brand-ink design system, matching the landing page + settings.
// One long, fully-indexed reference for EVERY feature, page, agent, setting,
// integration, plan, policy, route and shortcut on megsyai.com.
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PrefetchLink as Link } from "@/components/common/PrefetchLink";
import {
  Sparkles,
  MessageSquare,
  Image as ImageIcon,
  Video,
  Presentation,
  FileText,
  Microscope,
  Globe,
  Code2,
  GraduationCap,
  Users,
  Share2,
  Bell,
  Brain,
  Palette,
  Shield,
  Wallet,
  Gift,
  Link2,
  Smartphone,
  Monitor,
  Apple,
  Keyboard,
  HelpCircle,
  Rocket,
  Search,
  X,
  ChevronRight,
  CheckCircle2,
  Workflow,
  Settings as SettingsIcon,
  ScrollText,
  Wand2,
  Mic,
  Music,
  Languages,
  Building2,
  LayoutGrid,
  Bot,
  ShieldCheck,
  BookOpen,
  MapPin,
  PaintBucket,
  Database,
  Eye,
  Zap,
  Crown,
  ListTree,
  Pin,
  FolderTree,
  Upload,
  Download,
  RefreshCw,
  Globe2,
  Lock,
  CreditCard,
  Receipt,
  BadgeCheck,
  Layers,
  Cpu,
  Pencil,
  Link as LinkIcon,
  Copy,
  Check,
  ChevronLeft,
  History,
  PlusCircle,
  ShieldAlert,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import LandingNavbar from "@/components/landing/LandingNavbar";
import MegsyStar from "@/components/branding/MegsyStar";
import SEOHead from "@/components/common/SEOHead";
import { Helmet } from "react-helmet-async";
import { SITE_LANGS, getSiteLang, langPrefix } from "@/lib/siteLangs";
import { useI18nTranslations } from "@/hooks/useI18nTranslations";
import { getUserLang } from "@/lib/authI18n";

import pwaIos from "@/assets/docs/pwa-ios.png";
import pwaAndroid from "@/assets/docs/pwa-android.png";
import pwaDesktop from "@/assets/docs/pwa-desktop.png";

// ⭐ LIVE DATA IMPORTS — Docs auto-updates whenever any of these change.
// Add a plan, model, FAQ, blog post, comparison or landing anywhere on the
// site → it appears here automatically, no edit to /docs needed.
import {
  PLANS,
  FAQS,
  SERVICES_GUIDE,
  ENTERPRISE_FEATURES,
  PLAN_MONTHLY_CREDITS,
} from "@/data/pricingData";
import { BLOG_POSTS } from "@/data/blogPosts";
import { COMPARISONS } from "@/data/comparisons";
// SERVICE_LANDINGS (2459 lines), integrationsData (1091 lines) and
// slidesTemplates (634 lines) are lazy-loaded inside buildAutoGroups() so the
// initial DocsPage chunk doesn't pay for ~4 KLOC of reference tables. They
// resolve in parallel after mount and populate the "auto-sync" groups.
import { AGENTS } from "@/lib/agentRegistry";
import { CREDITS_PER_SIGNUP, COMMISSION_PCT, MIN_PAYOUT } from "@/pages/billing/ReferralsPage";
import {
  DOC_PAGES,
  DOC_EDGE_FUNCTIONS,
  DOC_REGISTRY_STATS,
  groupPagesByFolder,
} from "@/lib/docsRegistry";
import { SKILL_TOOLS, SKILL_MODELS } from "@/lib/skillTools";
import { CHANGELOG } from "@/data/changelog";

const LandingFooter = lazy(() => import("@/components/landing/LandingFooter"));

// Brand tokens — same palette used by settings + landing.
const INK = "hsl(var(--brand-ink))";
const PARCHMENT = "hsl(var(--brand-parchment))";
const ACTION = "hsl(var(--brand-action))";
const MINT = "hsl(var(--brand-mint))";
const BLUSH = "hsl(var(--brand-blush))";

/* ───────────────────────── Doc data model ───────────────────────── */

type DocBlock =
  | { kind: "p"; text: string }
  | { kind: "h"; text: string }
  | { kind: "ul"; items: string[] }
  | { kind: "ol"; items: string[] }
  | { kind: "kv"; rows: { k: string; v: string }[] }
  | { kind: "code"; text: string; lang?: string }
  | { kind: "note"; text: string }
  | { kind: "image"; src: string; alt: string; caption?: string }
  | { kind: "link"; href: string; label: string };

interface DocSection {
  id: string;
  title: string;
  icon: LucideIcon;
  intro?: string;
  blocks: DocBlock[];
  accent?: string; // sticker accent color
}

interface DocGroup {
  id: string;
  label: string;
  sections: DocSection[];
}

const STATIC_GROUPS: DocGroup[] = [
  /* ─────────────────────────── Introduction ─────────────────────────── */
  {
    id: "intro",
    label: "Introduction",
    sections: [
      {
        id: "overview",
        title: "What is Megsy AI?",
        icon: MegsyStar as unknown as LucideIcon,
        accent: ACTION,
        intro:
          "Megsy AI is an all-in-one creative & productivity platform powered by a single shared credit balance called Megsy Credits (MC). One subscription unlocks chat, images, video, websites, code, slides, docs, deep research, voice, music, learning, autonomous agents and 1,000+ integrations — no tool-hopping, no extra logins.",
        blocks: [
          { kind: "h", text: "What you get out of the box" },
          {
            kind: "ul",
            items: [
              "A unified chat workspace where every modality lives behind the same composer — switch from text to image to video to a full website without leaving the conversation.",
              "The Megsy model family (Lite, AI, Max) plus 80+ best-in-class third-party models — GPT, Claude, Gemini, Grok, Qwen, DeepSeek, Llama, Flux, Recraft, Ideogram, Imagen, Sora, Veo, Kling, Pixverse, Runway, Hailuo, Seedance and more.",
              "Built-in image / video editing, lip-sync, faceswap, upscaling, music, voice cloning, slides, long-form docs and an AI website builder with one-click publish.",
              "Operator (Megsy OS) — autonomous browser-using agents that work for hours unattended and ship results to your inbox.",
              "Team workspaces, shared memory, shared skills, role-based permissions and pooled credits.",
              "Installable as a real native-feeling app on iPhone, iPad, Android, macOS, Windows and Linux (PWA).",
              "Auto-mirroring of your language and dialect — Egyptian Arabic stays Egyptian, French stays French. Never translates or switches on you.",
              "Privacy-first: your prompts and outputs are yours. Never used to train any third-party model.",
            ],
          },
          {
            kind: "note",
            text: "A Free plan with starter MC is included — no card required to try every tool.",
          },
          { kind: "link", href: "/features-guide", label: "See the full features guide →" },
          { kind: "link", href: "/pricing", label: "Compare plans & top-ups →" },
        ],
      },
      {
        id: "quickstart",
        title: "Quick start — your first 5 minutes",
        icon: Rocket,
        accent: MINT,
        intro:
          "A guided walkthrough from signing up to publishing your first creation. Each step takes under a minute.",
        blocks: [
          {
            kind: "ol",
            items: [
              "Go to megsyai.com and click ‘Sign in’ in the top right. Choose email, Google, or Apple. New accounts are created instantly with starter MC.",
              "You land on /chat — the main workspace. The composer at the bottom is where you type. The model name above the composer (e.g. ‘Megsy AI’) is tappable to switch models.",
              "Above the composer is the Mode Bar: Chat, Create Website, Images, Videos, Deep Research, Slides, Docs, Learning, Code, Operator. Tap any chip to enter that mode — the composer adapts (e.g. shows aspect ratio for Images, depth slider for Research).",
              "Type a prompt. Attach files with the paperclip (PDF, DOCX, XLSX, CSV, images, audio, video, code). Press Enter to send, Shift+Enter for a new line.",
              "When the answer arrives you can: regenerate, branch, copy, share, edit, read aloud, translate, fork into a new chat, or rate it. Edit any of YOUR messages and the rest of the thread regenerates automatically.",
              "Open the sidebar (Cmd/Ctrl + B) to see all chats. Pin important ones, drag them into folders, search with Cmd/Ctrl + K.",
              "Open Settings → Customization to pick an accent color, message bubble style, and your preferred reply tone.",
              "Install Megsy as an app (see the PWA section) for full-screen, offline-friendly use with push notifications.",
            ],
          },
          {
            kind: "note",
            text: "Tip: the very first chat you start is auto-titled by Megsy after your second message — you don’t have to name it.",
          },
        ],
      },
      {
        id: "site-map",
        title: "Site map — every public page on megsyai.com",
        icon: MapPin,
        accent: BLUSH,
        intro:
          "A single index of every route on the site, grouped by area. Click any path to jump straight there. If a page is gated, you’ll be sent to /auth first and bounced back after sign-in.",
        blocks: [
          { kind: "h", text: "Core app" },
          {
            kind: "kv",
            rows: [
              { k: "/", v: "Home — landing, hero, showcase, featured demos." },
              { k: "/chat", v: "Main chat workspace, all modes, all models, all attachments." },
              { k: "/share/:id", v: "Public read-only link to a shared chat." },
              { k: "/pricing", v: "Plans, yearly toggle, MC top-up packs, FAQ." },
              {
                k: "/features-guide",
                v: "Long-form feature tour with screenshots and comparisons.",
              },
              { k: "/about", v: "About the team, mission, and timeline." },
              { k: "/enterprise", v: "Enterprise capabilities, SSO, DPA, sales contact form." },
              {
                k: "/egypt",
                v: "Egypt-focused regional landing — pricing in EGP, local payment methods.",
              },
              { k: "/blog", v: "Auto-publishing blog (3 fresh articles per day, every language)." },
              { k: "/docs", v: "This documentation hub — searchable, complete." },
              { k: "/support", v: "AI support chat (24/7) — knows every page of these docs." },
              { k: "/contact", v: "Human contact form — routes to support@megsyai.com." },
            ],
          },
          { kind: "h", text: "Auth & onboarding" },
          {
            kind: "kv",
            rows: [
              { k: "/auth", v: "Combined sign-in / sign-up / password reset." },
              { k: "/auth/two-factor", v: "TOTP code challenge after login." },
              { k: "/auth/mfa-challenge", v: "Backup-code or recovery challenge." },
              { k: "/auth/accept-invite", v: "Accept a personal chat invite." },
              { k: "/auth/accept-workspace-invite", v: "Accept a workspace seat invite." },
              {
                k: "/auth/oauth/authorize",
                v: "OAuth approval screen when a third-party app asks for access.",
              },
              { k: "/auth/oauth/callback", v: "Return URL after an OAuth handshake." },
              { k: "/auth/reset-password", v: "Set a new password from a reset link." },
              { k: "/auth/change-email", v: "Confirm a new email from an emailed link." },
              { k: "/auth/change-password", v: "Self-serve change while signed in." },
              {
                k: "/auth/delete-account",
                v: "Final confirmation to permanently delete an account.",
              },
              {
                k: "/r/:code",
                v: "Referral redirect — drops the referral cookie and sends to /auth.",
              },
            ],
          },
          { kind: "h", text: "Settings" },
          {
            kind: "kv",
            rows: [
              { k: "/settings", v: "Settings home." },
              { k: "/settings/profile", v: "Name, avatar, pronouns, bio." },
              { k: "/settings/billing", v: "Plan, invoices, payment method, MC usage, top-ups." },
              { k: "/settings/language", v: "Force the UI language (otherwise auto-detected)." },
              { k: "/settings/memory", v: "Long-term AI memory — review, edit, delete each fact." },
              {
                k: "/settings/customization",
                v: "Accent color, reply tone, response shape, persona.",
              },
              {
                k: "/settings/integrations",
                v: "Connect Gmail, Slack, Notion, GitHub, Telegram and 1,000+ apps.",
              },
              { k: "/settings/notifications", v: "Push, email and in-app notification controls." },
              { k: "/settings/skills", v: "Build, edit and share custom Skills." },
              { k: "/settings/skills/new", v: "New Skill wizard." },
              { k: "/settings/operator", v: "Megsy OS — autonomous agents home." },
              {
                k: "/settings/operator/agents",
                v: "Create / configure agents and recurring runs.",
              },
              { k: "/settings/operator/audit", v: "Full action audit log for every agent run." },
              { k: "/settings/two-factor", v: "Enable / disable 2FA, view recovery codes." },
              {
                k: "/settings/change-email · /settings/change-password · /settings/delete-account",
                v: "Self-serve account changes.",
              },
              { k: "/settings/security", v: "Sessions, devices, login alerts." },
              { k: "/settings/privacy", v: "Data export, training opt-out toggles." },
              { k: "/settings/help", v: "Help center — links to /docs and the AI support chat." },
              { k: "/settings/contact", v: "In-app contact form." },
              { k: "/settings/system-status", v: "Live status of every Megsy service." },
              {
                k: "/settings/switch-account",
                v: "Add and toggle multiple accounts on one device.",
              },
              {
                k: "/settings/referrals",
                v: "Referrals dashboard (tabs: Dashboard, Program, Tasks, Withdrawals).",
              },
              {
                k: "/settings/referrals/resources",
                v: "Marketing kit — videos, captions, banners to repost.",
              },
            ],
          },
          { kind: "h", text: "Workspaces & billing" },
          {
            kind: "kv",
            rows: [
              { k: "/workspaces", v: "List of workspaces you belong to." },
              { k: "/workspaces/new", v: "Create a new workspace." },
              { k: "/workspaces/:id", v: "Workspace overview — members, chats, assets, settings." },
              { k: "/workspaces/:id/tasks", v: "Task board for the workspace (Kanban-style)." },
              { k: "/billing/success", v: "Confirmation page shown after a successful payment." },
              { k: "/billing/withdraw", v: "Request a cash withdrawal of referral earnings." },
            ],
          },
          { kind: "h", text: "Legal & trust" },
          {
            kind: "kv",
            rows: [
              { k: "/terms · /privacy · /cookies · /refund", v: "Core legal." },
              { k: "/acceptable-use · /policies/content", v: "What you may and may not generate." },
              { k: "/legal/ai-disclaimer", v: "Important AI limitations & user responsibility." },
              {
                k: "/legal/dmca · /legal/dpa · /legal/affiliate",
                v: "Copyright, data processing, affiliate terms.",
              },
              {
                k: "/legal/moderation · /legal/age",
                v: "Moderation framework and minimum-age rules.",
              },
              {
                k: "/legal/subprocessors · /legal/accessibility · /legal/compliance",
                v: "Vendor list, WCAG conformance, regional compliance.",
              },
              { k: "/security · /trust", v: "Security posture and trust center." },
            ],
          },
        ],
      },
      {
        id: "anatomy",
        title: "Anatomy of the chat workspace",
        icon: LayoutGrid,
        accent: ACTION,
        intro:
          "Every pixel of /chat explained — what each region does, where to click, and the keyboard shortcut where one exists.",
        blocks: [
          { kind: "h", text: "Left sidebar" },
          {
            kind: "ul",
            items: [
              "Top: Megsy logo (returns to /chat) and the New Chat button (Cmd/Ctrl + N).",
              "Search bar — full-text search across every chat (Cmd/Ctrl + K).",
              "Pinned section — chats you’ve pinned stay on top across sessions.",
              "Folders — drag and drop chats into folders, nest folders, rename inline.",
              "Recent — newest chats first, lazy-loaded as you scroll.",
              "Workspace switcher (bottom) — flip between personal and team workspaces.",
              "Account menu — profile, settings, billing, sign out.",
              "Collapse / expand toggle (Cmd/Ctrl + B) — frees screen space on small displays.",
            ],
          },
          { kind: "h", text: "Top bar" },
          {
            kind: "ul",
            items: [
              "Chat title — click to rename inline. Auto-generated after your second message.",
              "Share button — generates a public read-only link or invites a person to co-chat live.",
              "Model name — tap to open the Model Picker.",
              "Branch / Fork — opens the current thread in a new chat without affecting this one.",
              "Menu (⋯) — archive, delete, export, move to folder, pin.",
            ],
          },
          { kind: "h", text: "Composer (bottom)" },
          {
            kind: "ul",
            items: [
              "Mode Bar above the composer — Chat, Create Website, Images, Videos, Deep Research, Slides, Docs, Learning, Code, Operator. Active mode is highlighted; tap the small ‘×’ on a non-chat mode to return to plain chat.",
              "Paperclip — attach files (PDF, DOCX, XLSX, CSV, MD, TXT, images, audio, video, ZIP, code).",
              "Mic — push-to-talk voice input.",
              "Globe — toggle web search grounding for this message.",
              "Slash ‘/’ — open the Skills launcher (your custom prompts).",
              "‘@’ — mention an agent (e.g. @images, @videos, @docs, @slides, @research, @megsy-os).",
              "Send button — Enter to send, Shift+Enter for newline.",
              "Below the composer: model cost preview, attached file chips, voice/transcript controls.",
            ],
          },
          { kind: "h", text: "Message actions (hover any reply)" },
          {
            kind: "ul",
            items: [
              "Copy — copy as Markdown.",
              "Regenerate — re-run the same prompt; previous reply is kept as a branch.",
              "Try another model — open the picker and compare.",
              "Read aloud — TTS in 30+ languages.",
              "Translate — convert to any language without losing context.",
              "Share this single answer as a public mini-link.",
              "Save to memory — add a fact to /settings/memory.",
              "Flag — report a problem; helps our moderation queue.",
            ],
          },
        ],
      },
    ],
  },

  /* ─────────────────────────── Account & billing ─────────────────────────── */
  {
    id: "account",
    label: "Account & billing",
    sections: [
      {
        id: "auth",
        title: "Sign in, sign up & account security",
        icon: Shield,
        accent: ACTION,
        intro: "Every way to get into Megsy and every control over your account.",
        blocks: [
          { kind: "h", text: "Sign-in methods" },
          {
            kind: "ul",
            items: [
              "Email + password — set during sign-up; resettable any time via /auth.",
              "Google sign-in — one tap, no password.",
              "Apple sign-in — works on iOS/macOS and the web.",
              "Magic link — receive a one-time link by email, click to sign in.",
              "Single Sign-On (SAML / OIDC) — available on Enterprise.",
            ],
          },
          { kind: "h", text: "Two-Factor Authentication (2FA)" },
          {
            kind: "ol",
            items: [
              "Open /settings/two-factor.",
              "Scan the QR code with any TOTP app (Google Authenticator, 1Password, Authy, Bitwarden).",
              "Enter the 6-digit code to confirm.",
              "SAVE the recovery codes shown on screen — they are the only way back in if you lose your device.",
              "Next sign-in will prompt for a code at /auth/two-factor.",
            ],
          },
          { kind: "h", text: "Account management" },
          {
            kind: "ul",
            items: [
              "Change email — Settings → Change Email. Confirmation goes to both addresses.",
              "Change password — Settings → Change Password. Current password required.",
              "Active sessions — Settings → Security → ‘Sign out remote devices’.",
              "Switch / add accounts — Settings → Switch Account. Up to 5 accounts on one device.",
              "Delete account — Settings → Delete Account. Permanent; data is purged within 30 days per GDPR Art. 17.",
              "Data export — Settings → Privacy → ‘Download my data’ for a ZIP of chats, files, settings.",
            ],
          },
          { kind: "link", href: "/security", label: "Read the full security posture →" },
        ],
      },
      {
        id: "credits",
        title: "Megsy Credits (MC) — how the economy works",
        icon: Wallet,
        accent: MINT,
        intro:
          "Every action on Megsy spends MC. A single shared balance powers chat, images, video, slides, docs, research, voice, music, Operator and integrations — no per-tool sub-quotas, no expiring buckets.",
        blocks: [
          { kind: "h", text: "How MC is consumed" },
          {
            kind: "ul",
            items: [
              "Each model shows its MC cost above the composer before you send.",
              "Cheap actions (a Megsy Lite reply, a Nano Banana image) cost just 1–3 MC.",
              "Premium actions (a Sora video, a Veo 3.1 generation, a 200-source Deep Research) cost more — you always see the price first.",
              "Failed generations are auto-refunded — the refund line appears in Settings → Billing → Usage.",
              "Web search and integrations cost 0 MC (your plan’s usage cap still applies).",
            ],
          },
          { kind: "h", text: "How MC is earned" },
          {
            kind: "ul",
            items: [
              "Free starter MC on sign-up — no card required.",
              "Monthly grant on every paid plan (Pro, Elite, Business).",
              "Yearly billing grants extra MC up front.",
              "Top-up packs from /settings/billing — instant, never expires.",
              "Referrals — both sides get 15 MC per signup.",
              "Tasks — /settings/referrals/tasks lists small actions (verify email, install PWA, share on social) that grant bonus MC.",
            ],
          },
          { kind: "h", text: "Unlimited windows on paid plans" },
          {
            kind: "ul",
            items: [
              "Pro — 7-day creation window per month for image tools; video uses included MC credits.",
              "Elite — 15-day unlimited window, priority queue, higher export resolution.",
              "Business — full-month unlimited window plus shared workspace credits.",
              "Megsy AI text chat is unlimited on every paid plan (Pro and above).",
            ],
          },
        ],
      },
      {
        id: "plans",
        title: "Plans & pricing in detail",
        icon: Crown,
        accent: ACTION,
        intro:
          "Compare every plan. All prices in USD. Yearly billing always lowers the effective monthly price and grants extra MC up front. Local currency (EUR, GBP, EGP, SAR, AED, INR…) is shown automatically at checkout.",
        blocks: [
          {
            kind: "kv",
            rows: [
              {
                k: "Free — $0",
                v: "Starter MC, Megsy Lite chat, watermarked previews on heavy media tools. Great for trying the platform with no card.",
              },
              {
                k: "Pro — $25 / month",
                v: "Unlimited Megsy AI text chat, full Mode Bar, 7-day image creation window, video generation via included MC credits, all standard models, all integrations.",
              },
              {
                k: "Elite — $59 / month",
                v: "Everything in Pro, 15-day unlimited window, priority generation queue, higher resolution exports, premium model access (Veo 3.1, Sora 2 Pro, Kling Master).",
              },
              {
                k: "Business — $149 / month",
                v: "Everything in Elite, full-month unlimited window, team workspaces, pooled credits, shared skills & memory, role-based access, audit log, REST API.",
              },
              {
                k: "Enterprise — custom",
                v: "Custom MC pools, SSO (SAML/OIDC), SCIM, DPA, region pinning, dedicated success manager, priority SLA, custom invoicing. Contact sales at /enterprise.",
              },
            ],
          },
          { kind: "h", text: "Add-ons that work on every plan" },
          {
            kind: "ul",
            items: [
              "MC top-ups — buy extra credits any time from /settings/billing. They never expire.",
              "Yearly upgrade — switch monthly→yearly mid-cycle; we credit the unused days automatically.",
              "Workspace seats (Business+) — add seats from /workspaces/:id → Members.",
            ],
          },
          { kind: "h", text: "Yearly billing — the exact savings" },
          {
            kind: "p",
            text: "Every paid plan can be billed yearly. You pay for 10 months and get 12 — the equivalent of 2 free months — plus a one-time bonus MC grant deposited the day your yearly term starts. The bonus never expires. Switching monthly → yearly mid-cycle is prorated automatically; you only pay the difference.",
          },
          {
            kind: "kv",
            rows: [
              {
                k: "Pro yearly — $250/yr (≈ $20.83/mo)",
                v: "Save $50 vs monthly + 480 bonus MC up front. Effective 17% discount.",
              },
              {
                k: "Elite yearly — $590/yr (≈ $49.17/mo)",
                v: "Save $118 vs monthly + 1,000 bonus MC up front. Effective 17% discount.",
              },
              {
                k: "Business yearly — $1,490/yr (≈ $124.17/mo)",
                v: "Save $298 vs monthly + 2,400 bonus MC up front. Effective 17% discount.",
              },
              {
                k: "Enterprise yearly",
                v: "Custom multi-year contracts with volume discounts, POs, NET-30 invoicing and lock-in pricing — talk to sales at /enterprise.",
              },
            ],
          },
          {
            kind: "note",
            text: "Yearly subscriptions renew automatically on the same date next year. You can switch back to monthly or cancel any time from /settings/billing — access continues until the paid period ends and any remaining MC top-ups stay yours.",
          },
          { kind: "link", href: "/pricing", label: "Open the live pricing page →" },
        ],
      },
      {
        id: "billing-dashboard",
        title: "Billing dashboard — where every money control lives",
        icon: Receipt,
        accent: BLUSH,
        intro:
          "Settings → Billing is the single source of truth for everything financial about your account.",
        blocks: [
          { kind: "h", text: "Sections inside /settings/billing" },
          {
            kind: "ul",
            items: [
              "Plan card — current plan, monthly/yearly toggle, next renewal date, change/cancel/downgrade buttons.",
              "Credits card — current MC balance, this month’s grant, top-up shortcut, low-balance threshold.",
              "Usage breakdown — MC spent per tool, per day, per model. Refunds are listed in green.",
              "Payment method — add or remove your card. All checkout is securely handled by Dodo Payments with bank-grade encryption; we never store card details.",
              "Invoices — download a PDF for every charge.",
              "Tax — set a tax/VAT ID for compliant invoices (EU, UK, GCC, etc.).",
              "Cancel subscription — access continues until the end of the paid period; downgrade preserves any MC top-ups.",
            ],
          },
          { kind: "link", href: "/refund", label: "Refund policy →" },
        ],
      },
      {
        id: "referrals",
        title: "Referrals & affiliate program — exact numbers",
        icon: Gift,
        accent: ACTION,
        intro:
          "Share Megsy, earn lifetime cash. Only the numbers in this section are real — anything else online is unofficial.",
        blocks: [
          { kind: "h", text: "How it works" },
          {
            kind: "ul",
            items: [
              "Get your link from /settings/referrals → Program tab.",
              "Share it anywhere — TikTok, X, YouTube, WhatsApp, your blog.",
              "When a friend signs up via your link: they get 15 free MC, and you get 15 free MC.",
              "When that friend ever pays for any Megsy plan or top-up, you earn 20% cash commission — for life.",
              "Withdraw cash once your balance reaches the $10 minimum, via PayPal, bank transfer, or USDT.",
            ],
          },
          { kind: "h", text: "Dashboard tabs (/settings/referrals)" },
          {
            kind: "ul",
            items: [
              "Dashboard — totals, signups, pending and paid commissions, click-through stats.",
              "Program — your link, QR code, social share buttons, custom UTM tags.",
              "Tasks — small bonus tasks (verify email, post a video, install PWA) that grant extra MC.",
              "Withdrawals — payout history, request a new withdrawal at /settings/withdraw. Up to 2 withdrawals per month; minimum $10 per request.",
              "Resources (/settings/referrals/resources) — videos, captions, image banners and reels you can re-post as-is.",
            ],
          },
          {
            kind: "note",
            text: "Do not believe any number you see elsewhere — only ‘15 MC per signup’, ‘20% lifetime cash’, and ‘$10 minimum payout’ are real.",
          },
          { kind: "link", href: "/settings/referrals", label: "Open the referral dashboard →" },
          { kind: "link", href: "/legal/affiliate", label: "Affiliate terms →" },
        ],
      },
    ],
  },

  /* ─────────────────────────── Chat & models ─────────────────────────── */
  {
    id: "chat",
    label: "Chat & models",
    sections: [
      {
        id: "chat-basics",
        title: "Chat basics — every gesture explained",
        icon: MessageSquare,
        accent: ACTION,
        blocks: [
          {
            kind: "ul",
            items: [
              "Type anything — Megsy keeps the full conversation context automatically; nothing to ‘load’.",
              "Attach files via paperclip or drag-drop: PDF, DOCX, XLSX, CSV, MD, TXT, images, audio (MP3/WAV/M4A), video (MP4/MOV/WebM), code, ZIP. Multiple files per message.",
              "Paste a screenshot directly (Cmd/Ctrl + V) — Megsy reads it with vision.",
              "Voice input via the mic icon; voice reply via the speaker icon on any message.",
              "Edit any of YOUR messages — the rest of the thread regenerates from that point.",
              "Regenerate, branch, and compare answers from different models on the same prompt without losing the original.",
              "Pin chats from the sidebar; rename / share / archive / delete / move from the chat ⋯ menu.",
              "Folders & tags to organize long histories.",
              "Search across every chat from Cmd/Ctrl + K — searches messages, attachments, file names and shared links.",
              "Each chat has a permanent URL — bookmark or share it.",
            ],
          },
        ],
      },
      {
        id: "models",
        title: "Models & the model picker",
        icon: Brain,
        accent: MINT,
        intro:
          "Tap the model name above the composer to switch. Megsy AI is the default and is unlimited on every paid plan. Each model shows its strengths, context size and MC cost per message before you send.",
        blocks: [
          { kind: "h", text: "The Megsy family" },
          {
            kind: "kv",
            rows: [
              {
                k: "Megsy Lite",
                v: "Free tier — fast everyday answers. Best for short Q&A, summaries, small drafts.",
              },
              {
                k: "Megsy AI",
                v: "Default flagship reasoning model. Unlimited on Pro+. Best balance of speed, depth and cost.",
              },
              {
                k: "Megsy Max",
                v: "Deep reasoning routed to the current frontier model. For complex math, multi-step reasoning, code refactors.",
              },
            ],
          },
          { kind: "h", text: "Third-party text models (one balance, one picker)" },
          {
            kind: "kv",
            rows: [
              { k: "GPT family (OpenAI)", v: "Premium reasoning and writing." },
              { k: "Claude family (Anthropic)", v: "Best long-form writing & document analysis." },
              { k: "Gemini family (Google)", v: "Multimodal, web-grounded answers." },
              { k: "Grok (xAI)", v: "Real-time web-aware chat." },
              {
                k: "Qwen, DeepSeek, Llama",
                v: "Open & alternative frontier models for code and reasoning.",
              },
            ],
          },
          { kind: "h", text: "Image models" },
          {
            kind: "kv",
            rows: [
              { k: "Megsy Image", v: "House model — clean, brand-safe, ~8 MC." },
              {
                k: "Nano Banana / Nano Banana 2 / Nano Banana Pro",
                v: "Fastest, cheapest (~2–4 MC).",
              },
              { k: "Gemini 3 Pro Image", v: "Multimodal precision (~10 MC)." },
              {
                k: "GPT Image 2 / GPT-5 Image / GPT-5.4 Image 2",
                v: "OpenAI’s image family for typography & branded outputs (~6–14 MC).",
              },
              {
                k: "Flux, Recraft, Ideogram, Imagen, ByteDance Seed",
                v: "Available via the model picker for specific styles.",
              },
            ],
          },
          { kind: "h", text: "Video models" },
          {
            kind: "kv",
            rows: [
              { k: "Megsy Video", v: "House model — ~40 MC." },
              { k: "Seedance 2.0 / 2.0 Fast / 1.5 Pro", v: "Fast cinematic clips (~30–60 MC)." },
              { k: "Hailuo 2.3", v: "Stylised motion (~40 MC)." },
              { k: "Kling Master", v: "Long, coherent clips (~90 MC)." },
              { k: "Veo 3.1 / Veo 3.1 Lite", v: "Google’s flagship video model (~50–80 MC)." },
              { k: "Sora 2 Pro", v: "OpenAI cinema-grade (~100 MC)." },
            ],
          },
          {
            kind: "note",
            text: "Switching mid-thread keeps your context — the new model sees the whole conversation.",
          },
        ],
      },
      {
        id: "web-search",
        title: "Web search & citations",
        icon: Globe,
        accent: BLUSH,
        blocks: [
          {
            kind: "p",
            text: "Toggle the globe icon on the composer to ground answers in live web results. Replies include inline numbered citations you can click — each opens the original source in a new tab. Megsy picks reputable sources, filters spam, and cross-checks claims. Cost: 0 MC; subject to fair-use throttling on the Free plan.",
          },
        ],
      },
      {
        id: "voice",
        title: "Voice — talk and listen",
        icon: Mic,
        accent: ACTION,
        blocks: [
          {
            kind: "ul",
            items: [
              "Push-to-talk via the mic icon — hold to record, release to send.",
              "Hands-free voice mode — open from the bottom-right of the composer for a real spoken conversation with interruptions and turn-taking.",
              "30+ natural voices across English, Arabic (incl. Egyptian dialect), French, Spanish, German, Portuguese, Italian, Turkish, Russian, Hindi, Chinese, Japanese, Korean and more.",
              "Auto language detection — Megsy replies in the language you spoke.",
              "Read any message aloud with one tap (speaker icon).",
              "Voice cloning available in @voice → Voice Clone (5 MC) — upload a 30-second sample.",
            ],
          },
        ],
      },
      {
        id: "files",
        title: "Files, vision & document analysis",
        icon: FileText,
        accent: MINT,
        blocks: [
          {
            kind: "ul",
            items: [
              "Drag any file into the composer. Up to 20 files per message.",
              "Supported: PDF (incl. scanned, OCR), DOCX, XLSX, CSV, MD, TXT, JSON, YAML, HTML, images, audio, video, code (any language), ZIP (auto-extracted).",
              "Per-file limit: 200 MB on Free, up to 2 GB on Business/Enterprise.",
              "Megsy can read very long PDFs in chunks and synthesise across them.",
              "Vision: paste or attach an image — Megsy describes it, extracts text (OCR), reads tables, identifies objects.",
              "Audio: transcribe with timestamps; summarise meetings; identify speakers.",
              "Video: scene-by-scene summary, transcript, key frame extraction.",
              "All uploaded files are stored privately under your account and reusable across chats via the library.",
            ],
          },
        ],
      },
    ],
  },

  /* ─────────────────────────── Agents & creative tools ─────────────────────────── */
  {
    id: "agents",
    label: "Agents & creative tools",
    sections: [
      {
        id: "agents-website",
        title: "Create Website (Megsy Builder)",
        icon: Globe,
        accent: ACTION,
        intro:
          "Describe what you want and Megsy builds a real, deployable site in seconds. Iterate by chatting — the live preview updates as code is written.",
        blocks: [
          {
            kind: "ul",
            items: [
              "Production stack: React 18 + Vite + Tailwind CSS + TypeScript.",
              "One-click publish to a free megsy.app subdomain or your own custom domain.",
              "Attach a database (Postgres), authentication, payments (Stripe / Paddle / Dodo), file storage and edge functions in a click.",
              "Push directly to GitHub — your repo is the source of truth.",
              "Built-in SEO: titles, descriptions, OG/Twitter cards, sitemap.xml, robots.txt, JSON-LD, canonical tags.",
              "Accessibility checks on every build (WCAG AA).",
              "Mobile-first responsive previews — phone, tablet, desktop side by side.",
              "Roll back to any previous version from the version history.",
              "Invite collaborators — they can edit prompts, not just see them.",
            ],
          },
          { kind: "h", text: "Tips for the best results" },
          {
            kind: "ul",
            items: [
              "Be explicit about brand vibe, target audience, and required pages.",
              "Attach a reference screenshot — Megsy will match the layout.",
              "Ask for ‘design directions’ first to compare 2–3 visual options before committing.",
              "Use the version history to A/B compare versions without losing work.",
            ],
          },
        ],
      },
      {
        id: "agents-images",
        title: "Images — generation & editing",
        icon: ImageIcon,
        accent: MINT,
        intro:
          "State-of-the-art image generation with multiple models (Megsy Image, Flux, Recraft, Ideogram, GPT-Image, Google Imagen, ByteDance Seed, Nano Banana) in one panel.",
        blocks: [
          { kind: "h", text: "Controls available before generating" },
          {
            kind: "ul",
            items: [
              "Model — see MC cost per image before sending.",
              "Aspect ratio — 1:1, 4:5, 9:16, 16:9, 21:9 and custom.",
              "Resolution — up to 4K on Elite+.",
              "Quality / steps / guidance — fine-tune on advanced models.",
              "Style presets — photoreal, cinematic, anime, 3D, sticker, line-art, watercolor and more.",
              "Negative prompt — what to AVOID (‘no blur’, ‘no watermark’).",
              "Seed — pin a seed for reproducible results.",
              "Reference images — drag any image to anchor character, style or composition.",
            ],
          },
          { kind: "h", text: "Edit tools (after generation)" },
          {
            kind: "ul",
            items: [
              "Inpaint — repaint a masked area.",
              "Outpaint — extend the canvas in any direction.",
              "Upscale — 2×, 4×, 8× super-resolution.",
              "Background remove / replace.",
              "Magic erase — remove objects with one tap.",
              "Style transfer — repaint the image in a new style.",
              "Face swap — between two reference faces.",
              "Variations — generate 4 close cousins of an image you like.",
              "All assets stored in your private library and reusable as references.",
            ],
          },
        ],
      },
      {
        id: "agents-video",
        title: "Videos & Cinema mode",
        icon: Video,
        accent: BLUSH,
        intro:
          "Generate cinematic clips with Sora, Veo, Kling, Pixverse, Runway, Luma, Hailuo and Seedance. Optional start/end frame, motion control and audio.",
        blocks: [
          {
            kind: "ul",
            items: [
              "Text-to-video and image-to-video both supported.",
              "Lip-sync mode: portrait + audio → talking video.",
              "Start frame + end frame: pin the first and last image for clean motion.",
              "Camera motion controls (pan, zoom, orbit) where the model supports it.",
              "Duration: from 4s to 30s per clip; chain in Cinema mode for longer films.",
              "Cinema mode — give a script or storyboard and Megsy stitches multi-scene films with consistent characters.",
              "Audio — generate music & SFX layers in @music; mix in the editor.",
              "Exports — MP4, MOV, WebM, up to 4K on Elite+.",
            ],
          },
        ],
      },
      {
        id: "agents-research",
        title: "Deep Research",
        icon: Microscope,
        accent: ACTION,
        intro:
          "Multi-source web research that returns a structured report with citations, charts and a downloadable PDF.",
        blocks: [
          {
            kind: "ul",
            items: [
              "Depth slider — quick (~30 sources), standard (~80), deep (~200).",
              "Cross-checks claims and flags contradictions in the report.",
              "Generates charts, tables and an executive summary.",
              "Every claim is footnoted with the exact source URL.",
              "Downloadable as PDF, DOCX or shareable web link.",
              "Can be re-run on a schedule via Operator for live competitive intel.",
            ],
          },
        ],
      },
      {
        id: "agents-slides",
        title: "Slides",
        icon: Presentation,
        accent: MINT,
        intro:
          "Generates a full editable presentation from a prompt. Pick a theme, regenerate any slide, edit text inline, export to PPTX or share a live link.",
        blocks: [
          {
            kind: "ul",
            items: [
              "Dozens of designer themes — corporate, editorial, playful, dark, minimal, pitch-deck.",
              "AI image fill per slide — Megsy picks or generates the right image.",
              "Speaker notes generated automatically.",
              "Inline editing on any text element; re-prompt any single slide without affecting the rest.",
              "Charts (bar, line, pie, area) generated from data you paste or attach.",
              "Export to .pptx (perfect PowerPoint fidelity), PDF, or share a live web link with presenter mode.",
              "Custom branding — drop a logo + 2 colors and the whole deck restyles.",
            ],
          },
        ],
      },
      {
        id: "agents-docs",
        title: "Docs (long-form writer)",
        icon: ScrollText,
        accent: BLUSH,
        intro:
          "Long-form document writer — proposals, contracts, essays, manuals, resumes, business plans. Export to DOCX, PDF or Google Docs.",
        blocks: [
          {
            kind: "ul",
            items: [
              "Live A4 preview as you chat.",
              "Tone & length controls (concise, balanced, exhaustive).",
              "Insert images, tables and charts inline.",
              "Templates: resume, cover letter, NDA, MSA, proposal, brief, research memo, business plan, contract, white paper.",
              "Track changes — every edit you make is versioned and revertable.",
              "Multi-language — write in one language, export translated copies in one click.",
            ],
          },
        ],
      },
      {
        id: "agents-learning",
        title: "Learning",
        icon: GraduationCap,
        accent: ACTION,
        intro:
          "Adaptive tutor that explains, quizzes, summarises and builds personalised study plans from any source (URL, PDF, video, photo of a textbook).",
        blocks: [
          {
            kind: "ul",
            items: [
              "‘Explain like I’m 5/15/expert’ toggle on every answer.",
              "Spaced-repetition flashcards generated from any source.",
              "Quizzes with instant feedback and explanations.",
              "Personalised study plans with deadlines and weekly check-ins.",
              "Pomodoro timer card with focus music.",
              "Subject library: math, physics, chemistry, biology, history, languages, coding, finance.",
            ],
          },
        ],
      },
      {
        id: "agents-operator",
        title: "Operator — autonomous agents (Megsy OS)",
        icon: Workflow,
        accent: MINT,
        intro:
          "Hand off multi-step browser & API tasks. Operator opens a virtual browser, logs in (with your approval), fills forms, scrapes data, and reports back. Pro+ only.",
        blocks: [
          {
            kind: "ul",
            items: [
              "Pre-built agents: research, lead-gen, monitoring, social posting, price tracker, inbox triage.",
              "Custom agents — describe the goal in plain English at /settings/operator/agents.",
              "Schedule — one-off, hourly, daily, weekly, or webhook-triggered.",
              "Approvals — you can require a manual ‘OK’ before any destructive action (sending an email, making a purchase).",
              "Full audit log of every action — /settings/operator/audit. Replay any step.",
              "Outputs land in chat or get emailed / Slack-pinged.",
              "Concurrency — run many agents in parallel; quota set by your plan.",
            ],
          },
        ],
      },
      {
        id: "agents-code",
        title: "Code",
        icon: Code2,
        accent: BLUSH,
        intro:
          "Write, debug and refactor code in any language with full repo-level context. Pair with Megsy Builder to ship full apps.",
        blocks: [
          {
            kind: "ul",
            items: [
              "Upload a folder or connect a GitHub repo — Megsy indexes it.",
              "Inline diff suggestions you can apply or reject.",
              "Run code in a sandbox (Python, Node, Bash) and get the output back.",
              "Generate unit tests, fixtures and CI configs.",
              "Push commits directly to GitHub from chat.",
            ],
          },
        ],
      },
      {
        id: "agents-music",
        title: "Music & audio",
        icon: Music,
        accent: ACTION,
        intro: "Generate songs, jingles, voiceovers and background scores from a prompt.",
        blocks: [
          {
            kind: "ul",
            items: [
              "Mood, tempo, genre, instruments and length controls.",
              "Lyrics generation in any language — or paste your own.",
              "Vocal style controls (male/female, soft, raspy, operatic).",
              "Export WAV / MP3 — stems available on Business+.",
              "Voice cloning (5 MC) for narration.",
            ],
          },
        ],
      },
      {
        id: "agents-skills",
        title: "Skills — your custom prompts as launchable commands",
        icon: Wand2,
        accent: MINT,
        intro:
          "Package your favourite prompts as reusable Skills with a name, icon, slash trigger and variables. Share with your workspace or keep them private.",
        blocks: [
          {
            kind: "ul",
            items: [
              "Build a Skill from any great prompt — Settings → Skills → New.",
              "Add variables — Megsy asks you to fill them in before running.",
              "Trigger from the composer with `/skillname` or from the Skills launcher.",
              "Share with your workspace — everyone gets the Skill automatically.",
              "Versioning — every edit is kept; roll back any time.",
            ],
          },
          { kind: "link", href: "/settings/skills", label: "Manage skills →" },
        ],
      },
    ],
  },

  /* ─────────────────────────── Workspaces & sharing ─────────────────────────── */
  {
    id: "workspace",
    label: "Workspaces, sharing & integrations",
    sections: [
      {
        id: "workspaces",
        title: "Workspaces & teams",
        icon: Users,
        accent: ACTION,
        intro:
          "A workspace is a shared space with pooled MC, shared chats, shared assets, shared skills and a shared brand memory. Business plan and above.",
        blocks: [
          { kind: "h", text: "Roles" },
          {
            kind: "kv",
            rows: [
              { k: "Owner", v: "Billing, deleting the workspace, all settings." },
              { k: "Admin", v: "Manage members, settings, integrations, skills." },
              { k: "Member", v: "Use everything, create chats, run agents." },
              { k: "Viewer", v: "Read-only access to shared chats and assets." },
            ],
          },
          { kind: "h", text: "Day-to-day" },
          {
            kind: "ul",
            items: [
              "Invite by email or shareable link from /workspaces/:id → Members.",
              "Switch active workspace from the account switcher in the sidebar (bottom-left).",
              "Pooled MC — everyone draws from one balance; the dashboard shows who used what.",
              "Workspace-wide memory keeps your team brand voice consistent (e.g. tone, banned words).",
              "Shared Skills — push prompts to every teammate at once.",
              "Tasks board per workspace — /workspaces/:id/tasks. Kanban with assignees, due dates and AI summaries.",
              "Audit log — every member action, exportable on Enterprise.",
            ],
          },
          { kind: "link", href: "/workspaces", label: "Open workspaces →" },
        ],
      },
      {
        id: "sharing",
        title: "Sharing & collaboration",
        icon: Share2,
        accent: BLUSH,
        blocks: [
          {
            kind: "ul",
            items: [
              "Share any chat as a read-only public link — /share/:id. Revocable any time.",
              "Invite a person to a chat — they can reply alongside you in real-time.",
              "Slides, Docs, research reports and websites all have their own share links with view-only or comment-only modes.",
              "Export anything to PDF, DOCX, PPTX, MP4, MP3, WAV, ZIP or JSON.",
              "Embed any answer or media via an `<iframe>` snippet (settings → Privacy must allow embeds).",
            ],
          },
        ],
      },
      {
        id: "integrations",
        title: "Integrations (1,000+ apps via standard connectors)",
        icon: Link2,
        accent: MINT,
        intro:
          "Connect Megsy to your stack from /settings/integrations — Gmail, Google Drive, Notion, Slack, GitHub, Linear, Jira, HubSpot, Salesforce, Stripe, Shopify, Telegram, Zapier, Pipedream and 1,000+ apps via standard connectors. API keys available on Business+.",
        blocks: [
          { kind: "h", text: "Most-used connections" },
          {
            kind: "kv",
            rows: [
              { k: "Email", v: "Gmail, Outlook — read, draft, send, schedule, summarise inboxes." },
              {
                k: "Chat",
                v: "Slack, Discord, Microsoft Teams, Telegram, Zoom — read channels, post, summarise meetings.",
              },
              {
                k: "Knowledge",
                v: "Notion, Google Docs, Google Drive, Dropbox — read & write pages, files, folders.",
              },
              {
                k: "Project",
                v: "Trello, Asana, ClickUp, Linear, Jira — create, update, close tickets.",
              },
              { k: "Code", v: "GitHub, GitLab — open PRs, review code, comment." },
              {
                k: "Social",
                v: "LinkedIn, X / Twitter, Instagram, Facebook, YouTube — post, schedule, analyse.",
              },
              {
                k: "Sales / commerce",
                v: "HubSpot, Salesforce, Stripe, Shopify — read CRM, run reports, manage products.",
              },
              { k: "Data", v: "Airtable, Google Sheets — read, write, append rows." },
              { k: "Calendar", v: "Google Calendar — read, create, move events." },
            ],
          },
          { kind: "h", text: "How a connection works" },
          {
            kind: "ol",
            items: [
              "Open /settings/integrations and tap the app.",
              "You’re sent to that app’s OAuth screen. Approve the requested scopes.",
              "You return to Megsy and the connection appears as ‘Active’.",
              "Use it in chat — ‘Summarise unread Slack messages in #marketing’ — Megsy will call the connector with your permission.",
              "Revoke any time from the same page — the OAuth token is destroyed.",
            ],
          },
        ],
      },
      {
        id: "telegram",
        title: "Telegram bot (optional)",
        icon: Bot,
        accent: ACTION,
        intro:
          "Connect Megsy to Telegram from Settings → Integrations → Telegram. The bot is fully optional and runs forever once enabled — no maintenance required.",
        blocks: [
          {
            kind: "ul",
            items: [
              "Get the auto-published daily blog summaries pushed to your chat.",
              "Run quick tasks from anywhere: ‘/ask’, ‘/image’, ‘/research’, ‘/translate’.",
              "Receive job-done pings when a long Operator run or video finishes.",
              "Chat with Megsy in any language — the same auto-mirror dialect rules apply.",
              "Disconnect any time from the same settings page.",
            ],
          },
        ],
      },
      {
        id: "api",
        title: "REST API & webhooks",
        icon: Code2,
        accent: BLUSH,
        intro:
          "Business and Enterprise plans expose REST endpoints for chat, image, video, research and Operator. Generate keys in /settings (Developers section). Rate limits scale with your MC pool.",
        blocks: [
          {
            kind: "code",
            text: `curl https://api.megsyai.com/v1/chat/completions \\
  -H "Authorization: Bearer $MEGSY_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"model":"megsy-ai","messages":[{"role":"user","content":"Hi!"}]}'`,
          },
          {
            kind: "ul",
            items: [
              "OpenAI-compatible schema — drop-in replacement for many SDKs.",
              "Streaming responses (SSE).",
              "Webhooks for long jobs — image, video, Operator, Deep Research.",
              "Per-key MC budgets and IP allow-lists on Enterprise.",
            ],
          },
        ],
      },
    ],
  },

  /* ─────────────────────────── Personalization ─────────────────────────── */
  {
    id: "personalize",
    label: "Personalization",
    sections: [
      {
        id: "memory",
        title: "Long-term memory",
        icon: Brain,
        accent: ACTION,
        blocks: [
          {
            kind: "p",
            text: "Megsy remembers important facts about you across chats — your name, role, projects, preferences, writing style, banned topics. New memories are formed automatically when something is clearly worth remembering, and you can also add facts manually.",
          },
          {
            kind: "ul",
            items: [
              "Review every saved memory at /settings/memory.",
              "Edit or delete any individual fact — changes apply immediately to every future chat.",
              "Pause memory globally with one toggle (Privacy mode).",
              "Workspace memory is separate from personal memory and is shared across teammates.",
              "Memories are encrypted at rest and never used to train any third-party model.",
            ],
          },
        ],
      },
      {
        id: "personalization",
        title: "AI personalization — how Megsy talks to you",
        icon: SettingsIcon,
        accent: MINT,
        intro:
          "/settings/customization lets you shape every reply without re-typing instructions in each chat.",
        blocks: [
          {
            kind: "ul",
            items: [
              "Tone — friendly, professional, witty, concise, formal, casual.",
              "Language preference — even when auto-detect is on you can pin a default.",
              "Expertise level — beginner / intermediate / expert (changes vocabulary and depth).",
              "Format preference — bullets, paragraphs, tables, code blocks first.",
              "Length preference — short, medium, exhaustive.",
              "Persona — give Megsy a name, role and signature style if you want.",
              "Banned words & topics — hard guardrails Megsy will never violate in your chats.",
              "Always-on system prompt — appended to every chat invisibly.",
            ],
          },
        ],
      },
      {
        id: "theme",
        title: "Theme & customization (accent colors, bubbles, motion)",
        icon: Palette,
        accent: BLUSH,
        intro:
          "Megsy ships with a curated dark theme tuned for long sessions — the only mode we support. From /settings/customization you control the visual identity inside it.",
        blocks: [
          {
            kind: "ul",
            items: [
              "18 premium accent colors — recolors your message bubbles, the send button, focused inputs and chip highlights.",
              "Wallpaper presets for the chat canvas (subtle gradients, dots, grid, aurora, noise).",
              "Message bubble shapes — rounded, squared, bubble-tail, minimal.",
              "Avatar shape — circle, soft square, Megsy star.",
              "Interface density — compact, comfortable, spacious.",
              "Text size — small, medium, large, extra-large with live preview.",
              "Animation level — reduced motion, normal, playful (auto-respects OS ‘reduce motion’ setting).",
              "Glow / shadow style — soft, sharp, neon.",
              "Live preview — a mini fake chat updates as you change every option.",
              "Export / import theme — copy your full setup as a shareable link or JSON.",
              "Custom name, avatar and pronouns from /settings/profile.",
            ],
          },
        ],
      },
      {
        id: "language",
        title: "Language & localization",
        icon: Languages,
        accent: ACTION,
        intro:
          "Megsy auto-mirrors the language AND dialect of your last message. Egyptian Arabic stays Egyptian. MSA stays MSA. French stays French. It never switches on you and never mixes.",
        blocks: [
          {
            kind: "ul",
            items: [
              "Force the UI language from /settings/language if you prefer a fixed one.",
              "Supported: English, Arabic (incl. Egyptian, Gulf, Levantine, Maghrebi dialects), French, Spanish, German, Portuguese, Italian, Turkish, Russian, Polish, Dutch, Hindi, Urdu, Bengali, Chinese (Simplified & Traditional), Japanese, Korean, Indonesian, Vietnamese, Thai, Hebrew, Greek, Czech, Romanian, Hungarian, Ukrainian and more.",
              "Right-to-left layouts (Arabic, Hebrew, Urdu, Persian) are fully supported.",
              "All blog articles auto-translate into every supported language.",
              "Voice mode follows the same auto-mirror rule.",
            ],
          },
        ],
      },
      {
        id: "notifications",
        title: "Notifications",
        icon: Bell,
        accent: MINT,
        intro:
          "/settings/notifications controls every ping. Per-channel and per-event — nothing is forced on you.",
        blocks: [
          {
            kind: "ul",
            items: [
              "Channels — push (browser & PWA), email, in-app badge, Telegram (if connected).",
              "Events — long jobs finished, credits low, mentions in shared chats, weekly summary, security alerts, new product features, blog digests.",
              "Quiet hours — silence everything between fixed times in your timezone.",
              "Per-workspace overrides — separate settings for personal vs work.",
              "Test button — fire a sample notification on every channel.",
            ],
          },
        ],
      },
      {
        id: "privacy",
        title: "Privacy controls",
        icon: Lock,
        accent: BLUSH,
        intro:
          "/settings/privacy is the single place to control what Megsy stores, shows and shares.",
        blocks: [
          {
            kind: "ul",
            items: [
              "Pause memory — Megsy will not learn new facts about you.",
              "Pause history — chats won’t be saved (good for one-off sensitive work).",
              "Training opt-out — your data is never used to train any model regardless, but you can also opt out of anonymous product analytics.",
              "Download all my data — ZIP of every chat, file, setting (GDPR Art. 15).",
              "Delete account — permanent erasure (GDPR Art. 17). Completes within 30 days.",
              "Sub-processor list & DPA at /legal/subprocessors and /legal/dpa.",
            ],
          },
        ],
      },
    ],
  },

  /* ─────────────────────────── PWA ─────────────────────────── */
  {
    id: "pwa",
    label: "Install as an app (PWA)",
    sections: [
      {
        id: "pwa-ios",
        title: "Install on iPhone & iPad",
        icon: Apple,
        accent: ACTION,
        intro: "Megsy installs as a full-screen iOS app via Safari’s Add to Home Screen.",
        blocks: [
          {
            kind: "ol",
            items: [
              "Open megsyai.com in Safari (iOS only allows PWA installs from Safari).",
              "Tap the Share button at the bottom (square with an arrow pointing up).",
              "Scroll the share sheet down and tap ‘Add to Home Screen’.",
              "Confirm the name ‘Megsy AI’ and tap Add.",
              "Open it — it runs full-screen with its own animated splash screen, exactly like a native app.",
            ],
          },
          {
            kind: "image",
            src: pwaIos,
            alt: "iPhone Safari share sheet with Add to Home Screen highlighted",
            caption: "iOS — Safari → Share → Add to Home Screen",
          },
          {
            kind: "note",
            text: "On iPadOS the Share button lives in the top toolbar — same flow. The first launch shows a Megsy splash with two bouncing dots.",
          },
        ],
      },
      {
        id: "pwa-android",
        title: "Install on Android",
        icon: Smartphone,
        accent: MINT,
        intro: "On Android, Chrome (and most Chromium browsers) offer one-tap install.",
        blocks: [
          {
            kind: "ol",
            items: [
              "Open megsyai.com in Chrome.",
              "Tap the three-dot menu in the top-right.",
              "Tap ‘Install app’ (or ‘Add to Home screen’).",
              "Confirm. Megsy is added to your home screen and your app drawer.",
              "Optional: long-press the icon → Add to Home for one-tap launch.",
            ],
          },
          {
            kind: "image",
            src: pwaAndroid,
            alt: "Android Chrome menu showing Install app option",
            caption: "Android — Chrome → ⋮ → Install app",
          },
          {
            kind: "note",
            text: "Samsung Internet, Edge, Brave and Firefox all support install — wording is similar.",
          },
        ],
      },
      {
        id: "pwa-desktop",
        title: "Install on Mac, Windows & Linux",
        icon: Monitor,
        accent: BLUSH,
        intro:
          "Megsy installs as a real desktop app on macOS, Windows and Linux via Chrome, Edge, Brave or Safari.",
        blocks: [
          {
            kind: "ol",
            items: [
              "Open megsyai.com in Chrome, Edge or Brave.",
              "Look for the install icon on the right side of the address bar (small monitor with a down arrow).",
              "Click it and confirm ‘Install’.",
              "Megsy opens in its own window — pin it to your Dock (Mac), Taskbar (Windows) or app menu (Linux).",
              "It launches with its own icon and runs without browser chrome.",
            ],
          },
          {
            kind: "image",
            src: pwaDesktop,
            alt: "Desktop Chrome address bar with Install Megsy AI icon highlighted",
            caption: "Desktop — click the install icon in the address bar",
          },
          {
            kind: "note",
            text: "Safari on macOS Sonoma+: File → Add to Dock also installs Megsy as a standalone app.",
          },
        ],
      },
      {
        id: "pwa-features",
        title: "What you get after installing",
        icon: CheckCircle2,
        accent: ACTION,
        blocks: [
          {
            kind: "ul",
            items: [
              "Full-screen experience, no browser tabs or address bar.",
              "Dedicated app icon and animated Megsy splash on launch.",
              "Faster start-up — assets are cached locally.",
              "Push notifications for finished jobs, mentions, new product updates.",
              "Works on poor connections — recent chats stay readable offline.",
              "Auto-updates silently in the background — no app store needed.",
            ],
          },
          {
            kind: "note",
            text: "Installed PWA stuck on an old build? Close & relaunch, or visit /?sw=off once to reset the service worker.",
          },
        ],
      },
    ],
  },

  /* ─────────────────────────── Blog & content ─────────────────────────── */
  {
    id: "blog-system",
    label: "Blog, comparisons & content",
    sections: [
      {
        id: "blog",
        title: "Auto-publishing blog (3 articles/day, every language)",
        icon: BookOpen,
        accent: ACTION,
        blocks: [
          {
            kind: "p",
            text: "/blog publishes 3 fresh articles every single day — fully autonomous, no human in the loop required. Topics rotate across product news, comparisons, deep dives, tutorials, AI literacy and Megsy-specific how-tos. Each article is translated into every supported language at publish time.",
          },
          {
            kind: "ul",
            items: [
              "Daily rotation: one explainer, one comparison/vs piece, one how-to.",
              "All translations live at /blog with locale routing.",
              "Articles power the auto-updating sitemap (/sitemap-blog.xml).",
              "Optional digest can be pushed via Telegram or email (Notifications page).",
            ],
          },
        ],
      },
      {
        id: "comparisons",
        title: "Comparisons (Megsy vs …)",
        icon: LayoutGrid,
        accent: MINT,
        blocks: [
          {
            kind: "p",
            text: "Head-to-head comparisons at /vs/<competitor> — pricing, features, models, quotas, side-by-side outputs and an honest verdict. Updated automatically as competitor offerings change so the data never goes stale.",
          },
        ],
      },
      {
        id: "service-landings",
        title: "Service & feature landing pages",
        icon: Sparkles,
        accent: BLUSH,
        blocks: [
          {
            kind: "p",
            text: "Dedicated SEO landings for every capability: AI image generator, AI video generator, AI website builder, AI slides, AI resume builder, AI faceswap, AI cover letter, AI translator, AI lip-sync, AI music and many more. Each has live demos, CTAs and links back to the right mode inside /chat.",
          },
        ],
      },
    ],
  },

  /* ─────────────────────────── Enterprise & security ─────────────────────────── */
  {
    id: "enterprise",
    label: "Enterprise, security & trust",
    sections: [
      {
        id: "enterprise-overview",
        title: "Enterprise plan",
        icon: Building2,
        accent: ACTION,
        intro: "Custom plan for teams that need governance, scale and a contract.",
        blocks: [
          {
            kind: "ul",
            items: [
              "Custom MC pools and seat counts.",
              "SSO via SAML or OIDC (Okta, Azure AD, Google Workspace, Auth0).",
              "SCIM provisioning — automatic onboarding and off-boarding.",
              "DPA, MSA, custom contracts, invoicing in any currency.",
              "Region pinning — data processed only in your chosen region.",
              "Private model routing.",
              "Audit log export to your SIEM (S3 / Splunk / Datadog).",
              "Dedicated success manager & priority SLA.",
              "Penetration test reports and SOC 2 evidence on request.",
            ],
          },
          { kind: "link", href: "/enterprise", label: "Talk to sales →" },
        ],
      },
      {
        id: "security",
        title: "Security posture",
        icon: ShieldCheck,
        accent: MINT,
        blocks: [
          {
            kind: "ul",
            items: [
              "Data encrypted in transit (TLS 1.3) and at rest (AES-256).",
              "Row-level security enforced on every user-owned database row — your data is impossible to read across accounts.",
              "Hardened auth: 2FA (TOTP), session expiry, device alerts.",
              "Privacy-first: prompts and outputs never train third-party models.",
              "Sub-processor list at /legal/subprocessors.",
              "DPA at /legal/dpa.",
              "Vulnerability disclosure: /.well-known/security.txt.",
              "Status page: /settings/system-status.",
              "Trust center: /trust.",
            ],
          },
        ],
      },
    ],
  },

  /* ─────────────────────────── Legal & policies ─────────────────────────── */
  {
    id: "legal",
    label: "Legal & policies",
    sections: [
      {
        id: "legal-index",
        title: "Every legal page",
        icon: ScrollText,
        accent: ACTION,
        intro:
          "These are binding for every Megsy user. Read them once — we’ll alert you in-app any time a material change is made.",
        blocks: [
          {
            kind: "kv",
            rows: [
              { k: "/terms", v: "Terms of service — your rights and ours." },
              { k: "/privacy", v: "Privacy policy — what we collect, store and never share." },
              {
                k: "/cookies",
                v: "Cookie policy — analytics & preference cookies only, no ad cookies.",
              },
              { k: "/refund", v: "Refund policy — windows and process." },
              { k: "/acceptable-use", v: "Acceptable use — what you may and may not do on Megsy." },
              { k: "/policies/content", v: "Content policy — what may and may not be generated." },
              {
                k: "/legal/ai-disclaimer",
                v: "AI disclaimer — limitations and user responsibility.",
              },
              { k: "/legal/dmca", v: "DMCA & copyright takedown process." },
              { k: "/legal/dpa", v: "Data Processing Addendum (GDPR / UK GDPR)." },
              { k: "/legal/affiliate", v: "Affiliate program terms." },
              { k: "/legal/moderation", v: "Moderation framework and appeals." },
              {
                k: "/legal/age",
                v: "Age policy (13+ with guardian consent in the EU, 16+ elsewhere where required).",
              },
              {
                k: "/legal/subprocessors",
                v: "Sub-processor list — every vendor we share data with.",
              },
              { k: "/legal/accessibility", v: "Accessibility statement — WCAG 2.2 AA target." },
              {
                k: "/legal/compliance",
                v: "Regional compliance — GDPR, CCPA, UK GDPR, KSA PDPL, UAE PDPL.",
              },
            ],
          },
        ],
      },
    ],
  },

  /* ─────────────────────────── Advanced ─────────────────────────── */
  {
    id: "advanced",
    label: "Advanced & power-user",
    sections: [
      {
        id: "shortcuts",
        title: "Keyboard shortcuts",
        icon: Keyboard,
        accent: BLUSH,
        blocks: [
          {
            kind: "kv",
            rows: [
              { k: "Enter", v: "Send message" },
              { k: "Shift + Enter", v: "New line in the composer" },
              { k: "Cmd / Ctrl + K", v: "Open command bar / chat search" },
              { k: "Cmd / Ctrl + /", v: "Focus composer search filters" },
              { k: "Cmd / Ctrl + N", v: "New chat" },
              { k: "Cmd / Ctrl + B", v: "Toggle sidebar" },
              { k: "Cmd / Ctrl + Shift + L", v: "Open model picker" },
              { k: "Cmd / Ctrl + Shift + M", v: "Toggle voice mode" },
              { k: "Cmd / Ctrl + Shift + .", v: "Toggle web search for next message" },
              { k: "/", v: "Open Skills launcher in the composer" },
              { k: "@", v: "Mention an agent (e.g. @images, @videos)" },
              { k: "Esc", v: "Close any modal / popover" },
              { k: "↑ in empty composer", v: "Edit your last message" },
              { k: "Cmd / Ctrl + S", v: "Save current artifact (slide, doc, image) to library" },
            ],
          },
        ],
      },
      {
        id: "files-power",
        title: "Power tips for files & attachments",
        icon: Upload,
        accent: ACTION,
        blocks: [
          {
            kind: "ul",
            items: [
              "Paste a screenshot directly into the composer — fastest way to ask about something visual.",
              "Drop a folder (Chrome / Edge) — Megsy ingests every supported file inside.",
              "Add a URL — Megsy fetches the page (or PDF behind the link) and treats it as an attachment.",
              "ZIP an entire repo and drop it — Megsy will index code and answer cross-file questions.",
              "Combine: ‘read meeting.mp4, then summarise into one Slide deck’ runs end-to-end in a single message.",
            ],
          },
        ],
      },
      {
        id: "automations",
        title: "Automations & scheduled runs",
        icon: RefreshCw,
        accent: MINT,
        blocks: [
          {
            kind: "ul",
            items: [
              "Any prompt can be scheduled via Operator → New Agent.",
              "Triggers: time (cron-style), webhook, new email, new Slack message, calendar event, Stripe event.",
              "Actions: send email, post to Slack, write to Notion / Airtable / Sheets, push to GitHub, run another agent.",
              "Variables — pass data from one step to another.",
              "Versioned — every edit kept, replay any past run.",
              "Failure handling — retries, fallback steps, ping-on-error.",
            ],
          },
        ],
      },
      {
        id: "troubleshoot",
        title: "Troubleshooting playbook",
        icon: HelpCircle,
        accent: BLUSH,
        intro: "The fastest fix for each common problem.",
        blocks: [
          {
            kind: "ul",
            items: [
              "Page won’t load — hard refresh (Cmd/Ctrl + Shift + R) and try Incognito.",
              "Installed PWA stuck on an old version — close & relaunch, or visit /?sw=off once to reset the service worker.",
              "Credits look wrong — open /settings/billing → Usage; refresh after 30 seconds. Failed jobs are auto-refunded and appear as a green line.",
              "Generation failed — most failures auto-refund MC. Try a different model from the picker; check /settings/system-status for incidents.",
              "Can’t sign in / Google login fails — clear cookies for megsyai.com, try Incognito, or reset password at /auth.",
              "2FA lost — contact support; recovery requires identity verification.",
              "Didn’t receive credits / plan after payment — check /settings/billing → Invoices first; if missing after 10 minutes, contact support with the order email + time.",
              "Workspace invite not arriving — resend from /workspaces/:id; check spam; ensure the invitee email matches their Megsy account.",
              "Telegram bot silent — re-link from /settings/integrations → Telegram → Reconnect.",
              "Image / video quality poor — switch model in the picker; add a reference image; use a stronger, more specific prompt.",
              "Voice mode not hearing me — check mic permission in browser site settings; on iOS, voice requires Safari.",
              "Still stuck? Use the AI support chat (always live) or email support@megsyai.com.",
            ],
          },
          { kind: "link", href: "/support", label: "Open AI support (24/7) →" },
          { kind: "link", href: "/contact", label: "Contact a human →" },
        ],
      },
      {
        id: "status",
        title: "System status",
        icon: BadgeCheck,
        accent: ACTION,
        blocks: [
          {
            kind: "p",
            text: "Live status of every Megsy service — chat, image, video, research, builder, voice, music, integrations, API — at /settings/system-status. Past incidents are kept for transparency, with root-cause notes.",
          },
        ],
      },
      {
        id: "shortcuts-mobile",
        title: "Mobile gestures",
        icon: Smartphone,
        accent: MINT,
        blocks: [
          {
            kind: "kv",
            rows: [
              { k: "Swipe right from left edge", v: "Open sidebar" },
              { k: "Swipe left on a chat row", v: "Reveal pin / archive / delete" },
              {
                k: "Long-press a message",
                v: "Open the actions sheet (copy, branch, regenerate, share)",
              },
              { k: "Pull down on a chat", v: "Refresh / sync" },
              { k: "Double-tap a message", v: "Quick-react with a thumbs up" },
              { k: "Pinch on an image / slide", v: "Zoom in fullscreen" },
            ],
          },
        ],
      },
    ],
  },

  /* ─────────────────────────── Hidden gems / global behaviours ─────────────────────────── */
  {
    id: "globals",
    label: "Global behaviours & hidden gems",
    sections: [
      {
        id: "url-tricks",
        title: "URL tricks (query parameters that change behaviour)",
        icon: Link2,
        accent: ACTION,
        intro: "Powerful query strings you can append to any megsyai.com URL.",
        blocks: [
          {
            kind: "kv",
            rows: [
              { k: "?theme=dark", v: "Force the dark theme for this session (default)." },
              {
                k: "?theme=light",
                v: "Temporary light-theme override; persisted to localStorage so it sticks.",
              },
              { k: "?theme=ocean", v: "Hidden ocean theme override." },
              { k: "?theme=sunset", v: "Hidden sunset theme override." },
              {
                k: "?sw=off",
                v: "Kill switch — unregisters the PWA service worker so a stuck install can fully refresh.",
              },
              {
                k: "?dodo_return=1",
                v: "Used by the Dodo Payments return flow — auto-redirects to /billing/success.",
              },
              {
                k: "?checkout_cancelled=1",
                v: "Used after a cancelled checkout — surfaces a friendly retry CTA.",
              },
            ],
          },
        ],
      },
      {
        id: "promo-banner",
        title: "Unlimited promo banner",
        icon: Sparkles,
        accent: MINT,
        blocks: [
          {
            kind: "ul",
            items: [
              "Top-of-page countdown showing days / hours / minutes / seconds remaining on the current promotion.",
              "Tapping the banner sends you to /pricing.",
              "Dismissible per session — closes for the rest of the browser session via sessionStorage.",
              "Visibility is controlled globally by the PromoBannerContext — pages can hide it on demand.",
              "Only shown while a promotion is active; disappears automatically when the timer expires.",
            ],
          },
        ],
      },
      {
        id: "onboarding",
        title: "Onboarding checklist (new users)",
        icon: CheckCircle2,
        accent: BLUSH,
        intro:
          "A floating, collapsible checklist that appears for brand-new accounts and ticks itself off as you explore.",
        blocks: [
          {
            kind: "ol",
            items: [
              "Send your first chat.",
              "Generate your first image.",
              "Create your first document or slide.",
              "Invite a friend (uses your referral link automatically).",
              "Activate a paid plan — uses the WELCOME50 promo code link for an extra discount.",
            ],
          },
          {
            kind: "note",
            text: "Progress is saved to localStorage — closes once every step is done. You won’t see it again.",
          },
        ],
      },
      {
        id: "system-extras",
        title: "Cookie consent · offline banner · ambient background · PWA splash",
        icon: Shield,
        accent: ACTION,
        blocks: [
          {
            kind: "ul",
            items: [
              "Cookie consent — GDPR banner appears on first visit. Choose ‘Accept all’ or ‘Essential only’ — your choice is remembered.",
              "Offline banner — Megsy detects loss of network connectivity and shows a banner; recent chats remain readable from cache.",
              "Ambient background — a subtle animated background renders behind every page; respects the OS ‘reduce motion’ setting automatically.",
              "PWA splash — when you launch the installed app, an animated Megsy splash with bouncing dots plays for the first frame.",
            ],
          },
        ],
      },
      {
        id: "auto-referral-claim",
        title: "Automatic referral attribution",
        icon: Gift,
        accent: MINT,
        blocks: [
          {
            kind: "p",
            text: "If you arrive via /r/:code or /ref/:code, your referral code is stored in localStorage. The moment you complete sign-up — even days later through the email-confirmation flow — Megsy automatically calls claim_referral_signup so your referrer gets credit. No manual ‘enter code’ step.",
          },
        ],
      },
      {
        id: "account-switch-cache",
        title: "Multi-account cache isolation",
        icon: Users,
        accent: BLUSH,
        blocks: [
          {
            kind: "p",
            text: "Switching accounts (/settings/switch) automatically wipes every megsy_cache_* localStorage key and the React Query cache. You never see another account’s chats or balances bleed through — even on the same device, same browser.",
          },
        ],
      },
    ],
  },

  /* ─────────────────────────── Page-by-page deep dive ─────────────────────────── */
  {
    id: "pages-deep",
    label: "Every page — deep dive",
    sections: [
      {
        id: "page-se",
        title: "/se — internal templates & resources library",
        icon: ListTree,
        accent: ACTION,
        blocks: [
          {
            kind: "p",
            text: "A curated, categorised resource library used by the team and power users. Browse by category: templates · components · assets · design · skills · landings · backgrounds. Add, edit and delete skill entries directly from the page.",
          },
        ],
      },
      {
        id: "page-egypt",
        title: "/egypt — regional showcase",
        icon: Globe2,
        accent: MINT,
        blocks: [
          {
            kind: "p",
            text: "A dedicated landing celebrating Egypt mega-projects (New Administrative Capital, Suez Canal expansion, national road network and more). Branded marketing/PR page with localised content.",
          },
        ],
      },
      {
        id: "page-research-preview",
        title: "/research/preview — Deep Research reports",
        icon: Microscope,
        accent: BLUSH,
        intro: "Every Deep Research run produces a full standalone web article.",
        blocks: [
          {
            kind: "kv",
            rows: [
              { k: "/research/preview/new", v: "Start a brand-new report from a prompt." },
              { k: "/research/preview/:id", v: "View one of your own reports (signed-in only)." },
              { k: "/research/share/:token", v: "Public, read-only share link for a report." },
            ],
          },
          { kind: "h", text: "Reading experience" },
          {
            kind: "ul",
            items: [
              "Auto-generated Table of Contents pinned to the side.",
              "Scroll-progress bar across the top.",
              "Inline numbered citations with the source URL on hover.",
              "Full RTL support for Arabic, Hebrew and Farsi.",
              "Export to PDF or push directly to Google Drive.",
              "Share dialog generates a public-token URL you can revoke anytime.",
            ],
          },
        ],
      },
      {
        id: "page-oauth",
        title: "/oauth/authorize — Megsy as an OAuth provider",
        icon: Shield,
        accent: ACTION,
        blocks: [
          {
            kind: "p",
            text: "Third-party apps can request access to your Megsy account. The /oauth/authorize page shows the requesting app’s name, logo and the exact scopes it wants. You choose Approve or Deny. Approved scopes are revocable at any time from /settings/security.",
          },
        ],
      },
      {
        id: "page-tombstones",
        title: "Legacy routes & permanent redirects",
        icon: RefreshCw,
        accent: MINT,
        intro:
          "Older URLs still work — they 301-redirect to the current home so old bookmarks never break.",
        blocks: [
          {
            kind: "kv",
            rows: [
              {
                k: "/media · /gallery · /preview/:type · /template/:id",
                v: "→ /  (legacy media studio routes folded into chat)",
              },
              {
                k: "/images/studio · /videos · /videos/studio",
                v: "→ /  (image & video studios now live inside the composer)",
              },
              {
                k: "/cinema · /cinema/studio · /cinema/start-end-frame",
                v: "→ /  (Cinema mode is now an option inside @videos)",
              },
              { k: "/tools/*", v: "→ /images/tools/*  (legacy tool URLs)" },
              { k: "/billing", v: "→ /settings/billing" },
              { k: "/referrals · /billing/referrals", v: "→ /settings/referrals" },
              { k: "/workspaces · /workspaces/:id", v: "→ /settings/workspaces" },
              {
                k: "/legal/acceptable-use · /legal/moderation",
                v: "→ /policies/content (merged content policy)",
              },
              {
                k: "/legal/subprocessors · /legal/accessibility · /legal/compliance",
                v: "→ /trust (merged trust center)",
              },
            ],
          },
        ],
      },
      {
        id: "page-locale-landings",
        title: "Multilingual SEO landings (25 locales)",
        icon: Languages,
        accent: BLUSH,
        intro:
          "Every service landing is published in 25 languages with the proper hreflang signals — Google serves the right one to the right user.",
        blocks: [
          {
            kind: "p",
            text: "Prefix the slug with a locale code: /ar, /es, /fr, /de, /pt, /it, /tr, /ru, /zh, /ja, /ko, /hi, /id, /nl, /sv, /cs, /ro, /el, /uk, /he, /fa, /vi, /th, /pl. RTL languages render with full right-to-left layout. Default English is served at the unprefixed path.",
          },
        ],
      },
      {
        id: "page-vs",
        title: "/vs/:slug — competitor comparisons",
        icon: LayoutGrid,
        accent: ACTION,
        blocks: [
          {
            kind: "p",
            text: "Each /vs page is a structured, honest comparison: side-by-side feature matrix, pricing breakdown, ‘best for’ lists, an honest note, and a verdict. Updated as competitor offerings change. See the live index in the auto-generated Comparisons section above.",
          },
        ],
      },
      {
        id: "page-share",
        title: "/share/:shareId — public read-only chats",
        icon: Share2,
        accent: MINT,
        blocks: [
          {
            kind: "p",
            text: "Any chat can be turned into a public share link from the chat ⋯ menu → ‘Share’. The /share URL renders the conversation without auth, read-only, with the Megsy chrome stripped. The owner can revoke the link any time — visitors then see a 404.",
          },
        ],
      },
    ],
  },

  /* ─────────────────────────── Settings — per page ─────────────────────────── */
  {
    id: "settings-deep",
    label: "Settings — every sub-page in detail",
    sections: [
      {
        id: "set-profile",
        title: "/settings/profile",
        icon: SettingsIcon,
        accent: ACTION,
        blocks: [
          {
            kind: "ul",
            items: [
              "Display name — shown on shared chats and workspace activity.",
              "Avatar upload — auto-cropped to a circle; saved to your private bucket.",
              "Quick-links: change email · change password · enable 2FA · delete account.",
            ],
          },
        ],
      },
      {
        id: "set-customization",
        title: "/settings/customization",
        icon: Palette,
        accent: MINT,
        blocks: [
          {
            kind: "ul",
            items: [
              "18 preset accent swatches — drives both the UI accent and the chat-bubble colour at once.",
              "Live preview — a mock chat updates as you pick a colour.",
              "Dark theme is enforced on load (the URL ?theme= override still works for the curious).",
            ],
          },
        ],
      },
      {
        id: "set-ai-personalization",
        title: "/settings/ai-personalization",
        icon: Brain,
        accent: BLUSH,
        intro:
          "Everything here is injected into every chat’s system prompt — no need to retype it each time.",
        blocks: [
          {
            kind: "ul",
            items: [
              "Name to call you (e.g. ‘Hala’, ‘boss’, ‘team’).",
              "Profession — anchors examples and tone (e.g. ‘doctor’, ‘designer’, ‘founder’).",
              "About-me bio — a free-text paragraph Megsy uses as context.",
              "Response language style — Auto · Casual · Formal · English only.",
              "Tone sliders — Formality and Verbosity.",
              "Preferred model tier — Lite · Pro · Max (default for new chats).",
            ],
          },
        ],
      },
      {
        id: "set-memory",
        title: "/settings/memory",
        icon: Database,
        accent: ACTION,
        blocks: [
          {
            kind: "ul",
            items: [
              "Every memory has a title, a summary and a scope (personal or workspace).",
              "Create a memory manually with the ‘+ Add memory’ button.",
              "Edit or delete any memory — changes apply to every future chat immediately.",
              "Pause memory globally to stop forming new memories.",
            ],
          },
        ],
      },
      {
        id: "set-skills",
        title: "/settings/skills",
        icon: Wand2,
        accent: MINT,
        intro: "Custom Skills are persona-based system-prompt overlays you can launch with `/`.",
        blocks: [
          { kind: "h", text: "Per-skill options" },
          {
            kind: "ul",
            items: [
              "Name, description and an icon.",
              "System prompt body — the heart of the skill.",
              "Trigger phrases — type any of these to instantly invoke the skill.",
              "Enabled tools — pick which agents (images, videos, research, code…) this skill may use.",
              "Preferred model — pin a specific model for runs of this skill.",
              "Toggle enable/disable without deleting.",
              "Import a skill from a JSON / Markdown file.",
              "‘AI-seed’ — describe what you want in one sentence and Megsy drafts the whole skill for you.",
            ],
          },
          {
            kind: "p",
            text: "The streamlined creation flow lives at /agents/skills/new with suggestion chips to get you started in one click.",
          },
        ],
      },
      {
        id: "set-operator",
        title: "/settings/operator — Megsy OS controls",
        icon: Workflow,
        accent: BLUSH,
        intro:
          "Megsy OS is the autonomous cloud-computer agent. Every safety lever lives on this page.",
        blocks: [
          { kind: "h", text: "Safety toggles" },
          {
            kind: "ul",
            items: [
              "Ask before sensitive actions (sending emails, making purchases, deleting data).",
              "Ask before anything (maximum paranoia — every step requires your tap).",
              "Allow free shell — let the agent run shell commands in its sandbox.",
              "Allow browser automation — let it open a virtual browser and fill forms.",
              "Allow dynamic agents — let it spawn sub-agents on the fly.",
            ],
          },
          { kind: "h", text: "Throttles" },
          {
            kind: "ul",
            items: [
              "Max parallel agents — slider 1 to 10.",
              "Budget cap — hard MC ceiling per run; Megsy stops automatically when reached.",
            ],
          },
          {
            kind: "kv",
            rows: [
              {
                k: "/settings/operator/agents",
                v: "Every dynamically created sub-agent — key, label, description, usage count. Delete one with a tap.",
              },
              {
                k: "/settings/operator/audit",
                v: "Last 200 audit entries — agent, action, payload, error, run ID, timestamp. Replay any run.",
              },
            ],
          },
        ],
      },
      {
        id: "set-language",
        title: "/settings/language",
        icon: Languages,
        accent: ACTION,
        blocks: [
          {
            kind: "p",
            text: "Pick the UI language from 25 BCP-47 options. Independent from Megsy’s auto-mirror of your chat language (which always follows your latest message).",
          },
        ],
      },
      {
        id: "set-notifications",
        title: "/settings/notifications",
        icon: Bell,
        accent: MINT,
        intro: "Granular email category toggles.",
        blocks: [
          {
            kind: "kv",
            rows: [
              { k: "Account", v: "Welcome flow & onboarding nudges." },
              { k: "Transactions & receipts", v: "Every payment, invoice and refund." },
              {
                k: "Security alerts",
                v: "Sign-ins from new devices, password changes, 2FA events.",
              },
              { k: "Product updates", v: "New models, new tools, new agents — opt out anytime." },
              {
                k: "Referral activity",
                v: "Signups attributed to you, commissions earned, payout status.",
              },
            ],
          },
        ],
      },
      {
        id: "set-integrations",
        title: "/settings/integrations",
        icon: Link2,
        accent: BLUSH,
        intro:
          "30 native connectors plus 1,000+ apps via Pipedream Connect. All free — no per-action MC charge for the connection itself.",
        blocks: [
          {
            kind: "p",
            text: "See the full list in the Agents catalog above (@integrations). New connections use the standard OAuth flow — Megsy never sees your password.",
          },
        ],
      },
      {
        id: "set-system-status",
        title: "/settings/system-status",
        icon: BadgeCheck,
        accent: ACTION,
        blocks: [
          {
            kind: "p",
            text: "Live, real-time indicator (Operational · Degraded · Outage) for every service: chat, image, video, research, builder, voice, music, integrations, API. Past incidents are kept with root-cause notes.",
          },
        ],
      },
      {
        id: "set-withdraw",
        title: "/settings/withdraw — referral cash-out",
        icon: Wallet,
        accent: MINT,
        blocks: [
          {
            kind: "ul",
            items: [
              `Minimum payout: $${MIN_PAYOUT}.`,
              "Maximum: 2 withdrawals per month per account.",
              "Add a payment method (PayPal, bank transfer or USDT) — first withdrawal requires admin verification.",
              "Status timeline: requested → reviewed → paid; you’re emailed at every step.",
            ],
          },
        ],
      },
    ],
  },

  /* ─────────────────────────── Workspaces — every tab ─────────────────────────── */
  {
    id: "workspaces-tabs",
    label: "Workspaces — every tab",
    sections: [
      {
        id: "ws-tabs",
        title: "Every tab inside /settings/workspaces/:id",
        icon: Users,
        accent: ACTION,
        intro:
          "A workspace bundles shared chats, assets, skills and a pooled MC balance behind role-based access. Each tab below is a dedicated page.",
        blocks: [
          {
            kind: "kv",
            rows: [
              {
                k: "Overview (index)",
                v: "At-a-glance dashboard: members online, MC remaining, recent activity, quick actions.",
              },
              {
                k: "General",
                v: "Workspace name, slug, description, time-zone, default language.",
              },
              {
                k: "Members",
                v: "List of members with role (Owner · Admin · Member · Viewer); promote, demote or remove.",
              },
              {
                k: "Invites",
                v: "Pending invitations + ‘Send invite’ by email or shareable link.",
              },
              {
                k: "Brand",
                v: "Workspace logo, brand colour and reusable brand assets — propagates into Slides/Docs exports.",
              },
              {
                k: "Security",
                v: "Workspace-level security policy: enforce 2FA, restrict sign-in to specific email domains, IP allow-lists (Enterprise).",
              },
              {
                k: "Billing",
                v: "Workspace plan and payment method; invoices for the whole team.",
              },
              { k: "Usage", v: "MC consumption per member, per tool, per day; export to CSV." },
              {
                k: "Notifications",
                v: "Workspace-level notification routing (digest emails, Slack/Telegram pings).",
              },
              {
                k: "Activity",
                v: "Full audit feed of every workspace event (joins, removes, billing changes, agent runs).",
              },
              {
                k: "Data",
                v: "Export everything as a ZIP (chats, files, settings) — GDPR-friendly.",
              },
              {
                k: "Danger",
                v: "Rename, transfer ownership, archive, or permanently delete the workspace.",
              },
              {
                k: "/workspaces/:id/tasks",
                v: "Standalone Kanban task board with assignees, due dates and AI summaries.",
              },
            ],
          },
        ],
      },
    ],
  },

  /* ─────────────────────────── Edge functions — what each does for users ─────────────────────────── */
  {
    id: "edge-functions",
    label: "Behind the scenes — every service",
    sections: [
      {
        id: "edge-fns",
        title: "What each backend service does for you",
        icon: Cpu,
        accent: ACTION,
        intro:
          "You never call these directly, but knowing what they do helps you understand exactly what Megsy is doing on your behalf.",
        blocks: [
          {
            kind: "kv",
            rows: [
              {
                k: "blog-daily-publish",
                v: "Cron at 06:00 UTC — picks up to 3 topics, generates and translates each, pings Google/Bing IndexNow. Fully autonomous.",
              },
              {
                k: "blog-generate",
                v: "Writes one ~2,000–2,800-word English article tuned for E-E-A-T with FAQ schema.",
              },
              {
                k: "blog-translate",
                v: "Translates each new article into 24 languages and groups them as a translation set with hreflang.",
              },
              {
                k: "chat-alibaba",
                v: "Primary chat router. Injects your AI Personalization preamble. Handles Deep Research planning.",
              },
              {
                k: "chat-slides-stream",
                v: "Streams slide generation as SSE phases (search → outline → content → images → finalize).",
              },
              {
                k: "deep-research-job",
                v: "Multi-agent pipeline: plan → your approval → search + extract + synthesize. Update or cancel anytime.",
              },
              {
                k: "docs-generate",
                v: "Streams long-form HTML for documents, reports and contracts. Asks clarifying questions when prompts are vague.",
              },
              {
                k: "generate-builder-schema",
                v: "Returns structured JSON for file builders (docs, resume, report, timeline…).",
              },
              {
                k: "github-push",
                v: "Pushes generated code/assets straight to a GitHub repository you own.",
              },
              {
                k: "media-image",
                v: "Image generation adapter — supports prompt enhancement and multi-model fan-out.",
              },
              {
                k: "media-plan",
                v: "Analyzes a video/image prompt and returns a scene-by-scene plan for you to approve.",
              },
              {
                k: "media-video / media-video-poll",
                v: "Submits a video job, then polls until ready.",
              },
              {
                k: "openrouter-media",
                v: "Unified backend that routes to Alibaba DashScope, BytePlus Ark and Apify actors. API keys rotated automatically.",
              },
              {
                k: "operator-orchestrator",
                v: "Megsy OS engine — maps operator_runs to Manus API tasks, persists every step and message.",
              },
              {
                k: "pipedream-connect",
                v: "Mints short-lived Pipedream Connect tokens so you can wire up 1,000+ apps without sharing passwords.",
              },
              {
                k: "report-error",
                v: "Multi-route — error reporting, user notifications, workspace notifications, GitHub import, secret checks.",
              },
              {
                k: "sitemap-blog",
                v: "Dynamic multilingual blog sitemap with full hreflang alternates.",
              },
              {
                k: "slides-api",
                v: "Public API for slides: list_templates, get_template, create_deck, export_pptx. API-key authenticated (Business+).",
              },
              {
                k: "slides-export-pptx",
                v: "Turns a deck into a real downloadable .pptx via python-pptx in a sandbox — RTL and themed colours preserved.",
              },
              {
                k: "telegram-tasks-bot",
                v: "Webhook for the Telegram bot — manage workspace tasks from Telegram; also media storage proxy.",
              },
              {
                k: "upload-asset",
                v: "Uploads files to Cloudflare R2 (max 10 MB). Images are converted to WebP client-side before upload.",
              },
              {
                k: "video-agent",
                v: "Plans a long video as multiple shots, dispatches each, polls, then merges with ffmpeg.wasm into a single MP4 — that’s how Cinema mode works.",
              },
            ],
          },
        ],
      },
    ],
  },

  /* ─────────────── Realtime, mobile & resilience ─────────────── */
  {
    id: "realtime-mobile",
    label: "Realtime, mobile & resilience",
    sections: [
      {
        id: "realtime-chat",
        title: "Realtime collaboration",
        icon: MegsyStar as unknown as LucideIcon,
        accent: MINT,
        intro:
          "Every conversation in Megsy is a live, multiplayer room. When you invite a teammate or join a shared workspace, presence, typing indicators, reactions and read-receipts stream through Supabase Realtime channels in milliseconds.",
        blocks: [
          { kind: "h", text: "What syncs live" },
          {
            kind: "ul",
            items: [
              "Messages — new turns, edits and deletions appear instantly without refresh.",
              "Typing indicators — see exactly who in the room is composing right now.",
              "Member presence — coloured dots show who is online; each member gets a stable colour.",
              "Reactions — emoji reactions propagate to every viewer the moment they're added.",
              "Read receipts — know which teammates have seen each message.",
              "Tool activity — long-running tools (research, video, slides) broadcast their step changes.",
            ],
          },
          { kind: "h", text: "How it works under the hood" },
          {
            kind: "ul",
            items: [
              "Each conversation subscribes to a dedicated Supabase Realtime channel keyed by conversation id.",
              "Subscriptions live inside React `useEffect` hooks and are torn down on unmount — no leaked channels.",
              "Row-Level Security still applies: you only receive rows you're allowed to read.",
              "Reconnection is automatic — if your network drops, the channel resumes where it left off.",
            ],
          },
          {
            kind: "note",
            text: "Realtime requires being logged in. Anonymous shared chats render statically from a snapshot URL.",
          },
        ],
      },
      {
        id: "mobile-experience",
        title: "The mobile experience",
        icon: MegsyStar as unknown as LucideIcon,
        accent: BLUSH,
        intro:
          "Megsy on a phone is not a shrunken desktop — it's its own carefully built surface with native-feeling gestures, safe-area handling and haptics. Install the PWA and you get a real app icon, splash screen and offline shell.",
        blocks: [
          { kind: "h", text: "Mobile-first details" },
          {
            kind: "ul",
            items: [
              "Bottom composer dock with sticky safe-area padding for iPhone home-bar and Android gesture nav.",
              "Pull-to-refresh anywhere a list is rendered (conversations, notifications, integrations).",
              "Swipe gestures: swipe a conversation row to archive; long-press a message for reactions.",
              "Haptic feedback on every primary action (send, react, save, delete) via the Web Vibration API.",
              "Glass sheets and bottom drawers replace desktop dropdowns for one-thumb reach.",
              "Mobile mode-bar at the top switches between Chat, Image, Video, Slides, Docs, Research, Operator.",
              "Auto-scroll-to-bottom that respects the user — stops following if you scroll up to read history.",
            ],
          },
          { kind: "h", text: "Installing as a real app (PWA)" },
          {
            kind: "p",
            text: "See the dedicated 'Install as an app' group for iPhone, Android, macOS, Windows and Linux walk-throughs. Once installed, Megsy launches full-screen with its own splash and shows up in the system app switcher.",
          },
        ],
      },
      {
        id: "offline-and-errors",
        title: "Offline mode & error handling",
        icon: MegsyStar as unknown as LucideIcon,
        accent: ACTION,
        intro:
          "Megsy keeps working when your connection is shaky. We cache the shell, queue safe actions, surface friendly errors and never leak technical details to end users.",
        blocks: [
          { kind: "h", text: "Offline behaviour" },
          {
            kind: "ul",
            items: [
              "Offline banner: a slim notice appears the moment the browser reports the network is down, and disappears when it returns.",
              "Service worker caches the app shell — opening Megsy with no connection still loads instantly.",
              "Already-loaded conversations, settings pages and docs remain readable offline.",
              "Sending messages, generating media or saving settings requires connectivity — these actions show an inline 'You're offline' state instead of failing silently.",
            ],
          },
          { kind: "h", text: "Error boundaries" },
          {
            kind: "ul",
            items: [
              "A global ErrorBoundary catches React crashes and shows a friendly recovery screen with a single 'Reload' button — your session and draft are preserved.",
              "Each lazy-loaded route has its own fallback, so a broken route never takes down the rest of the app.",
              "All thrown errors are sanitised via `sanitizeError` before display — no stack traces, no internal paths, no secrets.",
              "Retries with exponential backoff are built into network calls (`guards/retry.ts`); transient failures self-heal.",
            ],
          },
          {
            kind: "note",
            text: "Crashes are reported privately to the `report-error` edge function so we can fix them, but no personal data, prompts or outputs are ever included in the report.",
          },
        ],
      },
      {
        id: "performance",
        title: "Performance & loading philosophy",
        icon: MegsyStar as unknown as LucideIcon,
        accent: MINT,
        intro:
          "Megsy is built to feel instant on a 5-year-old phone over a 3G connection. Every route is code-split, every image is lazy-loaded and converted to WebP, and the shell loads from cache on second visit.",
        blocks: [
          { kind: "h", text: "Techniques we use everywhere" },
          {
            kind: "ul",
            items: [
              "Route-level code splitting — only the page you're on gets shipped to your device.",
              "`lazyWithRetry` — lazy imports auto-retry on transient chunk-load failures (common after a deploy).",
              "Images converted to WebP client-side before upload to cut bandwidth ~40% vs PNG/JPEG.",
              "Smart image component lazily loads off-screen images and serves a tiny blurred placeholder.",
              'Videos use `<video preload="metadata">` and only buffer when in viewport.',
              "Local cache (`useLocalCache`) memoises expensive computations across sessions.",
              "Edge-function responses are streamed token-by-token where possible — you read while the model writes.",
            ],
          },
          { kind: "h", text: "What you can do" },
          {
            kind: "p",
            text: "Nothing — performance is automatic. But if a page ever feels slow, the System Status page shows current latency for every region and provider in real time.",
          },
          { kind: "link", href: "/settings/system-status", label: "Open System Status →" },
        ],
      },
      {
        id: "i18n-deep",
        title: "Languages, RTL & dialects",
        icon: MegsyStar as unknown as LucideIcon,
        accent: BLUSH,
        intro:
          "Megsy speaks every major language and respects your dialect. The interface mirrors right-to-left for Arabic, Hebrew and Persian automatically; the AI mirrors your exact dialect so Egyptian Arabic stays Egyptian and never gets 'translated' to MSA.",
        blocks: [
          { kind: "h", text: "Languages the marketing site is fully translated into" },
          {
            kind: "p",
            text: "Arabic · English · Spanish · French · German · Italian · Portuguese · Dutch · Polish · Czech · Greek · Romanian · Swedish · Russian · Ukrainian · Turkish · Hebrew · Persian · Hindi · Chinese · Japanese · Korean · Thai · Vietnamese · Indonesian — 25+ locales, with full RTL support where the script requires it.",
          },
          { kind: "h", text: "Dialect mirroring in chat" },
          {
            kind: "ul",
            items: [
              "We detect language and dialect on every turn (`detectLang`, `detectLanguage`).",
              "Egyptian Arabic, Levantine Arabic, Gulf Arabic, Maghrebi Arabic, MSA — Megsy replies in the same.",
              "Same for European vs Brazilian Portuguese, European vs Latin Spanish, Simplified vs Traditional Chinese, etc.",
              "If you switch language mid-conversation, Megsy switches with you and never reverts.",
            ],
          },
          { kind: "h", text: "RTL details" },
          {
            kind: "ul",
            items: [
              "Layout, icons, gradients and scroll directions all flip automatically when the document direction is `rtl`.",
              "Code blocks and math always render LTR even inside an RTL page — code is universal.",
              "Mixed-direction text (e.g. an English brand name inside Arabic prose) uses Unicode bidi marks for correct rendering.",
            ],
          },
          { kind: "link", href: "/settings/language", label: "Change your language →" },
        ],
      },
      {
        id: "accessibility-deep",
        title: "Accessibility commitments",
        icon: MegsyStar as unknown as LucideIcon,
        accent: ACTION,
        intro:
          "Megsy aims for WCAG 2.2 AA across every page. Keyboard-only navigation, screen-reader labels, visible focus rings, sufficient contrast in both themes and respect for the user's reduce-motion preference are non-negotiable.",
        blocks: [
          { kind: "h", text: "What we guarantee" },
          {
            kind: "ul",
            items: [
              "Every interactive element is reachable by keyboard, with a clearly visible focus ring.",
              "Every icon-only button has an `aria-label` or `title` describing its action.",
              "Dialogs, sheets and dropdowns are real ARIA dialogs — focus is trapped while open and restored on close.",
              "Live regions announce streaming AI replies and tool-status changes to screen readers.",
              "All animations honour `prefers-reduced-motion: reduce` — they instantly become non-animated.",
              "Color contrast meets AA in both light and dark themes; never relies on colour alone to convey meaning.",
              "Forms have associated `<label>`s, inline error text and `aria-describedby` for help text.",
            ],
          },
          {
            kind: "link",
            href: "/legal/accessibility",
            label: "Read our full accessibility statement →",
          },
        ],
      },
    ],
  },

  /* ─────────────── Power workflows & creative recipes ─────────────── */
  {
    id: "power-recipes",
    label: "Power workflows & creative recipes",
    sections: [
      {
        id: "keyboard-shortcuts",
        title: "Every keyboard shortcut",
        icon: MegsyStar as unknown as LucideIcon,
        accent: ACTION,
        intro:
          "Megsy is built so a power user never needs the mouse. Every shortcut works on macOS (⌘) and Windows/Linux (Ctrl).",
        blocks: [
          { kind: "h", text: "Global" },
          {
            kind: "kv",
            rows: [
              {
                k: "⌘ / Ctrl + K",
                v: "Open the command palette — jump to any conversation, page, model or setting.",
              },
              { k: "⌘ / Ctrl + /", v: "Toggle the sidebar." },
              { k: "⌘ / Ctrl + Shift + L", v: "Switch light / dark theme." },
              { k: "⌘ / Ctrl + ,", v: "Open Settings." },
              { k: "G then H", v: "Go home (landing / chat depending on auth)." },
              { k: "?", v: "Show this shortcut cheat-sheet from any page." },
            ],
          },
          { kind: "h", text: "Inside a conversation" },
          {
            kind: "kv",
            rows: [
              { k: "Enter", v: "Send the message." },
              { k: "Shift + Enter", v: "New line inside the composer." },
              { k: "↑ (in empty composer)", v: "Edit your last message." },
              { k: "⌘ / Ctrl + Enter", v: "Send and force-cancel the previous streaming reply." },
              { k: "Esc", v: "Cancel the current streaming reply." },
              { k: "⌘ / Ctrl + U", v: "Upload a file." },
              { k: "⌘ / Ctrl + Shift + M", v: "Open the model picker." },
              { k: "@", v: "Mention an integration, skill or workspace member." },
              { k: "/", v: "Insert a slash command (mode switch, template, skill)." },
              { k: "⌘ / Ctrl + B / I / E", v: "Bold / italic / inline-code on selected text." },
            ],
          },
        ],
      },
      {
        id: "command-palette",
        title: "The command palette (⌘K)",
        icon: MegsyStar as unknown as LucideIcon,
        accent: MINT,
        intro:
          "The command palette is the fastest way to navigate Megsy. It searches across every conversation, every page, every model, every setting, every integration and every doc section in real time.",
        blocks: [
          { kind: "h", text: "What you can do from ⌘K" },
          {
            kind: "ul",
            items: [
              "Jump to any conversation by title, content snippet or member name.",
              "Open any page in the app (Settings, Billing, Integrations, Docs, etc.).",
              "Switch the active model without leaving the keyboard.",
              "Run a skill or trigger a saved automation.",
              "Search this entire documentation — results are highlighted with the matching snippet.",
              "Toggle theme, language or any boolean setting.",
            ],
          },
          {
            kind: "note",
            text: "The palette respects recency — your most-used commands float to the top automatically.",
          },
        ],
      },
      {
        id: "share-and-export",
        title: "Sharing & exporting your work",
        icon: MegsyStar as unknown as LucideIcon,
        accent: BLUSH,
        intro:
          "Anything you create in Megsy can be shared with a link or exported to a real file. We never lock you into proprietary formats — your data is yours.",
        blocks: [
          { kind: "h", text: "Shareable links" },
          {
            kind: "ul",
            items: [
              "Chats → public read-only URL with optional password and expiry.",
              "Documents → live preview link that updates as you edit.",
              "Slide decks → presentation URL with speaker-notes view (?notes=1).",
              "Research reports → article-style page with table of contents and citations.",
              "Operator runs → audit-trail page showing every step the agent took.",
              "Workspaces → invite links scoped to a single role (viewer / editor / admin).",
            ],
          },
          { kind: "h", text: "Export formats" },
          {
            kind: "kv",
            rows: [
              {
                k: "Slides",
                v: "PPTX (real PowerPoint, themes preserved), PDF, and PNG per slide.",
              },
              { k: "Documents", v: "PDF, DOCX, Markdown and HTML." },
              { k: "Spreadsheets", v: "XLSX (formulas preserved) and CSV." },
              { k: "Chats", v: "Markdown transcript or JSON (for programmatic processing)." },
              { k: "Images", v: "Original WebP/PNG/JPEG + downloadable in any of the three." },
              { k: "Videos", v: "MP4 (H.264) and WebM (VP9)." },
              { k: "Research", v: "PDF (article layout) or Markdown with inline citation links." },
            ],
          },
        ],
      },
      {
        id: "notifications-deep",
        title: "Notifications — where, when, how",
        icon: MegsyStar as unknown as LucideIcon,
        accent: ACTION,
        intro:
          "Megsy can reach you in three places: in-app, by email, and by push (if you installed the PWA and granted permission). Every category is independently toggleable in Settings → Notifications.",
        blocks: [
          { kind: "h", text: "Categories" },
          {
            kind: "ul",
            items: [
              "Long jobs (research, video, slides) finishing — high signal, on by default.",
              "Workspace invites and role changes — on by default.",
              "Mentions in shared conversations — on by default.",
              "Credit balance warnings (50%, 10%, exhausted) — on by default.",
              "Operator run results (Megsy OS) — on by default.",
              "Referral rewards and withdrawals — on by default.",
              "Product updates and tips — off by default; opt in if you want them.",
            ],
          },
          { kind: "h", text: "Quiet hours" },
          {
            kind: "p",
            text: "Set a do-not-disturb window per timezone. Email and push are queued until your quiet hours end; in-app notifications still show but never make a sound.",
          },
          { kind: "link", href: "/settings/notifications", label: "Open notification settings →" },
        ],
      },
      {
        id: "credits-math",
        title: "How Megsy Credits (MC) actually work",
        icon: MegsyStar as unknown as LucideIcon,
        accent: MINT,
        intro:
          "Every Megsy plan grants a monthly bucket of Megsy Credits (MC). Different actions cost different amounts — there are no hidden surcharges, and your remaining balance is shown on every relevant button before you commit.",
        blocks: [
          { kind: "h", text: "Cost guide (approximate)" },
          {
            kind: "kv",
            rows: [
              { k: "Chat turn (Megsy Lite)", v: "Free on every paid plan — unlimited." },
              {
                k: "Chat turn (Megsy AI / Max)",
                v: "1–5 MC depending on output length and tool usage.",
              },
              {
                k: "Frontier model turn (GPT-5, Claude Opus, Gemini Ultra…)",
                v: "10–30 MC per turn.",
              },
              { k: "Image (standard)", v: "5–15 MC per image." },
              {
                k: "Image (premium: Flux Pro, Recraft v3, Ideogram v3…)",
                v: "20–50 MC per image.",
              },
              { k: "Video (5s, standard)", v: "30–80 MC." },
              { k: "Video (10s, premium: Kling 2.0, Veo 3, Sora…)", v: "150–400 MC." },
              { k: "Deep research run", v: "50–200 MC depending on depth." },
              { k: "Slide deck (10 slides)", v: "30–80 MC including images." },
              { k: "Long document (5k words)", v: "20–60 MC." },
              {
                k: "Operator autonomous run",
                v: "Variable — billed per browser-minute and tool call, capped per run.",
              },
            ],
          },
          {
            kind: "note",
            text: "Exact costs are always shown live next to every generate button — what you see is what you pay. Free tier and yearly plans get bonus MC.",
          },
          { kind: "link", href: "/pricing", label: "Compare plans and credit allowances →" },
        ],
      },
      {
        id: "creative-recipes",
        title: "Creative recipes — what Megsy users actually do",
        icon: MegsyStar as unknown as LucideIcon,
        accent: BLUSH,
        intro:
          "Quick, opinionated workflows that show what's possible when you combine modes. Each recipe takes under 5 minutes.",
        blocks: [
          { kind: "h", text: "Recipe 1 — Brand kit in one chat" },
          {
            kind: "ol",
            items: [
              "Describe your brand in plain language (audience, vibe, three competitor names).",
              "Ask Megsy to generate a logo (uses Recraft/Ideogram for vector quality).",
              "In the same chat: 'Now make a colour palette and a Google Fonts pairing that match.'",
              "Then: 'Render a hero image and three social posts using the palette.'",
              "Export — every asset downloads with your brand name as filename prefix.",
            ],
          },
          { kind: "h", text: "Recipe 2 — Research → slides → PDF" },
          {
            kind: "ol",
            items: [
              "Switch to Research mode, type your topic, choose depth 'Standard'.",
              "When the report finishes, click 'Turn into slides' — Megsy converts the outline.",
              "Pick a template, hit Generate, then Export → PPTX or PDF.",
              "Total time: ~7 minutes for a 12-slide investor-grade brief.",
            ],
          },
          { kind: "h", text: "Recipe 3 — Long video from a single prompt" },
          {
            kind: "ol",
            items: [
              "Switch to Video → Cinema mode.",
              "Describe the full 30-second story in one paragraph; Megsy auto-splits into shots.",
              "Pick your video model and aspect ratio; Megsy plans, dispatches, polls and merges into a single MP4 via ffmpeg.wasm.",
              "Add a music track from the Music agent or upload your own; download the final cut.",
            ],
          },
          { kind: "h", text: "Recipe 4 — Always-on Operator" },
          {
            kind: "ol",
            items: [
              "Open Megsy OS, click 'New run', describe the goal: 'Every morning at 8am, summarise my Notion inbox and email me the top 5 action items.'",
              "Connect Notion and Gmail when prompted; pick the schedule.",
              "Done — the agent runs autonomously, with a full audit log in Settings → Operator audit.",
            ],
          },
        ],
      },
      {
        id: "tips-and-tricks",
        title: "Tips, easter eggs & power moves",
        icon: MegsyStar as unknown as LucideIcon,
        accent: ACTION,
        intro:
          "Small touches Megsy users discover over time. Not strictly necessary — but they make the experience faster, friendlier and a little more fun.",
        blocks: [
          {
            kind: "ul",
            items: [
              "Type `/clear` in any conversation to start fresh without losing the title.",
              "Drag an image directly from another browser tab into the composer — no save-to-disk needed.",
              "Paste a URL → Megsy auto-fetches the page and shows a preview card you can attach.",
              "Paste a YouTube URL → Megsy extracts the transcript and lets you ask questions about it.",
              "Triple-click any AI reply to copy the entire message (works on desktop and mobile long-press).",
              "Add `?reduce_motion=1` to any URL to disable animations even if your OS setting says otherwise.",
              "Add `?theme=dark` (or `light`) to any URL to override your theme for this session only.",
              "Tap the Megsy logo 7 times in the sidebar — there's a tiny surprise.",
              "Hold ⌥ / Alt while clicking a model badge to pin it to your favourites bar.",
              "Right-click any conversation in the sidebar for advanced actions (export, fork, rename, archive, delete).",
            ],
          },
          {
            kind: "note",
            text: "We keep adding these — check back monthly or watch the blog for 'Megsy Tips' posts.",
          },
        ],
      },
    ],
  },

  /* ─────────────────────────── Trust & Compliance ─────────────────────────── */
  {
    id: "trust",
    label: "Trust & Compliance",
    sections: [
      {
        id: "trust-center",
        title: "Trust Center — /trust",
        icon: ShieldCheck,
        accent: MINT,
        intro:
          "Single landing for everything related to security, privacy and platform reliability. Maintained by Megsy AI — not an independent certification.",
        blocks: [
          {
            kind: "ul",
            items: [
              "Summarises which platform controls are enabled today (auth, RLS, encryption-in-transit, edge isolation).",
              "Links out to: Compliance, Subprocessors, DPA, Privacy, Cookies, Moderation, Content Policy, AI Disclaimer and Security report.",
              "Includes a security contact: security@megsyai.com and a vulnerability-disclosure path via /.well-known/security.txt.",
              "Updated whenever a new subprocessor, region or platform control changes.",
            ],
          },
          {
            kind: "note",
            text: "This page describes app-owner practices and approved platform capabilities. It is not a SOC 2 / ISO certification.",
          },
          { kind: "link", href: "/trust", label: "Open Trust Center →" },
        ],
      },
      {
        id: "compliance",
        title: "Compliance posture — /compliance",
        icon: BadgeCheck,
        accent: ACTION,
        intro:
          "Plain-language summary of the laws and frameworks we align with, plus what is still in-progress.",
        blocks: [
          {
            kind: "ul",
            items: [
              "GDPR / UK-GDPR data-subject rights flow (access, rectification, deletion, portability, objection).",
              "CCPA / CPRA: ‘Do not sell or share my personal information’ surface in Privacy Settings.",
              "Region-aware data residency notes for EU users.",
              "Children’s safety stance — see Age Policy.",
              "Status of certifications in-progress is stated honestly; nothing is implied that hasn’t been audited.",
            ],
          },
          { kind: "link", href: "/trust", label: "Read the compliance page →" },
        ],
      },
      {
        id: "subprocessors",
        title: "Subprocessors — /subprocessors",
        icon: Database,
        accent: BLUSH,
        intro: "Current list of third parties that may process customer data on our behalf.",
        blocks: [
          {
            kind: "ul",
            items: [
              "Each row: vendor, purpose, data categories, hosting region.",
              "Includes model providers (OpenAI, Anthropic, Google, xAI, Alibaba, Meta, Fal, Recraft, BFL, Ideogram, Pixverse, Kling, Hailuo…), infra (Supabase, Cloudflare, Vercel/Lovable hosting), payments (Dodo, Stripe-like), email (Resend), analytics (privacy-first only).",
              "Material changes are announced 30 days in advance for paid customers per the DPA.",
            ],
          },
          { kind: "link", href: "/legal/subprocessors", label: "See the current list →" },
        ],
      },
      {
        id: "dpa",
        title: "Data Processing Agreement — /dpa",
        icon: ScrollText,
        accent: MINT,
        blocks: [
          {
            kind: "p",
            text: "Customers acting as data controllers can request our standard DPA (Article 28 GDPR) directly from /dpa. The page includes the SCC module references for cross-border transfers and a downloadable PDF version.",
          },
          { kind: "link", href: "/legal/dpa", label: "Open the DPA →" },
        ],
      },
      {
        id: "dmca",
        title: "DMCA / takedowns — /dmca",
        icon: ShieldAlert,
        accent: BLUSH,
        blocks: [
          {
            kind: "p",
            text: "If you are a rights-holder and believe content generated, hosted or surfaced by Megsy AI infringes your copyright, send a properly-formed DMCA notice to the address on /dmca. The page lists required fields and our designated agent.",
          },
          { kind: "link", href: "/legal/dmca", label: "DMCA notice form →" },
        ],
      },
      {
        id: "moderation",
        title: "Moderation & safety — /moderation",
        icon: Shield,
        accent: ACTION,
        intro:
          "What is automatically blocked, what is reviewed, and what to expect when a generation is rejected.",
        blocks: [
          {
            kind: "ul",
            items: [
              "Real-time prompt + output classifiers across text, image, video and voice.",
              "Hard blocks: CSAM, non-consensual sexual content, real-person likeness misuse, weapons/explosives manufacturing, malware that targets real systems.",
              "Soft warnings for sensitive themes — you can revise the prompt and retry.",
              "Appeals: every rejection links to a ‘Report a mistake’ button → human review within 24h on paid plans.",
            ],
          },
          { kind: "link", href: "/legal/moderation", label: "Full moderation policy →" },
          { kind: "link", href: "/legal/moderation", label: "Content policy →" },
        ],
      },
      {
        id: "ai-disclaimer",
        title: "AI Disclaimer — /ai-disclaimer",
        icon: HelpCircle,
        accent: BLUSH,
        blocks: [
          {
            kind: "p",
            text: "States plainly that Megsy outputs are AI-generated, may contain mistakes, must not be relied on for medical, legal, financial or safety-critical decisions, and that the user is responsible for reviewing outputs before using them.",
          },
          { kind: "link", href: "/legal/ai-disclaimer", label: "Read the disclaimer →" },
        ],
      },
      {
        id: "age-policy",
        title: "Age policy — /age-policy",
        icon: Users,
        accent: MINT,
        blocks: [
          {
            kind: "p",
            text: "Megsy AI is intended for users 13+ (16+ in the EU/UK without parental consent). Accounts found to belong to underage users are suspended; parents/guardians can request deletion at privacy@megsyai.com.",
          },
          { kind: "link", href: "/legal/age", label: "Read the age policy →" },
        ],
      },
      {
        id: "accessibility",
        title: "Accessibility — /accessibility",
        icon: Eye,
        accent: ACTION,
        intro: "Our public commitment to WCAG 2.2 AA and the controls available today.",
        blocks: [
          {
            kind: "ul",
            items: [
              "Keyboard-navigable across every screen; visible focus rings on every interactive element.",
              "Screen-reader labels on icons, model badges, tool buttons and message actions.",
              "Reduced-motion mode honours the OS-level prefers-reduced-motion media query.",
              "High-contrast theme + adjustable font size in Settings → Customization.",
              "Voice mode for hands-free interaction.",
              "Report a barrier: accessibility@megsyai.com — we aim to acknowledge within 2 business days.",
            ],
          },
          {
            kind: "link",
            href: "/legal/accessibility",
            label: "Open the accessibility statement →",
          },
        ],
      },
      {
        id: "affiliate-terms",
        title: "Affiliate / Referral terms — /affiliate-terms",
        icon: Gift,
        accent: BLUSH,
        blocks: [
          {
            kind: "p",
            text: "Legal terms that govern the referral program: who can join, payout rules, anti-abuse, tax responsibility and termination. Read alongside /referrals (the program UI) and Withdraw (payout flow).",
          },
          { kind: "link", href: "/legal/affiliate", label: "Read affiliate terms →" },
        ],
      },
    ],
  },

  /* ─────────────────────────── Auth & Security flows ─────────────────────────── */
  {
    id: "auth-flows",
    label: "Auth & Security flows",
    sections: [
      {
        id: "reset-password",
        title: "Reset password — /reset-password",
        icon: Lock,
        accent: MINT,
        intro: "Triggered from /auth → ‘Forgot password’.",
        blocks: [
          {
            kind: "ol",
            items: [
              "Enter the email on your account → we email a one-time reset link valid for 60 minutes.",
              "The link lands on /reset-password with a signed token; the page rejects expired or reused tokens with a clear error.",
              "Type a new password (min 10 chars, one number, one symbol). Strength meter is live.",
              "On success you are signed in on this device. Other sessions remain valid unless you tap ‘Sign out everywhere’.",
            ],
          },
          {
            kind: "note",
            text: "If you no longer have access to the email, open /contact and request identity verification — never share your password with support.",
          },
        ],
      },
      {
        id: "change-password",
        title: "Change password — /change-password",
        icon: Lock,
        accent: ACTION,
        blocks: [
          {
            kind: "p",
            text: "Requires the current password. After saving, every other signed-in session is force-revoked. A confirmation email is sent for audit.",
          },
        ],
      },
      {
        id: "change-email",
        title: "Change email — /change-email",
        icon: Pencil,
        accent: BLUSH,
        blocks: [
          {
            kind: "ol",
            items: [
              "Type the new email → we send a verification link to the new address.",
              "Until you click it, the old email stays active.",
              "After verification: invoices, receipts and account notices route to the new email; your referral & workspace memberships move automatically.",
            ],
          },
        ],
      },
      {
        id: "two-factor",
        title: "Two-factor authentication — /two-factor",
        icon: ShieldCheck,
        accent: MINT,
        intro: "Enable an authenticator-app second factor (TOTP).",
        blocks: [
          {
            kind: "ol",
            items: [
              "Open the page → scan the QR with Google Authenticator / 1Password / Authy.",
              "Enter the 6-digit code to confirm.",
              "Save the 10 backup codes somewhere safe — each is single-use.",
              "From now on every new sign-in asks for the code at /mfa-challenge.",
            ],
          },
          {
            kind: "note",
            text: "Lost device + lost backup codes = identity-verified recovery only. Plan ahead.",
          },
        ],
      },
      {
        id: "mfa-challenge",
        title: "MFA challenge — /mfa-challenge",
        icon: ShieldAlert,
        accent: BLUSH,
        blocks: [
          {
            kind: "p",
            text: "Shown after a successful password sign-in when 2FA is enabled. Enter the 6-digit code or paste a backup code. A ‘Trust this device for 30 days’ checkbox skips the challenge on the same device until cookies are cleared.",
          },
        ],
      },
      {
        id: "delete-account",
        title: "Delete account — /delete-account",
        icon: ShieldAlert,
        accent: BLUSH,
        intro: "A hard, irreversible action with a 14-day grace window.",
        blocks: [
          {
            kind: "ol",
            items: [
              "Confirm with your password + a typed phrase.",
              "Account is marked for deletion; you can cancel within 14 days by signing back in.",
              "After 14 days: all chats, files, memories, skills, websites, slides and personal data are purged. Workspace data you owned is offered to co-admins first.",
              "Receipts and invoices required by tax law are retained per Privacy Policy.",
            ],
          },
        ],
      },
      {
        id: "oauth-authorize",
        title: "OAuth — /oauth/authorize",
        icon: Link2,
        accent: ACTION,
        intro: "Shown when a third-party app asks for access to your Megsy account.",
        blocks: [
          {
            kind: "ul",
            items: [
              "The page lists: app name + logo, requested scopes (read chats, write files, run agents…), and expiration.",
              "Granular scopes — you can untick anything you don’t want before approving.",
              "Approved apps are listed under Settings → Security → Connected apps and can be revoked any time.",
            ],
          },
        ],
      },
      {
        id: "oauth-callback",
        title: "OAuth callback — /auth/callback",
        icon: RefreshCw,
        accent: MINT,
        blocks: [
          {
            kind: "p",
            text: "Internal landing for OAuth redirects (Google, Apple, GitHub, Microsoft, Telegram, integration providers). Validates the state token, exchanges the code for a session and routes you to where you started. If something goes wrong you see a friendly error with a ‘Try again’ button.",
          },
        ],
      },
      {
        id: "accept-invite",
        title: "Accept invite — /accept-invite",
        icon: Users,
        accent: ACTION,
        blocks: [
          {
            kind: "p",
            text: "Workspace, team or referral invites land here. The page shows who invited you, the workspace name, the role you’ll get and any pooled-credit benefits. Sign in or sign up in one step and you’re inside the workspace immediately.",
          },
        ],
      },
      {
        id: "accept-workspace-invite",
        title: "Accept workspace invite — /accept-workspace-invite",
        icon: Building2,
        accent: BLUSH,
        blocks: [
          {
            kind: "p",
            text: "Specialized invite flow for paid workspace seats. Confirms the seat assignment, role (Owner / Admin / Editor / Viewer) and shows which folders / chats you’ll see by default.",
          },
        ],
      },
      {
        id: "referral-redirect",
        title: "Referral redirect — /r/:code",
        icon: Gift,
        accent: MINT,
        blocks: [
          {
            kind: "p",
            text: "Bare-bones page that captures the referral code into a first-party cookie (30-day attribution window) and forwards to the landing page or sign-up screen. Used by every referral link shared from /referrals.",
          },
        ],
      },
      {
        id: "connected-apps",
        title: "Connected apps & sessions",
        icon: Wrench,
        accent: ACTION,
        intro: "Settings → Security shows every signed-in device and every OAuth-connected app.",
        blocks: [
          {
            kind: "ul",
            items: [
              "Sessions list: device, browser, last-seen, IP city/country. Revoke individually or ‘Sign out everywhere’.",
              "OAuth apps: scope, granted-at, last-used. Revoke = the app stops working instantly.",
              "Sign-in alerts: optional email when a new device signs in.",
              "Audit log: last 90 days of security-relevant events (sign-ins, password changes, 2FA changes).",
            ],
          },
        ],
      },
    ],
  },

  /* ─────────────────────────── Deep-dives: marketing, billing, settings ─────────────────────────── */
  {
    id: "deep-dives",
    label: "Page-by-page deep-dives",
    sections: [
      {
        id: "about",
        title: "About — /about",
        icon: BookOpen,
        accent: MINT,
        blocks: [
          {
            kind: "p",
            text: "The story behind Megsy AI — mission, team, why we built it. Includes contact and press details. Updated as the company grows.",
          },
          { kind: "link", href: "/about", label: "Read About →" },
        ],
      },
      {
        id: "features-guide",
        title: "Features guide — /features-guide",
        icon: ListTree,
        accent: ACTION,
        intro:
          "The long-form, marketing-grade tour of every capability. Different from /docs: this is sales-tone, with screenshots and demos.",
        blocks: [
          {
            kind: "ul",
            items: [
              "Top-level grid of every product surface (Chat, Images, Video, Slides, Docs, Research, Code, Websites, Operator, Music, Voice, Learning).",
              "Each card opens an expanded section with sample prompts, model line-up and pricing notes.",
              "Use this when sending a link to a non-technical person; use /docs when you want the full reference.",
            ],
          },
          { kind: "link", href: "/features-guide", label: "Open the features guide →" },
        ],
      },
      {
        id: "egypt-landing",
        title: "Egypt landing — /egypt",
        icon: Globe2,
        accent: BLUSH,
        blocks: [
          {
            kind: "p",
            text: "Local landing tailored to the Egyptian market: pricing in EGP equivalents, Vodafone Cash & Fawry payment routes, Egyptian-Arabic copy, local payment FAQs and contact in Cairo timezone.",
          },
          { kind: "link", href: "/egypt", label: "Open the Egypt landing →" },
        ],
      },
      {
        id: "comparisons-deep",
        title: "Comparison pages — /compare/:slug",
        icon: LayoutGrid,
        accent: MINT,
        intro:
          "SEO-friendly head-to-head pages — Megsy vs ChatGPT, vs Claude, vs Gemini, vs Manus, vs Genspark, vs Sora, vs Midjourney, etc.",
        blocks: [
          {
            kind: "ul",
            items: [
              "Each page renders from /data/comparisons.ts → feature matrix, pricing, model line-up, real screenshots.",
              "Sticky ‘Try Megsy free’ CTA, structured-data markup for rich Google snippets.",
              "All comparisons are also linked from the docs auto-group ‘Comparison pages’.",
            ],
          },
        ],
      },
      {
        id: "service-landings-deep",
        title: "Service landings — /:service",
        icon: Globe,
        accent: ACTION,
        intro:
          "Single-purpose, SEO-optimised landings for ‘AI image generator’, ‘AI video generator’, ‘AI slides maker’, ‘AI website builder’, ‘AI deep research’ and many more.",
        blocks: [
          {
            kind: "ul",
            items: [
              "Driven by /data/serviceLandings — add a new entry and a new landing ships automatically with its own SEO metadata.",
              "Each landing reuses the same hero, prompt-playground, model-grid and pricing components for consistency.",
            ],
          },
        ],
      },
      {
        id: "blog-reading",
        title: "Blog reading experience — /blog/:slug",
        icon: ScrollText,
        accent: MINT,
        intro: "Long-form posts with first-class reading UX.",
        blocks: [
          {
            kind: "ul",
            items: [
              "Auto table-of-contents on the right, scroll-spy highlights the current section.",
              "Reading progress bar at the top; estimated reading time in the hero.",
              "Social share + copy-link on every heading.",
              "Hreflang alternates for every translation — Arabic, English, French, Spanish, German, Polish — sitemap is dynamic via /functions/v1/sitemap-blog.",
              "Suggested next reads at the bottom (related-by-tag), plus a ‘Try this in Megsy’ CTA.",
            ],
          },
        ],
      },
      {
        id: "billing-success",
        title: "Billing success — /billing/success",
        icon: CheckCircle2,
        accent: ACTION,
        blocks: [
          {
            kind: "p",
            text: "Lands here after a successful checkout. Shows the order summary, the plan / top-up that was applied, the new MC balance and a receipt link. If the credits aren’t visible immediately, the page polls the webhook for up to 60 seconds before showing a ‘still working’ state with a support link.",
          },
        ],
      },
      {
        id: "withdraw",
        title: "Withdraw earnings — /withdraw",
        icon: Wallet,
        accent: BLUSH,
        intro:
          "Cash out referral earnings to PayPal, bank transfer, USDT or local rails (e.g. Vodafone Cash in EG).",
        blocks: [
          {
            kind: "ol",
            items: [
              "Pick a payout method → fill the required fields (saved encrypted).",
              "Enter the amount (minimum thresholds vary per method, listed on the page).",
              "Confirm with 2FA if enabled.",
              "Payouts are batched daily; ETA per method is shown live.",
              "Every payout shows up under Referrals → Withdrawals tab with status (Pending / Sent / Failed / Refunded).",
            ],
          },
          { kind: "link", href: "/settings/withdraw", label: "Open Withdraw →" },
        ],
      },
      {
        id: "referral-resources",
        title: "Referral resources — /referral-resources",
        icon: Download,
        accent: MINT,
        intro: "Ready-to-share creative assets for ambassadors.",
        blocks: [
          {
            kind: "ul",
            items: [
              "Vertical & square videos (TikTok / Reels / Shorts) showing Megsy in action.",
              "Static images for X / LinkedIn / Instagram with your referral code baked in.",
              "Copy-paste captions in Arabic, English, French and Spanish.",
              "Megsy brand kit: logo, mark, colors, font names.",
              "All assets carry your code automatically — no manual editing.",
            ],
          },
        ],
      },
      {
        id: "referrals-tabs",
        title: "Referrals — tabs",
        icon: Gift,
        accent: ACTION,
        intro: "The /referrals dashboard has 4 tabs.",
        blocks: [
          {
            kind: "kv",
            rows: [
              {
                k: "Dashboard",
                v: "Lifetime earnings, this-month earnings, click-through rate, conversion rate, top traffic sources.",
              },
              {
                k: "Program",
                v: "How the 30-day cookie works, payout %, recurring vs one-shot, tier thresholds (more referrals → higher %).",
              },
              {
                k: "Tasks",
                v: "Mini-quests that grant bonus MC (e.g. ‘Get 3 friends to install the PWA’ → +500 MC).",
              },
              {
                k: "Withdrawals",
                v: "History of every cash-out: method, amount, status, transaction id.",
              },
            ],
          },
          { kind: "link", href: "/referrals", label: "Open referrals →" },
        ],
      },
      {
        id: "system-status-deep",
        title: "System status — /settings/system-status",
        icon: BadgeCheck,
        accent: MINT,
        blocks: [
          {
            kind: "ul",
            items: [
              "Live indicator per service: Chat, Image, Video, Research, Slides, Docs, Code, Voice, Music, Operator, Builder, API, Integrations, Payments, Auth.",
              "Each row: current state (Operational / Degraded / Down), last-incident date, average response time.",
              "Past 90 days of incidents with root-cause notes once resolved.",
              "Subscribe to updates via email or webhook.",
            ],
          },
        ],
      },
      {
        id: "switch-account",
        title: "Switch account — /settings/switch-account",
        icon: RefreshCw,
        accent: BLUSH,
        blocks: [
          {
            kind: "p",
            text: "Add a second / third Megsy account (personal + work) and switch between them in one tap from the avatar menu. Each account keeps its own MC balance, chats, memory and integrations.",
          },
        ],
      },
      {
        id: "skills-settings-deep",
        title: "Skills — list & creator",
        icon: Wand2,
        accent: ACTION,
        intro:
          "Two related pages: /settings/skills (your library) and /settings/skills/new (the visual creator).",
        blocks: [
          {
            kind: "ul",
            items: [
              "/settings/skills — every skill you own, with usage count, last-used and a quick ‘Pin to composer’ toggle. Filter by skill type (chat, image, video, slides, docs, agent).",
              "/settings/skills/new — multi-step builder: name, icon, tone, instructions, allowed tools, optional default model. Preview the first reply live before saving.",
              "Shared skills (workspace level) live under the same UI with a small ‘Shared’ badge.",
            ],
          },
        ],
      },
      {
        id: "settings-contact-help",
        title: "Settings → Contact, Help, Support, Privacy",
        icon: HelpCircle,
        accent: BLUSH,
        intro: "Four small but useful screens grouped under Settings.",
        blocks: [
          {
            kind: "kv",
            rows: [
              {
                k: "/settings/contact",
                v: "Direct line to humans — pre-fills your account info so support replies are faster.",
              },
              {
                k: "/settings/help",
                v: "Curated help center entry — searchable, links into the relevant /docs section automatically.",
              },
              {
                k: "/settings/support",
                v: "Open a ticket with priority routing for Pro / Max / Enterprise plans; attach screenshots and chat ids.",
              },
              {
                k: "/settings/privacy",
                v: "Privacy controls in one place: ‘Do not sell my info’, training opt-out (always off by default — we never train on your data), data export, deletion request.",
              },
            ],
          },
        ],
      },
      {
        id: "shared-chat",
        title: "Shared chat — /share/:id",
        icon: Share2,
        accent: MINT,
        intro: "Public read-only view of any chat you choose to share.",
        blocks: [
          {
            kind: "ul",
            items: [
              "Click ‘Share’ on a chat → choose a privacy mode (public link, password-gated, workspace-only).",
              "The /share/:id page renders the full thread with messages, images, videos, slides and code, plus a clean reader theme.",
              "A ‘Fork this chat into my Megsy’ button lets viewers continue the conversation in their own account.",
              "Revoke the link any time from Settings → Privacy → Shared chats.",
            ],
          },
        ],
      },
      {
        id: "research-preview",
        title: "Research preview — /research/:id",
        icon: Microscope,
        accent: ACTION,
        blocks: [
          {
            kind: "p",
            text: "Public, polished read-mode for a Deep Research report — abstract, structured chapters, citations panel, source list, and a one-click ‘Open in chat’ to continue the investigation. Used as the share-target for research jobs.",
          },
        ],
      },
      {
        id: "operator-pages",
        title: "Operator — agents list, audit, settings",
        icon: Bot,
        accent: BLUSH,
        intro: "The Operator product is administered across three Settings pages.",
        blocks: [
          {
            kind: "kv",
            rows: [
              {
                k: "/settings/operator",
                v: "Global preferences: default browser persona, max runtime, safety guardrails, allowed domains, notification preferences.",
              },
              {
                k: "/settings/operator/agents",
                v: "Every dynamically-created sub-agent — name, role, usage count, edit / archive / delete.",
              },
              {
                k: "/settings/operator/audit",
                v: "Full step-by-step replay of every Operator run — pages visited, clicks, screenshots, files downloaded, MC spent. Exportable as PDF/JSON.",
              },
            ],
          },
        ],
      },
      {
        id: "workspace-pages",
        title: "Workspace — list, create, detail, tasks",
        icon: Building2,
        accent: MINT,
        intro: "Everything team-related is split across four pages.",
        blocks: [
          {
            kind: "kv",
            rows: [
              {
                k: "/workspaces",
                v: "Every workspace you belong to with role badge and quick switcher.",
              },
              {
                k: "/workspaces/new",
                v: "Create a workspace: name, slug, color, default language, seat count, billing source.",
              },
              {
                k: "/workspaces/:id",
                v: "Detail page — members, roles, integrations, shared skills, shared memory, audit log, billing.",
              },
              {
                k: "/workspaces/:id/tasks",
                v: "Kanban-style task board fed by chat threads and Operator runs — assign, comment, mark done.",
              },
            ],
          },
        ],
      },
      {
        id: "404-not-found",
        title: "404 / Not found",
        icon: HelpCircle,
        accent: ACTION,
        blocks: [
          {
            kind: "p",
            text: "Any unknown URL renders our friendly 404 with the Megsy mascot, a search box pre-pointed at /docs, and a list of the most-visited pages. The 404 returns a real HTTP 404 to crawlers so it doesn’t pollute search results.",
          },
        ],
      },
    ],
  },

  /* ─────────────────────── Trust & Compliance ─────────────────────── */
  {
    id: "trust-compliance",
    label: "Trust & Compliance",
    sections: [
      {
        id: "trust-center",
        title: "Trust Center",
        icon: ShieldCheck,
        accent: MINT,
        intro:
          "/trust is the public hub for everything security, privacy, infrastructure and reliability on Megsy AI. App-owned editable content maintained by the Megsy team — not an independent certification.",
        blocks: [
          { kind: "h", text: "What you'll find" },
          {
            kind: "ul",
            items: [
              "Hosting & data-residency context — Supabase EU/US regions, Cloudflare edge, encrypted at rest (AES-256) and in transit (TLS 1.3).",
              "Access controls in the app — MFA, SSO (Business+), per-workspace roles, audit log of admin actions.",
              "Subprocessor list (live link to /subprocessors).",
              "Vulnerability reporting — security@megsyai.com + .well-known/security.txt.",
              "Data retention defaults & deletion windows (full account purge ≤ 30 days).",
            ],
          },
          {
            kind: "note",
            text: "Shared responsibility: Megsy secures the platform, the workspace owner controls who has access and which integrations are enabled, the end-user controls what they upload.",
          },
        ],
      },
      {
        id: "compliance",
        title: "Compliance posture",
        icon: BadgeCheck,
        accent: ACTION,
        intro:
          "Live status of the certifications, frameworks and regulations Megsy aligns to. Statements here are reviewed quarterly.",
        blocks: [
          {
            kind: "kv",
            rows: [
              {
                k: "GDPR (EU)",
                v: "Full DPA available on request, EU data residency option on Business+.",
              },
              {
                k: "CCPA / CPRA",
                v: "Privacy request flow at /settings/security → Privacy → Export / Delete.",
              },
              {
                k: "SOC 2 Type II",
                v: "In progress via a Big-4 auditor — target ETA in Trust Center.",
              },
              { k: "ISO 27001", v: "Controls mapped, certification on the roadmap." },
              { k: "HIPAA / PCI", v: "Not in scope — do not upload PHI or raw cardholder data." },
            ],
          },
        ],
      },
      {
        id: "subprocessors",
        title: "Subprocessors",
        icon: Layers,
        accent: BLUSH,
        intro:
          "Every third-party that may process customer data on Megsy's behalf is listed at /subprocessors with purpose and region.",
        blocks: [
          {
            kind: "ul",
            items: [
              "Supabase — primary database, auth, storage (EU / US).",
              "Cloudflare — CDN, DDoS protection, edge caching.",
              "Alibaba Cloud Model Studio — Qwen chat & image inference.",
              "OpenAI, Anthropic, Google, BFL, Recraft, ByteDance, Luma, Pixverse, Kling — optional model providers, only invoked when you pick that model.",
              "Polar.sh — billing, invoices, tax (Merchant of Record).",
              "Resend — transactional email (receipts, password reset).",
            ],
          },
          {
            kind: "note",
            text: "We publish material changes 30 days in advance — subscribe at /trust to get notified.",
          },
        ],
      },
      {
        id: "dpa",
        title: "Data Processing Agreement (DPA)",
        icon: ScrollText,
        accent: MINT,
        intro:
          "Pre-signed DPA available for any paying workspace on request — covers GDPR Art. 28, SCCs for international transfers, and our subprocessor commitments.",
        blocks: [
          {
            kind: "ol",
            items: [
              "Email legal@megsyai.com with your workspace name and billing email.",
              "Receive the counter-signed PDF within 2 business days.",
              "Optional: countersign your own DPA for review (we accept reasonable revisions).",
            ],
          },
        ],
      },
      {
        id: "dmca",
        title: "DMCA & IP takedowns",
        icon: ShieldAlert,
        accent: ACTION,
        intro:
          "Megsy respects intellectual property. If content generated or hosted on the platform infringes your rights, file a DMCA notice and we'll act within 48h.",
        blocks: [
          {
            kind: "ul",
            items: [
              "Send to: dmca@megsyai.com — include the work, the infringing URL, and a good-faith statement.",
              "Counter-notice window: 10 business days after takedown.",
              "Repeat-infringer policy: accounts with 3+ valid notices are terminated.",
            ],
          },
        ],
      },
      {
        id: "moderation",
        title: "Content moderation policy",
        icon: Eye,
        accent: BLUSH,
        intro:
          "Every image, video and chat output is screened in real time. Prohibited: CSAM, non-consensual intimate imagery, deepfakes of real people without consent, violent extremism, malware, KYC fraud.",
        blocks: [
          {
            kind: "ul",
            items: [
              "Image & video: NSFW classifier + face-likeness check on every generation.",
              "Chat: provider-side safety + Megsy override list for jailbreak patterns.",
              "User reports → reviewed within 24h. Three confirmed violations = permanent ban.",
            ],
          },
        ],
      },
      {
        id: "ai-disclaimer",
        title: "AI disclaimer",
        icon: Bot,
        accent: ACTION,
        intro: "Outputs from Megsy are AI-generated and may be wrong, biased, or out of date.",
        blocks: [
          {
            kind: "ul",
            items: [
              "Do not rely on Megsy for medical, legal or financial advice without a qualified professional review.",
              "Cite the sources Deep Research returns rather than the synthesized text.",
              "Generated images/videos may resemble real people, brands or copyrighted works — verify before publishing.",
            ],
          },
        ],
      },
      {
        id: "age-policy",
        title: "Age policy",
        icon: Lock,
        accent: MINT,
        intro:
          "Megsy AI is for users 13+ (16+ in the EEA, UK and parts of Asia). Adult/NSFW models are gated behind a self-declared 18+ acknowledgement stored in your profile.",
        blocks: [
          {
            kind: "ul",
            items: [
              "Under-13 (US) and under-16 (EEA/UK) accounts are not permitted.",
              "Age gate is shown the first time you open an adult-capable model.",
              "Workspace owners can disable adult models org-wide in /settings/workspace → Safety.",
            ],
          },
        ],
      },
      {
        id: "accessibility",
        title: "Accessibility (a11y)",
        icon: Globe2,
        accent: BLUSH,
        intro:
          "Megsy targets WCAG 2.2 AA. The whole product is keyboard-navigable, screen-reader labelled and respects reduced-motion preferences.",
        blocks: [
          {
            kind: "ul",
            items: [
              "All interactive elements ship with aria-labels.",
              "Color contrast verified for both light and dark themes.",
              "Captions auto-generated on every TTS / music output.",
              "Report an a11y bug: accessibility@megsyai.com — fixed-priority queue.",
            ],
          },
        ],
      },
    ],
  },

  /* ─────────────────── Auth & Security flows (deep) ─────────────────── */
  {
    id: "auth-flows-deep",
    label: "Auth & Security flows (deep)",
    sections: [
      {
        id: "oauth-authorize",
        title: "/oauth/authorize — Sign in with Megsy",
        icon: Shield,
        accent: ACTION,
        intro:
          "Third-party apps that want to read or act on your Megsy account redirect here. You see exactly which scopes they request before approving.",
        blocks: [
          { kind: "h", text: "What you'll see" },
          {
            kind: "ul",
            items: [
              "App name, logo, developer, and verification badge if registered.",
              "Granular scopes (read profile, read chats, run agents, manage workspace, etc.) — toggle off individual scopes you don't want to grant.",
              "Expiry & revocation — every grant is listed in /settings/security → Connected apps.",
            ],
          },
          {
            kind: "note",
            text: "Megsy never shares your password. Tokens are opaque, can be revoked anytime, and automatically expire after 90 days of inactivity.",
          },
        ],
      },
      {
        id: "mfa-challenge",
        title: "/mfa/challenge — Multi-factor sign-in",
        icon: ShieldCheck,
        accent: MINT,
        intro:
          "Triggered after password sign-in when MFA is enabled, or when signing in from a new device.",
        blocks: [
          {
            kind: "ul",
            items: [
              "TOTP (Google Authenticator, 1Password, Authy) — 6-digit code.",
              "Backup codes — single-use, stored encrypted; regenerate from /settings/security.",
              "Trust this device for 30 days — opt-in, per-device.",
            ],
          },
        ],
      },
      {
        id: "two-factor",
        title: "/auth/2fa — Enroll a second factor",
        icon: Shield,
        accent: ACTION,
        intro:
          "Setup wizard for MFA. Strongly recommended for all accounts; required on Business+ workspaces.",
        blocks: [
          {
            kind: "ol",
            items: [
              "Scan the QR code with your authenticator app.",
              "Confirm the first 6-digit code.",
              "Download the 10 backup codes — keep them offline.",
            ],
          },
        ],
      },
      {
        id: "change-email",
        title: "/auth/change-email — Update your sign-in email",
        icon: Pencil,
        accent: BLUSH,
        intro:
          "Two-step verified change: confirm old email, then confirm new email. Both inboxes get a notification.",
        blocks: [
          {
            kind: "ul",
            items: [
              "If you lose access to the old inbox, contact support@megsyai.com with proof of payment.",
              "Active sessions stay signed in; new logins use the new email.",
              "Workspace invitations sent to the old address remain valid for 14 days.",
            ],
          },
        ],
      },
      {
        id: "change-password",
        title: "/auth/change-password — Rotate your password",
        icon: Lock,
        accent: ACTION,
        intro:
          "Requires current password. All other sessions are signed out automatically after a successful change.",
        blocks: [
          {
            kind: "ul",
            items: [
              "Minimum 10 chars, at least one number and one symbol.",
              "Reused / breached passwords are rejected (HaveIBeenPwned check).",
              "Forgot it? Use /auth/reset-password — email link valid 1h.",
            ],
          },
        ],
      },
      {
        id: "delete-account",
        title: "/auth/delete-account — Permanently delete",
        icon: ShieldAlert,
        accent: BLUSH,
        intro: "Self-service hard delete. Type 'DELETE' to confirm. Runs the GDPR purge pipeline.",
        blocks: [
          {
            kind: "ul",
            items: [
              "Profile, chats, generations, uploads, memory and integrations: erased within 24h.",
              "Billing records & invoices: kept for 7 years (legal obligation).",
              "Active subscription is canceled and you're refunded any unused full months.",
              "Workspace owners must transfer or delete the workspace first.",
            ],
          },
        ],
      },
      {
        id: "accept-invite",
        title: "/auth/accept-invite — Join via email invite",
        icon: Gift,
        accent: MINT,
        intro:
          "Standard invitation flow used for shared chats, shared slides, and beta program access.",
        blocks: [
          {
            kind: "ul",
            items: [
              "Single-use signed link, expires in 14 days.",
              "Lands on signup if you don't have an account, then resumes the invite.",
              "Already signed in with a different email? You can switch or accept on the current account.",
            ],
          },
        ],
      },
      {
        id: "accept-workspace-invite",
        title: "/auth/accept-workspace-invite — Join a team",
        icon: Users,
        accent: ACTION,
        intro:
          "Workspace-level invite. Shows the inviter, the workspace name, your assigned role, and the MC pool you'll share.",
        blocks: [
          {
            kind: "ul",
            items: [
              "Roles: Owner · Admin · Member · Viewer — set by the inviter.",
              "Joining a workspace doesn't merge your personal MC; the workspace has its own pool.",
              "Leave anytime from /settings/workspace → Members.",
            ],
          },
        ],
      },
      {
        id: "referral-redirect",
        title: "/r/:code — Referral redirect",
        icon: Share2,
        accent: BLUSH,
        intro:
          "Short link that attributes the visitor to the referrer's code, then forwards to the marketing site (or a specific landing if the link carries ?to=).",
        blocks: [
          {
            kind: "ul",
            items: [
              "First-touch attribution stored in a 60-day cookie + server-side fingerprint.",
              "On signup, both sides receive the referral reward defined in /settings/referrals → Program.",
              "Fraud detection auto-voids self-referrals and duplicate IPs.",
            ],
          },
        ],
      },
    ],
  },

  /* ────────────────── Billing & Referral flows (deep) ────────────────── */
  {
    id: "billing-flows",
    label: "Billing & Referral flows",
    sections: [
      {
        id: "billing-success",
        title: "/billing/success — Post-checkout confirmation",
        icon: CheckCircle2,
        accent: MINT,
        intro:
          "Landing page after a successful Polar checkout. Verifies the checkout_id server-side, activates the plan, credits your MC pool, then redirects to /chat.",
        blocks: [
          {
            kind: "ul",
            items: [
              "Receipt is emailed within ~60 seconds.",
              "Bonus MC for annual plans are credited immediately and never expire while the subscription is active.",
              "If the page shows 'still processing' for >2 min, refresh — webhooks occasionally lag.",
            ],
          },
        ],
      },
      {
        id: "withdraw",
        title: "/billing/withdraw — Cash out referral earnings",
        icon: Wallet,
        accent: ACTION,
        intro:
          "Convert your accrued referral earnings to a real-money payout. Minimum threshold $25.",
        blocks: [
          {
            kind: "ul",
            items: [
              "Methods: PayPal, Wise, USDT (TRC-20), bank wire (≥ $200).",
              "Cleared after a 30-day reversal window from the referee's first payment.",
              "Tax form: W-9 (US) or W-8BEN (rest of world) is requested above $600/yr.",
              "Track every request at /billing/referrals → Withdrawals tab.",
            ],
          },
        ],
      },
      {
        id: "referral-resources",
        title: "/billing/referral-resources — Creator kit",
        icon: PaintBucket,
        accent: BLUSH,
        intro:
          "Ready-to-post assets for influencers: vertical videos, square posts, banners, demo GIFs, copy in 25 languages.",
        blocks: [
          {
            kind: "ul",
            items: [
              "Every asset is pre-tagged with your referral code — just download and post.",
              "Megsy-branded video templates (faceswap, talking, problem/solution) you can remix.",
              "UTM-prepared link generator for each platform (TikTok, IG Reels, YouTube Shorts, X).",
            ],
          },
        ],
      },
      {
        id: "referrals-dashboard",
        title: "/billing/referrals — Dashboard tab",
        icon: LayoutGrid,
        accent: MINT,
        intro:
          "Top-level view of your referral business: clicks, signups, paid conversions, lifetime earnings, tier progress.",
        blocks: [
          {
            kind: "ul",
            items: [
              "Real-time chart (last 30 / 90 / 365 days).",
              "Geo + source breakdown — see which platform converts best.",
              "Tier ladder: more MC + higher % as you cross each milestone.",
            ],
          },
        ],
      },
      {
        id: "referrals-program",
        title: "/billing/referrals — Program tab",
        icon: Crown,
        accent: ACTION,
        intro:
          "The current commission structure. Updated centrally — your existing referrals are always paid at the rate at which they signed up (no retroactive cuts).",
        blocks: [
          {
            kind: "kv",
            rows: [
              { k: "Tier 1 (0–9 paid)", v: "20% recurring + 240 MC bonus per signup" },
              { k: "Tier 2 (10–49)", v: "25% recurring + 480 MC" },
              { k: "Tier 3 (50+)", v: "30% recurring + 1,200 MC + dedicated AM" },
            ],
          },
        ],
      },
      {
        id: "referrals-tasks",
        title: "/billing/referrals — Tasks tab",
        icon: ListTree,
        accent: BLUSH,
        intro:
          "Bite-size MC bounties: follow Megsy on X/IG/YT, post a review, invite 3 friends, etc. Managed live from the Telegram admin bot.",
        blocks: [
          {
            kind: "ul",
            items: [
              "Auto-verified where possible (OAuth follow checks).",
              "Manual tasks require a screenshot — reviewed within 24h.",
              "Rewards land in your MC balance instantly on approval.",
            ],
          },
        ],
      },
      {
        id: "referrals-withdrawals",
        title: "/billing/referrals — Withdrawals tab",
        icon: Receipt,
        accent: MINT,
        intro:
          "Lifetime history of every payout request with status (pending · processing · paid · rejected) and transaction proof when available.",
        blocks: [
          {
            kind: "ul",
            items: [
              "Filter by year for tax season.",
              "Export to CSV / PDF.",
              "Rejected requests show the reason and how to fix it.",
            ],
          },
        ],
      },
      {
        id: "influencer-grant",
        title: "Influencer Pro grant (1 month, manual)",
        icon: Gift,
        accent: ACTION,
        intro:
          "Megsy admins can manually activate a 1-month Pro subscription for vetted influencers from the Telegram admin bot — no card, no auto-renewal.",
        blocks: [
          {
            kind: "ol",
            items: [
              "Admin opens the Megsy bot in Telegram → main menu → 🎁 Grant Pro to influencer (1 month).",
              "Admin pastes the influencer's signup email.",
              "Bot activates plan = pro, status = active, current_period_end = +30 days, then notifies the admin channel.",
            ],
          },
          {
            kind: "note",
            text: "Strictly one-off. The subscription expires automatically after 30 days unless renewed manually.",
          },
        ],
      },
    ],
  },

  /* ───────────────── Settings details (the missing ones) ───────────────── */
  {
    id: "settings-detail",
    label: "Settings — page by page",
    sections: [
      {
        id: "system-status",
        title: "/settings/system-status — Live service health",
        icon: BadgeCheck,
        accent: MINT,
        intro:
          "Real-time status (Operational · Degraded · Outage) for every Megsy service, plus a public RSS feed and email subscribers list.",
        blocks: [
          {
            kind: "ul",
            items: [
              "Services tracked: Chat, Image, Video, Slides, Docs, Research, Code, Voice, Music, Operator, Builder, API, Integrations, Payments, Auth.",
              "Incidents kept for 12 months with root-cause notes.",
              "Subscribe via email or webhook for instant updates.",
            ],
          },
        ],
      },
      {
        id: "switch-account",
        title: "/settings/switch-account — Multi-account switcher",
        icon: Users,
        accent: ACTION,
        intro:
          "Sign into multiple Megsy accounts on the same browser and switch with one click — like Gmail's account picker.",
        blocks: [
          {
            kind: "ul",
            items: [
              "Up to 5 accounts cached per browser.",
              "Each account keeps its own MC, workspaces, chat history.",
              "Sign out of one without affecting the others.",
            ],
          },
        ],
      },
      {
        id: "skills-new-vs-list",
        title: "Skills — New vs Library",
        icon: Wand2,
        accent: BLUSH,
        intro:
          "Two pages, one feature. /settings/skills/new is the builder, /settings/skills is the library of everything you've built (and what your workspace has shared).",
        blocks: [
          {
            kind: "kv",
            rows: [
              {
                k: "/settings/skills/new",
                v: "Visual builder: pick a base model, write a system prompt, enable tools, set the slash trigger, optionally upload reference files.",
              },
              {
                k: "/settings/skills",
                v: "List + filter + duplicate + share. Workspace owners see all org skills; members see their own + shared.",
              },
            ],
          },
        ],
      },
      {
        id: "settings-contact",
        title: "/settings/contact — Contact info",
        icon: MessageSquare,
        accent: ACTION,
        intro:
          "Manage the contact email and phone shown on invoices and used for security-critical notifications (login alerts, password reset).",
        blocks: [
          {
            kind: "ul",
            items: [
              "Separate from your sign-in email — useful for ops aliases.",
              "Phone is opt-in and only used for high-severity security alerts.",
            ],
          },
        ],
      },
      {
        id: "settings-help",
        title: "/settings/help — Self-serve help",
        icon: HelpCircle,
        accent: MINT,
        intro:
          "Curated index of the 30 most-asked questions plus a deep link into /docs and a button to open the AI support chat.",
        blocks: [
          {
            kind: "ul",
            items: [
              "Search is the same engine as /docs.",
              "Most issues resolve in <60s without contacting support.",
            ],
          },
        ],
      },
      {
        id: "settings-support",
        title: "/settings/support — Talk to a human (AI-first)",
        icon: Bell,
        accent: ACTION,
        intro:
          "Opens the in-app support thread. Megsy Support AI answers instantly; if it can't, it escalates to a human within the SLA of your plan.",
        blocks: [
          {
            kind: "kv",
            rows: [
              { k: "Starter / Pro", v: "Human reply within 24h." },
              { k: "Elite / Business", v: "Within 8h, business days." },
              { k: "Enterprise", v: "Within 1h, 24/7, dedicated AM." },
            ],
          },
        ],
      },
      {
        id: "settings-privacy",
        title: "/settings/privacy — Your data, your rules",
        icon: Lock,
        accent: BLUSH,
        intro: "One-click controls for the GDPR/CCPA rights and the training-opt-out toggle.",
        blocks: [
          {
            kind: "ul",
            items: [
              "Export everything (JSON + media zip) — emailed within 24h.",
              "Delete all chats, generations, memory — irreversible.",
              "Opt out of model training on your data — on by default for Pro+.",
              "Manage cookies & analytics consent.",
            ],
          },
        ],
      },
    ],
  },

  /* ──────────────────── Marketing pages — deep dives ──────────────────── */
  {
    id: "marketing-detail",
    label: "Marketing pages — deep dives",
    sections: [
      {
        id: "about-deep",
        title: "/about — The story & the team",
        icon: BookOpen,
        accent: MINT,
        intro:
          "Why Megsy exists, the founding team, the timeline, and the numbers (36+ engines, 25 languages, 24/7 support).",
        blocks: [
          {
            kind: "ul",
            items: [
              "Mission, values, and the 5-year roadmap.",
              "Investor & advisor list.",
              "Press kit (logos, screenshots, founder bios) — direct download.",
            ],
          },
        ],
      },
      {
        id: "egypt-page",
        title: "/egypt — Local launch page (Arabic + EGP)",
        icon: MapPin,
        accent: ACTION,
        intro:
          "Region-tuned landing for Egypt: full Arabic copy, prices in EGP, local payment options (Fawry, InstaPay, Vodafone Cash), and an influencer leaderboard.",
        blocks: [
          {
            kind: "ul",
            items: [
              "Arabic-first design with RTL throughout.",
              "Local case studies and creator highlights.",
              "Direct WhatsApp support button for Egyptian customers.",
            ],
          },
        ],
      },
      {
        id: "features-guide-deep",
        title: "/features — Full features guide",
        icon: LayoutGrid,
        accent: BLUSH,
        intro:
          "The master grid of every product surface (Chat, Images, Video, Slides, Docs, Research, Code, Websites, Operator, Music, Voice, Learning) with what it does, who it's for, what it costs.",
        blocks: [
          {
            kind: "ul",
            items: [
              "Each tile deep-links to its dedicated landing page.",
              "Side-by-side capability matrix vs. ChatGPT, Claude, Gemini, Perplexity.",
              "Live demo videos auto-play on hover (respect prefers-reduced-motion).",
            ],
          },
        ],
      },
      {
        id: "comparison-deep",
        title: "/vs/* — Comparison pages",
        icon: ListTree,
        accent: ACTION,
        intro:
          "SEO-optimised head-to-head pages: Megsy vs ChatGPT, vs Claude, vs Gemini, vs Perplexity, vs Midjourney, vs Sora, vs Canva AI, vs Notion AI, vs v0, vs Cursor and more.",
        blocks: [
          {
            kind: "ul",
            items: [
              "Feature matrix with verified-as-of dates.",
              "Pricing comparison (per-MC vs per-message vs per-seat).",
              "Switching guide — how to move chats / memory / settings to Megsy.",
            ],
          },
        ],
      },
      {
        id: "service-landing-deep",
        title: "/ai/* — Service landing pages",
        icon: Rocket,
        accent: MINT,
        intro:
          "Single-purpose, SEO-targeted landings: AI image generator, AI video generator, AI slides maker, AI website builder, AI deep research, AI agent runner, etc.",
        blocks: [
          {
            kind: "ul",
            items: [
              "Each landing has a hero demo, model picker preview, sample outputs gallery, FAQs, and a one-click CTA.",
              "Schema.org SoftwareApplication markup for rich snippets.",
              "Auto-translated into 25 languages and indexed per /docs i18n sitemap.",
            ],
          },
        ],
      },
      {
        id: "blog-post-ux",
        title: "/blog/:slug — Reading experience",
        icon: ScrollText,
        accent: BLUSH,
        intro:
          "Article layout tuned for long-form reading: serif body, generous line-height, sticky TOC, reading-progress bar, copy-link on each heading.",
        blocks: [
          {
            kind: "ul",
            items: [
              "Auto-translated to 25 languages — language switcher in the header.",
              "Code blocks with copy button + syntax highlighting.",
              "Related posts at the end based on tag + embedding similarity.",
              "Comment via the linked X / LinkedIn thread (no native comments).",
            ],
          },
        ],
      },
    ],
  },
];

/* ────────────── ⭐ AUTO-GENERATED GROUPS (live from data files) ────────────── */
// These groups are rebuilt from the live data on every page render. Any change
// to /data/pricingData, /data/blogPosts, /data/comparisons, /data/serviceLandings
// or /lib/agentRegistry shows up here immediately — zero manual edits.

async function buildAutoGroups(): Promise<DocGroup[]> {
  // The three biggest reference tables (~4 KLOC combined) load in parallel
  // AFTER DocsPage mounts, so they never enter the initial /docs bundle.
  const [
    { SERVICE_LANDINGS },
    { integrations: INTEGRATIONS_LIST, INTEGRATION_CATEGORIES },
    { SLIDES_TEMPLATES },
  ] = await Promise.all([
    import("@/data/serviceLandings"),
    import("@/lib/integrationsData"),
    import("@/lib/slidesTemplates"),
  ]);

  // — Plans (auto from PLANS) —
  const planRows = PLANS.map((p) => ({
    k: `${p.name} — $${p.monthlyPrice}/mo · $${p.yearlyPrice}/yr`,
    v: `${p.monthlyCredits} · ${p.yearlyCredits}. ${p.features.slice(0, 3).join(" · ")}…`,
  }));

  const creditsRows = (Object.entries(PLAN_MONTHLY_CREDITS) as [string, number][]).map(
    ([tier, mc]) => ({ k: tier.toUpperCase(), v: `${mc} MC included every month` }),
  );

  // — Agents (auto from AGENTS registry) —
  const agentSections: DocSection[] = AGENTS.map((a) => ({
    id: `agent-${a.id}`,
    title: `${a.label} — ${a.mention}`,
    icon: a.icon,
    accent: a.category === "images" ? BLUSH : a.category === "videos" ? ACTION : MINT,
    intro: a.description,
    blocks:
      a.models && a.models.length > 0
        ? [
            { kind: "h", text: "Available models & MC cost per generation" },
            {
              kind: "kv",
              rows: a.models.map((m) => ({
                k: m.label,
                v:
                  m.cost === 0
                    ? "Free — counts against your plan’s usage cap."
                    : `${m.cost} MC per run`,
              })),
            },
            {
              kind: "note",
              text: `Trigger inside any chat with ${a.mention} or pick it from the Mode Bar.`,
            },
          ]
        : [
            {
              kind: "p",
              text: `Trigger from the composer Mode Bar or by typing ${a.mention} in chat. Category: ${a.category}.`,
            },
          ],
  }));

  // — Blog posts (auto from BLOG_POSTS) —
  const blogRows = BLOG_POSTS.map((p) => ({
    k: `/blog/${p.slug}`,
    v: `${p.title} — ${p.category} · ${p.readTime}.`,
  }));

  // — Comparisons (auto from COMPARISONS) —
  const compareRows = COMPARISONS.map((c) => ({
    k: `/vs/${c.slug}`,
    v: `Megsy vs ${c.competitorName} — ${c.competitorTagline}.`,
  }));

  // — Service landings (auto from SERVICE_LANDINGS) —
  // Group by category for readability.
  const landingsByCategory = SERVICE_LANDINGS.reduce<Record<string, typeof SERVICE_LANDINGS>>(
    (acc, l) => {
      (acc[l.category] ||= []).push(l);
      return acc;
    },
    {},
  );
  const landingsBlocks: DocBlock[] = [];
  for (const [cat, items] of Object.entries(landingsByCategory)) {
    landingsBlocks.push({ kind: "h", text: `${cat} (${items.length})` });
    landingsBlocks.push({
      kind: "kv",
      rows: items.slice(0, 40).map((l) => ({
        k: `/${l.slug}${l.locale && l.locale !== "en" ? ` · ${l.locale.toUpperCase()}` : ""}`,
        v: l.title,
      })),
    });
  }

  // — Pages (auto-detected & described via docsRegistry) —
  // Adding a new page anywhere under src/pages automatically appears here.
  // Add `/** @doc Short description */` at the top of the file for a rich
  // human-readable summary.
  const pagesByFolder = groupPagesByFolder();
  const pagesBlocks: DocBlock[] = [];
  for (const [folder, items] of Object.entries(pagesByFolder).sort()) {
    pagesBlocks.push({ kind: "h", text: `${folder} (${items.length} pages)` });
    pagesBlocks.push({
      kind: "kv",
      rows: items.map((p) => ({ k: p.id, v: p.description })),
    });
  }

  // — Edge functions (auto-detected & described via docsRegistry) —
  const edgeFnBlocks: DocBlock[] = [
    {
      kind: "kv",
      rows: DOC_EDGE_FUNCTIONS.map((fn) => ({ k: fn.id, v: fn.description })),
    },
  ];

  // — Integrations / connectors (auto from integrationsData) —
  const integrationsByCategory = INTEGRATIONS_LIST.reduce<Record<string, typeof INTEGRATIONS_LIST>>(
    (acc, i) => {
      (acc[i.category] ||= []).push(i);
      return acc;
    },
    {},
  );
  const integrationsBlocks: DocBlock[] = [];
  for (const [cat, items] of Object.entries(integrationsByCategory).sort()) {
    integrationsBlocks.push({ kind: "h", text: `${cat} (${items.length})` });
    integrationsBlocks.push({
      kind: "kv",
      rows: items.map((i) => ({ k: i.name, v: `${i.description} — type: ${i.type}` })),
    });
  }

  return [
    {
      id: "live-pricing",
      label: "Live pricing & FAQ (auto-sync)",
      sections: [
        {
          id: "live-plans",
          title: "Live plans — pulled directly from /pricing",
          icon: Crown,
          accent: ACTION,
          intro: `Updated automatically from src/data/pricingData.ts. ${PLANS.length} paid plans available right now.`,
          blocks: [
            { kind: "kv", rows: planRows },
            { kind: "h", text: "Monthly MC grant per tier" },
            { kind: "kv", rows: creditsRows },
            { kind: "link", href: "/pricing", label: "Open live pricing page →" },
          ],
        },
        {
          id: "live-services",
          title: "What each capability includes",
          icon: Layers,
          accent: MINT,
          intro: "Source of truth: SERVICES_GUIDE. Stays in sync forever.",
          blocks: [
            {
              kind: "kv",
              rows: SERVICES_GUIDE.map((s) => ({ k: s.name, v: s.desc })),
            },
          ],
        },
        {
          id: "live-enterprise",
          title: "Enterprise features",
          icon: Building2,
          accent: BLUSH,
          intro: "Auto-synced list of everything Enterprise customers get on top of Business.",
          blocks: [
            { kind: "ul", items: ENTERPRISE_FEATURES },
            { kind: "link", href: "/enterprise", label: "Talk to sales →" },
          ],
        },
        {
          id: "live-faq",
          title: "Frequently asked questions (verbatim from /pricing)",
          icon: HelpCircle,
          accent: ACTION,
          intro: `${FAQS.length} official Q&As — the only authoritative source.`,
          blocks: FAQS.flatMap<DocBlock>((f) => [
            { kind: "h", text: f.q },
            { kind: "p", text: f.a },
          ]),
        },
        {
          id: "live-referrals",
          title: "Referral program — exact verified numbers",
          icon: Gift,
          accent: MINT,
          intro: "These numbers come directly from the running app code — never out of date.",
          blocks: [
            {
              kind: "kv",
              rows: [
                { k: "Per signup (both sides)", v: `${CREDITS_PER_SIGNUP} MC` },
                {
                  k: "Lifetime cash commission",
                  v: `${COMMISSION_PCT}% of every payment your referral ever makes`,
                },
                { k: "Minimum payout", v: `$${MIN_PAYOUT}` },
                {
                  k: "Dashboard",
                  v: "/settings/referrals (tabs: Dashboard, Program, Tasks, Withdrawals)",
                },
                { k: "Marketing kit", v: "/settings/referrals/resources" },
                { k: "Withdraw", v: "/settings/withdraw" },
              ],
            },
            {
              kind: "note",
              text: "Only the numbers above are real. Ignore any other figure you may see elsewhere.",
            },
          ],
        },
      ],
    },
    {
      id: "live-agents",
      label: `Agents catalog (${AGENTS.length} — auto-sync)`,
      sections: [
        {
          id: "agents-overview-live",
          title: `Every agent on Megsy (${AGENTS.length})`,
          icon: Bot,
          accent: ACTION,
          intro:
            "Auto-generated from the live agent registry. Mention an agent with @name from the composer, or tap its chip in the Mode Bar.",
          blocks: [
            {
              kind: "kv",
              rows: AGENTS.map((a) => ({ k: `${a.mention}`, v: `${a.label} — ${a.description}` })),
            },
          ],
        },
        ...agentSections,
      ],
    },
    {
      id: "live-content",
      label: "Content index (auto-sync)",
      sections: [
        {
          id: "live-blog",
          title: `Blog — ${BLOG_POSTS.length} long-form posts indexed`,
          icon: BookOpen,
          accent: ACTION,
          intro:
            "Plus 3 fresh AI-published articles per day at /blog, auto-translated into every supported language.",
          blocks: [
            { kind: "kv", rows: blogRows },
            { kind: "link", href: "/blog", label: "Open the blog →" },
          ],
        },
        {
          id: "live-comparisons",
          title: `Comparisons — Megsy vs ${COMPARISONS.length} tools`,
          icon: LayoutGrid,
          accent: MINT,
          intro: "Honest head-to-head comparisons — auto-listed from /data/comparisons.ts.",
          blocks: [{ kind: "kv", rows: compareRows }],
        },
        {
          id: "live-landings",
          title: `Service & feature landings — ${SERVICE_LANDINGS.length} pages`,
          icon: Sparkles,
          accent: BLUSH,
          intro:
            "Dedicated SEO landings for every capability and locale. Auto-grouped by category from /data/serviceLandings.ts.",
          blocks: landingsBlocks,
        },
      ],
    },
    {
      id: "live-surface",
      label: `Site surface (${DOC_REGISTRY_STATS.pageCount} pages · ${DOC_REGISTRY_STATS.edgeFunctionCount} functions — auto-detected)`,
      sections: [
        {
          id: "live-pages",
          title: `Every page on the site — ${DOC_REGISTRY_STATS.pageCount} detected`,
          icon: ListTree,
          accent: ACTION,
          intro:
            "Auto-discovered at build time via Vite glob over src/pages/**. Each row shows the file path and a one-line description parsed from the page's leading `/** @doc ... */` comment. New pages appear automatically — adding a `@doc` tag gives a richer summary, but pages without one still show up with a humanized fallback so nothing ever silently disappears.",
          blocks: pagesBlocks,
        },
        {
          id: "live-edge-fns",
          title: `Backend edge functions — ${DOC_REGISTRY_STATS.edgeFunctionCount} detected`,
          icon: Cpu,
          accent: MINT,
          intro:
            "Auto-discovered from supabase/functions/**. These run on the server (Deno runtime) for chat streaming, media generation, payments, blog publishing, OAuth, GitHub push, sitemap, and more. Descriptions are pulled from each function's `/** @doc ... */` header — add one to give the function a human-readable summary here.",
          blocks: edgeFnBlocks,
        },
        {
          id: "live-integrations",
          title: `Connectors & integrations — ${INTEGRATIONS_LIST.length} apps across ${INTEGRATION_CATEGORIES.length - 1} categories`,
          icon: Link2,
          accent: BLUSH,
          intro:
            "Auto-synced from src/lib/integrationsData.ts. Add a connector there and it appears here instantly, grouped by category, with its type (OAuth, notification, service, or Pipedream-powered) and description.",
          blocks: integrationsBlocks,
        },
        {
          id: "live-slides-templates",
          title: `Slides templates — ${SLIDES_TEMPLATES.length} available`,
          icon: Presentation,
          accent: ACTION,
          intro:
            "Every slide-deck template registered in src/lib/slidesTemplates.ts. Premium HTML templates (interactive 3D, animated) and standard print-friendly templates are auto-listed with their category.",
          blocks: [
            {
              kind: "kv",
              rows: SLIDES_TEMPLATES.map((t) => ({
                k: t.id,
                v: `${t.name || t.id} — ${t.category}${t.description ? ` · ${t.description}` : ""}`,
              })),
            },
          ],
        },
        {
          id: "live-skills",
          title: `Skill tools & models — ${SKILL_TOOLS.length} tools · ${SKILL_MODELS.length} models`,
          icon: Wand2,
          accent: MINT,
          intro:
            "Auto-synced catalog of every tool a custom Skill can call, and every base model a Skill can be wired to. Source of truth: src/lib/skillTools.ts.",
          blocks: [
            { kind: "h", text: "Tools available to skills" },
            {
              kind: "kv",
              rows: SKILL_TOOLS.map((t) => ({ k: t.name, v: `${t.label} — ${t.description}` })),
            },
            { kind: "h", text: "Base models available to skills" },
            { kind: "kv", rows: SKILL_MODELS.map((m) => ({ k: m.id, v: m.label })) },
          ],
        },
      ],
    },
    {
      id: "live-changelog",
      label: "Changelog (auto-sync)",
      sections: CHANGELOG.map((entry, i) => ({
        id: `changelog-${entry.date}-${i}`,
        title: `${entry.date} · ${entry.title}`,
        icon:
          entry.tag === "fixed"
            ? Wrench
            : entry.tag === "security"
              ? ShieldAlert
              : entry.tag === "improved"
                ? RefreshCw
                : PlusCircle,
        accent:
          entry.tag === "fixed"
            ? BLUSH
            : entry.tag === "security"
              ? ACTION
              : entry.tag === "improved"
                ? MINT
                : ACTION,
        intro: entry.tag ? `Tag: ${entry.tag.toUpperCase()}` : undefined,
        blocks: [{ kind: "ul" as const, items: entry.bullets }],
      })),
    },
  ];
}

// GROUPS is now built at component mount from STATIC_GROUPS + async
// buildAutoGroups(). The prose renders immediately; the auto-generated
// reference tables fill in a beat later once their data chunks load.

/* ───────────────────────── Page ───────────────────────── */

const SectionFallback = () => (
  <div className="min-h-[200px] w-full px-4 py-16 mx-auto max-w-7xl">
    <div className="h-8 w-48 rounded-md bg-foreground/[0.04] animate-pulse mb-6" />
  </div>
);

export default function DocsPage() {
  const params = useParams<{ lang?: string; groupId?: string; sectionId?: string }>();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // Build GROUPS at mount: prose is available immediately, auto-generated
  // reference tables append after their data chunks resolve.
  const [GROUPS, setGROUPS] = useState<DocGroup[]>(STATIC_GROUPS);
  useEffect(() => {
    let cancelled = false;
    void buildAutoGroups().then((auto) => {
      if (!cancelled) setGROUPS([...STATIC_GROUPS, ...auto]);
    });
    return () => {
      cancelled = true;
    };
  }, []);


  // Resolve the active locale. If the URL contains an unknown :lang segment
  // we treat it as part of the path (default = English).
  const activeLang = useMemo(() => {
    const storedLang = typeof window !== "undefined" ? getUserLang() : "en";
    const code = params.lang && getSiteLang(params.lang) ? params.lang! : storedLang;
    return code;
  }, [params.lang]);
  const langDir = getSiteLang(activeLang)?.dir ?? "ltr";
  const pathPrefix = langPrefix(activeLang); // "" for en, "/{code}" otherwise

  // Resolve the active group from the URL (defaults to the first group).
  const currentGroup = useMemo(
    () => GROUPS.find((g) => g.id === params.groupId) ?? GROUPS[0],
    [params.groupId],
  );
  const [activeId, setActiveId] = useState<string>(
    () => params.sectionId || currentGroup.sections[0]?.id || GROUPS[0].sections[0].id,
  );

  // ── Auto-translation (Qwen-Max via DashScope, cached in i18n_translations) ──
  // We translate the navigation-level strings for ALL groups (so the sidebar &
  // page header are localized) plus the active group's section titles+intros.
  // Body blocks remain in English for now (translated lazily as the user
  // navigates — keeps the first paint fast and cost bounded).
  const i18nEntries = useMemo(() => {
    const entries: Array<{ key: string; value: unknown }> = [];
    for (const g of GROUPS) {
      entries.push({ key: `docs:group:${g.id}:label`, value: g.label });
      for (const s of g.sections) {
        entries.push({ key: `docs:section:${g.id}:${s.id}:title`, value: s.title });
        if (s.intro) {
          entries.push({ key: `docs:section:${g.id}:${s.id}:intro`, value: s.intro });
        }
      }
    }
    return entries;
  }, []);
  const { t } = useI18nTranslations({
    namespace: "docs",
    language: activeLang,
    entries: i18nEntries,
  });
  const tGroupLabel = (g: { id: string; label: string }) =>
    t<string>(`docs:group:${g.id}:label`, g.label);
  const tSectionTitle = (gid: string, s: { id: string; title: string }) =>
    t<string>(`docs:section:${gid}:${s.id}:title`, s.title);
  const tSectionIntro = (gid: string, s: { id: string; intro?: string }) =>
    s.intro ? t<string>(`docs:section:${gid}:${s.id}:intro`, s.intro) : undefined;

  // Flat ordered list of every section across every group — used for prev/next.
  const flatSections = useMemo(
    () => GROUPS.flatMap((g) => g.sections.map((s) => ({ group: g, section: s }))),
    [],
  );

  // When the route's group changes, scroll the page to the top so each
  // group feels like its own dedicated docs page (Stripe/Linear style).
  useEffect(() => {
    if (params.sectionId) return; // section-specific scroll handled below
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [currentGroup.id, params.sectionId]);

  const filteredGroups = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return GROUPS;
    return GROUPS.map((g) => ({
      ...g,
      sections: g.sections.filter((s) => {
        if (s.title.toLowerCase().includes(q)) return true;
        if ((s.intro || "").toLowerCase().includes(q)) return true;
        return s.blocks.some((b) => {
          if (b.kind === "p" || b.kind === "note" || b.kind === "code" || b.kind === "h")
            return b.text.toLowerCase().includes(q);
          if (b.kind === "ul" || b.kind === "ol")
            return b.items.some((i) => i.toLowerCase().includes(q));
          if (b.kind === "kv")
            return b.rows.some(
              (r) => r.k.toLowerCase().includes(q) || r.v.toLowerCase().includes(q),
            );
          if (b.kind === "link") return b.label.toLowerCase().includes(q);
          return false;
        });
      }),
    })).filter((g) => g.sections.length > 0);
  }, [query]);

  // Flat list of matched sections (for the live dropdown + result count).
  const matchedFlat = useMemo(() => {
    if (!query.trim())
      return [] as Array<{
        groupId: string;
        groupLabel: string;
        sectionId: string;
        sectionTitle: string;
      }>;
    const out: Array<{
      groupId: string;
      groupLabel: string;
      sectionId: string;
      sectionTitle: string;
    }> = [];
    for (const g of filteredGroups) {
      for (const s of g.sections) {
        out.push({ groupId: g.id, groupLabel: g.label, sectionId: s.id, sectionTitle: s.title });
      }
    }
    return out;
  }, [filteredGroups, query]);
  const matchCount = matchedFlat.length;
  const [searchFocused, setSearchFocused] = useState(false);

  // ⌘K / Ctrl+K — focus search from anywhere.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isK = e.key === "k" || e.key === "K";
      if (isK && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }
      if (e.key === "Escape" && document.activeElement === searchInputRef.current) {
        (document.activeElement as HTMLElement).blur();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Deep-link via /docs/:groupId/:sectionId — scroll the target into view.
  useEffect(() => {
    const targetId = params.sectionId || (params.groupId ? `group-${params.groupId}` : null);
    if (!targetId) return;
    // Wait one frame for the DOM to render.
    const id = requestAnimationFrame(() => {
      const el = document.getElementById(targetId);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    return () => cancelAnimationFrame(id);
  }, [params.groupId, params.sectionId]);

  // Scroll-spy for the sidebar TOC.
  useEffect(() => {
    const ids = GROUPS.flatMap((g) => g.sections.map((s) => s.id));
    const handler = (entries: IntersectionObserverEntry[]) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible[0]?.target.id) setActiveId(visible[0].target.id);
    };
    const io = new IntersectionObserver(handler, { rootMargin: "-30% 0px -55% 0px", threshold: 0 });
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [filteredGroups]);

  // When the user is searching, show every matching group; otherwise only
  // render the current group as its own dedicated page (Stripe-style).
  const displayedGroups = useMemo(
    () => (query.trim() ? filteredGroups : filteredGroups.filter((g) => g.id === currentGroup.id)),
    [query, filteredGroups, currentGroup.id],
  );

  // Index of the current group (for top-level Prev / Next page nav).
  const currentGroupIdx = GROUPS.findIndex((g) => g.id === currentGroup.id);
  const prevGroup = currentGroupIdx > 0 ? GROUPS[currentGroupIdx - 1] : null;
  const nextGroup =
    currentGroupIdx >= 0 && currentGroupIdx < GROUPS.length - 1
      ? GROUPS[currentGroupIdx + 1]
      : null;

  // ── Per-group SEO (title, description, canonical, JSON-LD) ──────────────
  // Each /docs/:groupId becomes its own indexable, deep-linkable page with a
  // unique <title>, <meta description>, canonical, TechArticle JSON-LD and
  // BreadcrumbList JSON-LD — so Google can index every section of the docs
  // separately and surface rich results in SERP.
  const isDocsRoot = !params.groupId;
  const SITE_URL = "https://megsyai.com";
  // Canonical English path (used as x-default + the hreflang="en" alternate).
  const enPath = isDocsRoot ? "/docs" : `/docs/${currentGroup.id}`;
  // The current locale's path — also used for canonical of this page.
  const groupPath = `${pathPrefix}${enPath}`;
  const localizedGroupLabel = tGroupLabel(currentGroup);
  const groupTitle = isDocsRoot
    ? activeLang === "en"
      ? "Megsy AI Docs — The Complete Product Guide & PWA Install"
      : `Megsy AI Docs · ${getSiteLang(activeLang)?.nativeName ?? activeLang}`
    : `${localizedGroupLabel} — Megsy AI Docs`;
  const groupDescription = isDocsRoot
    ? "The complete Megsy AI documentation: every feature, every agent, every setting, every page — explained in full. Plus step-by-step PWA install for iPhone, Android, Mac, Windows and Linux."
    : `${localizedGroupLabel} in Megsy AI: ${currentGroup.sections
        .slice(0, 4)
        .map((s) => tSectionTitle(currentGroup.id, s))
        .join(
          " · ",
        )}${currentGroup.sections.length > 4 ? ` and ${currentGroup.sections.length - 4} more sections` : ""}. Part of the full Megsy AI documentation.`;

  const breadcrumbsLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Docs", item: `${SITE_URL}${pathPrefix}/docs` },
      ...(isDocsRoot
        ? []
        : [
            {
              "@type": "ListItem",
              position: 3,
              name: localizedGroupLabel,
              item: `${SITE_URL}${groupPath}`,
            },
          ]),
    ],
  };

  const techArticleLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: groupTitle,
    description: groupDescription,
    inLanguage: activeLang,
    url: `${SITE_URL}${groupPath}`,
    isPartOf: { "@type": "WebSite", name: "Megsy AI", url: SITE_URL },
    author: { "@type": "Organization", name: "Megsy AI", url: SITE_URL },
    publisher: { "@type": "Organization", name: "Megsy AI", url: SITE_URL },
    hasPart: currentGroup.sections.map((s) => ({
      "@type": "WebPageElement",
      name: tSectionTitle(currentGroup.id, s),
      url: `${SITE_URL}${groupPath}/${s.id}`,
    })),
  };

  // FAQPage JSON-LD — emitted whenever the current group contains FAQ Q&A
  // pairs. Wins rich "People also ask" snippets in Google SERP.
  const faqLd = (() => {
    const faqPairs: { q: string; a: string }[] = [];
    for (const s of currentGroup.sections) {
      const blocks = s.blocks as Array<{ kind: string; text?: string }>;
      for (let i = 0; i < blocks.length - 1; i++) {
        const cur = blocks[i];
        const nxt = blocks[i + 1];
        if (cur.kind === "h" && nxt.kind === "p" && cur.text && nxt.text && /\?/.test(cur.text)) {
          faqPairs.push({ q: cur.text, a: nxt.text });
        }
      }
    }
    if (faqPairs.length === 0) return null;
    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqPairs.slice(0, 30).map((p) => ({
        "@type": "Question",
        name: p.q,
        acceptedAnswer: { "@type": "Answer", text: p.a },
      })),
    };
  })();

  return (
    <div className="min-h-dvh" style={{ backgroundColor: INK, color: PARCHMENT }}>
      <SEOHead title={groupTitle} description={groupDescription} path={groupPath} />
      <Helmet>
        <html lang={activeLang} dir={langDir} />
        {/* Full hreflang matrix — one alternate per supported locale, plus
            x-default pointing at the English version. Tells Google to serve
            each user the docs in their own language. */}
        {SITE_LANGS.map((l) => {
          const prefix = l.code === "en" ? "" : `/${l.code}`;
          return (
            <link
              key={l.code}
              rel="alternate"
              hrefLang={l.code}
              href={`${SITE_URL}${prefix}${enPath}`}
            />
          );
        })}
        <link rel="alternate" hrefLang="x-default" href={`${SITE_URL}${enPath}`} />
        <script type="application/ld+json">{JSON.stringify(breadcrumbsLd)}</script>
        <script type="application/ld+json">{JSON.stringify(techArticleLd)}</script>
        {faqLd && <script type="application/ld+json">{JSON.stringify(faqLd)}</script>}
      </Helmet>
      <ReadingProgressBar />
      <LandingNavbar />

      {/* Hero — cartoon sticker style */}
      <header className="relative px-4 pt-28 pb-10 mx-auto max-w-7xl">
        <div
          className="rounded-[32px] p-8 md:p-14 relative"
          style={{
            background: `linear-gradient(135deg, ${PARCHMENT} 0%, #FFE9D6 100%)`,
            border: `2.5px solid ${INK}`,
            boxShadow: `6px 6px 0 ${INK}`,
            color: INK,
          }}
        >
          {/* Visible breadcrumbs — Home › Docs › <Group> */}
          <nav aria-label="Breadcrumb" className="mb-4 text-[12px] font-bold opacity-70">
            <ol className="flex flex-wrap items-center gap-1.5">
              <li>
                <Link to="/" className="hover:underline">
                  Home
                </Link>
              </li>
              <li aria-hidden>›</li>
              <li>
                {isDocsRoot ? (
                  <span aria-current="page">Docs</span>
                ) : (
                  <Link to="/docs" className="hover:underline">
                    Docs
                  </Link>
                )}
              </li>
              {!isDocsRoot && (
                <>
                  <li aria-hidden>›</li>
                  <li aria-current="page">{currentGroup.label}</li>
                </>
              )}
            </ol>
          </nav>

          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest"
            style={{ backgroundColor: INK, color: PARCHMENT }}
          >
            <MegsyStar className="w-3.5 h-3.5" /> Documentation
          </div>
          <h1 className="mt-5 text-4xl md:text-6xl font-black tracking-tight leading-[1.02]">
            {isDocsRoot ? (
              <>
                Every atom of Megsy AI, <br className="hidden md:block" />
                in one beautiful place.
              </>
            ) : (
              <>
                {currentGroup.label}
                <span className="block text-2xl md:text-3xl font-bold opacity-70 mt-2">
                  Megsy AI Documentation
                </span>
              </>
            )}
          </h1>
          <p className="mt-5 max-w-2xl text-[16px] md:text-[18px] font-semibold opacity-80">
            {isDocsRoot
              ? "Search, browse and install — a complete, deeply detailed reference for every feature, every agent, every model, every setting, every page and every policy on megsyai.com. Updated continuously."
              : groupDescription}
          </p>

          {/* Search */}
          <div className="mt-7 relative max-w-xl">
            <Search
              className="absolute left-4 top-[22px] -translate-y-1/2 w-4 h-4 z-10"
              style={{ color: INK, opacity: 0.6 }}
            />
            <input
              ref={searchInputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => setSearchFocused(false), 150)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && matchedFlat[0]) {
                  e.preventDefault();
                  const m = matchedFlat[0];
                  navigate(`${pathPrefix}/docs/${m.groupId}/${m.sectionId}`);
                  setQuery("");
                  searchInputRef.current?.blur();
                }
              }}
              placeholder="Search the docs — try ‘install’, ‘credits’, ‘slides’, ‘operator’…"
              aria-label="Search documentation"
              className="w-full h-12 pl-11 pr-24 rounded-2xl outline-none text-[15px] font-semibold"
              style={{
                backgroundColor: "#fff",
                border: `2px solid ${INK}`,
                boxShadow: `3px 3px 0 ${INK}`,
                color: INK,
              }}
            />
            {query ? (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  searchInputRef.current?.focus();
                }}
                aria-label="Clear search"
                className="absolute right-3 top-[22px] -translate-y-1/2 inline-flex items-center justify-center w-7 h-7 rounded-lg z-10"
                style={{ backgroundColor: INK, color: PARCHMENT, border: `1.5px solid ${INK}` }}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <kbd
                className="hidden sm:inline-flex absolute right-3 top-[22px] -translate-y-1/2 items-center gap-1 px-2 py-1 rounded-md text-[11px] font-black"
                style={{ backgroundColor: INK, color: PARCHMENT }}
                aria-hidden
              >
                ⌘K
              </kbd>
            )}

            {/* Live results count */}
            {query.trim() && (
              <div
                className="mt-2 text-[12px] font-bold"
                style={{ color: INK, opacity: 0.75 }}
                aria-live="polite"
              >
                {matchCount === 0 ? (
                  <>
                    No matches for <span className="font-black">“{query}”</span>.
                  </>
                ) : (
                  <>
                    {matchCount} {matchCount === 1 ? "section" : "sections"} match{" "}
                    <span className="font-black">“{query}”</span> · press{" "}
                    <kbd
                      className="px-1.5 py-0.5 rounded font-black"
                      style={{ backgroundColor: INK, color: PARCHMENT }}
                    >
                      Enter
                    </kbd>{" "}
                    to jump to the first.
                  </>
                )}
              </div>
            )}

            {/* Live dropdown — top 8 matches with one-click jump */}
            {query.trim() && searchFocused && matchedFlat.length > 0 && (
              <div
                className="absolute left-0 right-0 top-[60px] z-[80] rounded-2xl overflow-hidden max-h-[60vh] sm:max-h-[360px] overflow-y-auto overscroll-contain"
                style={{
                  backgroundColor: "#ffffff",
                  color: "hsl(var(--brand-ink))",
                  border: `2px solid hsl(var(--brand-ink))`,
                  boxShadow: `4px 4px 0 hsl(var(--brand-ink))`,
                  WebkitOverflowScrolling: "touch",
                }}
                role="listbox"
              >
                {matchedFlat.slice(0, 8).map((m, i) => (
                  <Link
                    key={`${m.groupId}-${m.sectionId}`}
                    to={`${pathPrefix}/docs/${m.groupId}/${m.sectionId}`}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setQuery("");
                      searchInputRef.current?.blur();
                    }}
                    className="flex items-center justify-between gap-3 px-4 py-4 sm:py-3 min-h-[52px] transition no-underline hover:bg-neutral-100 focus-visible:bg-neutral-200 focus:outline-none"
                    style={{
                      backgroundColor: "#ffffff",
                      color: "hsl(var(--brand-ink))",
                      borderTop: i === 0 ? undefined : `1px solid rgba(10,10,10,0.12)`,
                    }}
                  >
                    <div className="min-w-0">
                      <div
                        className="text-[14px] font-black truncate"
                        style={{ color: "hsl(var(--brand-ink))" }}
                      >
                        {m.sectionTitle}
                      </div>
                      <div
                        className="text-[11px] font-bold uppercase tracking-widest truncate"
                        style={{ color: "hsl(var(--brand-ink))", opacity: 0.6 }}
                      >
                        {m.groupLabel}
                      </div>
                    </div>
                    <ChevronRight
                      className="w-4 h-4 shrink-0"
                      style={{ color: "hsl(var(--brand-ink))", opacity: 0.6 }}
                    />
                  </Link>
                ))}
                {matchedFlat.length > 8 && (
                  <div
                    className="px-4 py-2 text-[11px] font-bold uppercase tracking-widest"
                    style={{
                      color: "hsl(var(--brand-ink))",
                      backgroundColor: "#ffffff",
                      opacity: 0.7,
                      borderTop: `1px solid rgba(10,10,10,0.12)`,
                    }}
                  >
                    + {matchedFlat.length - 8} more — scroll the page to see all
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {GROUPS.slice(0, 8).map((g) => {
              const isCurrent = g.id === currentGroup.id;
              return (
                <Link
                  key={g.id}
                  to={`${pathPrefix}/docs/${g.id}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-bold transition active:translate-x-[1px] active:translate-y-[1px]"
                  style={{
                    backgroundColor: isCurrent ? INK : "#fff",
                    color: isCurrent ? PARCHMENT : INK,
                    border: `2px solid ${INK}`,
                    boxShadow: `2px 2px 0 ${INK}`,
                  }}
                >
                  {g.label}
                </Link>
              );
            })}
          </div>
        </div>
      </header>

      {/* Body — 3-column on xl: left TOC · content · right mini TOC */}
      <main className="px-4 pb-24 mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[260px_minmax(0,1fr)_220px] gap-10">
        {/* Sidebar TOC */}
        <aside className="hidden lg:block sticky top-24 self-start max-h-[calc(100vh-7rem)] overflow-y-auto pr-2">
          <nav className="space-y-6" aria-label="Documentation sections">
            {filteredGroups.map((group) => {
              const isCurrentGroup = group.id === currentGroup.id;
              return (
                <div key={group.id}>
                  <Link
                    to={`${pathPrefix}/docs/${group.id}`}
                    className="block text-[11px] font-black uppercase tracking-widest mb-2 px-2 transition"
                    style={{
                      color: isCurrentGroup ? PARCHMENT : PARCHMENT,
                      opacity: isCurrentGroup ? 1 : 0.55,
                    }}
                  >
                    {tGroupLabel(group)}
                  </Link>
                  <ul className="space-y-0.5">
                    {group.sections.map((s) => {
                      const Icon = s.icon;
                      const active = isCurrentGroup && s.id === activeId;
                      return (
                        <li key={s.id}>
                          <Link
                            to={`${pathPrefix}/docs/${group.id}/${s.id}`}
                            className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-[13.5px] transition"
                            style={
                              active
                                ? {
                                    backgroundColor: PARCHMENT,
                                    color: INK,
                                    fontWeight: 800,
                                    border: `1.5px solid ${INK}`,
                                    boxShadow: `2px 2px 0 ${INK}`,
                                  }
                                : { color: PARCHMENT, opacity: isCurrentGroup ? 0.85 : 0.55 }
                            }
                          >
                            <Icon className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">{tSectionTitle(group.id, s)}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </nav>
        </aside>

        {/* Content */}
        <div className="min-w-0 space-y-16">
          {filteredGroups.length === 0 && (
            <div className="text-center py-24 opacity-70">
              No docs matched “{query}”. Try a different search.
            </div>
          )}

          {/* When NOT searching, show a clear "page header" for the current group
              so each group reads like its own dedicated docs page. */}
          {!query.trim() && (
            <header className="space-y-3">
              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest"
                style={{
                  backgroundColor: PARCHMENT,
                  color: INK,
                  border: `1.5px solid ${INK}`,
                }}
              >
                <MegsyStar className="w-3 h-3" /> {localizedGroupLabel}
              </div>
              <h2
                className="text-3xl md:text-[34px] font-black tracking-tight"
                style={{ color: PARCHMENT }}
              >
                {localizedGroupLabel}
              </h2>
              <p className="text-[15px] opacity-70 max-w-3xl">
                {currentGroup.sections.length} section
                {currentGroup.sections.length === 1 ? "" : "s"} · everything you need to know about{" "}
                {localizedGroupLabel.toLowerCase()} in Megsy AI.
              </p>
            </header>
          )}

          {displayedGroups.map((group) => (
            <section key={group.id} aria-labelledby={`group-${group.id}`} className="space-y-10">
              <h2
                id={`group-${group.id}`}
                className={`text-[11px] md:text-[12px] font-black uppercase tracking-[0.2em] scroll-mt-28 ${query.trim() ? "" : "sr-only"}`}
                style={{ color: PARCHMENT, opacity: 0.55 }}
              >
                {tGroupLabel(group)}
              </h2>

              {group.sections.map((s) => {
                const Icon = s.icon;
                const accent = s.accent ?? ACTION;
                const flatIdx = flatSections.findIndex((f) => f.section.id === s.id);
                const prev = flatIdx > 0 ? flatSections[flatIdx - 1] : null;
                const next =
                  flatIdx >= 0 && flatIdx < flatSections.length - 1
                    ? flatSections[flatIdx + 1]
                    : null;
                return (
                  <article
                    key={s.id}
                    id={s.id}
                    className="scroll-mt-28 rounded-[28px] p-6 md:p-8"
                    style={{
                      backgroundColor: "hsl(var(--surface-1))",
                      border: `1.5px solid hsl(var(--surface-4))`,
                    }}
                  >
                    <div className="flex items-center gap-3 mb-3 group/heading">
                      <span
                        className="inline-flex items-center justify-center w-11 h-11 rounded-2xl shrink-0"
                        style={{
                          backgroundColor: accent,
                          color: INK,
                          border: `2px solid ${INK}`,
                          boxShadow: `2.5px 2.5px 0 ${INK}`,
                        }}
                      >
                        <Icon className="w-5 h-5" strokeWidth={2.5} />
                      </span>
                      <h3 className="text-2xl md:text-[28px] font-black tracking-tight leading-tight flex items-center gap-2">
                        <a
                          href={`#${s.id}`}
                          onClick={(e) => {
                            e.preventDefault();
                            navigate(`${pathPrefix}/docs/${group.id}/${s.id}`);
                            history.replaceState(null, "", `#${s.id}`);
                          }}
                          className="hover:underline"
                        >
                          {tSectionTitle(group.id, s)}
                        </a>
                        <CopyLinkButton
                          sectionId={s.id}
                          groupId={group.id}
                          pathPrefix={pathPrefix}
                        />
                      </h3>
                    </div>
                    {s.intro && (
                      <p className="text-[15px] leading-7 opacity-80 mb-4 max-w-3xl">
                        {tSectionIntro(group.id, s)}
                      </p>
                    )}
                    <div className="space-y-4 max-w-3xl">
                      {s.blocks.map((b, i) => (
                        <BlockView key={i} block={b} accent={accent} />
                      ))}
                    </div>

                    {/* Previous / Next */}
                    {(prev || next) && (
                      <nav
                        className="mt-8 pt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 border-t"
                        style={{ borderColor: "hsl(var(--surface-4))" }}
                        aria-label="Section navigation"
                      >
                        {prev ? (
                          <Link
                            to={`${pathPrefix}/docs/${prev.group.id}/${prev.section.id}`}
                            className="flex items-center gap-3 p-4 rounded-2xl transition hover:translate-x-[-2px]"
                            style={{
                              border: `1.5px solid hsl(var(--surface-4))`,
                              backgroundColor: "hsl(var(--surface-2))",
                            }}
                          >
                            <ChevronLeft className="w-4 h-4 opacity-60 shrink-0" />
                            <div className="min-w-0">
                              <div className="text-[11px] font-black uppercase tracking-widest opacity-60">
                                Previous{prev.group.id !== group.id ? ` · ${prev.group.label}` : ""}
                              </div>
                              <div className="text-[14px] font-bold truncate">
                                {prev.section.title}
                              </div>
                            </div>
                          </Link>
                        ) : (
                          <span />
                        )}
                        {next ? (
                          <Link
                            to={`${pathPrefix}/docs/${next.group.id}/${next.section.id}`}
                            className="flex items-center gap-3 p-4 rounded-2xl transition text-right hover:translate-x-[2px] justify-end"
                            style={{
                              border: `1.5px solid hsl(var(--surface-4))`,
                              backgroundColor: "hsl(var(--surface-2))",
                            }}
                          >
                            <div className="min-w-0">
                              <div className="text-[11px] font-black uppercase tracking-widest opacity-60">
                                Next{next.group.id !== group.id ? ` · ${next.group.label}` : ""}
                              </div>
                              <div className="text-[14px] font-bold truncate">
                                {next.section.title}
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 opacity-60 shrink-0" />
                          </Link>
                        ) : (
                          <span />
                        )}
                      </nav>
                    )}
                  </article>
                );
              })}
            </section>
          ))}

          {/* Page-level prev / next group (Stripe-style). */}
          {!query.trim() && (prevGroup || nextGroup) && (
            <nav className="grid grid-cols-1 sm:grid-cols-2 gap-4" aria-label="Page navigation">
              {prevGroup ? (
                <Link
                  to={`${pathPrefix}/docs/${prevGroup.id}`}
                  className="flex items-center gap-3 p-5 rounded-[24px] transition hover:translate-x-[-2px]"
                  style={{
                    backgroundColor: PARCHMENT,
                    color: INK,
                    border: `2px solid ${INK}`,
                    boxShadow: `4px 4px 0 ${INK}`,
                  }}
                >
                  <ChevronLeft className="w-5 h-5 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-[11px] font-black uppercase tracking-widest opacity-70">
                      Previous page
                    </div>
                    <div className="text-[16px] font-black truncate">{prevGroup.label}</div>
                  </div>
                </Link>
              ) : (
                <span />
              )}
              {nextGroup ? (
                <Link
                  to={`${pathPrefix}/docs/${nextGroup.id}`}
                  className="flex items-center gap-3 p-5 rounded-[24px] transition text-right hover:translate-x-[2px] justify-end"
                  style={{
                    backgroundColor: PARCHMENT,
                    color: INK,
                    border: `2px solid ${INK}`,
                    boxShadow: `4px 4px 0 ${INK}`,
                  }}
                >
                  <div className="min-w-0">
                    <div className="text-[11px] font-black uppercase tracking-widest opacity-70">
                      Next page
                    </div>
                    <div className="text-[16px] font-black truncate">{nextGroup.label}</div>
                  </div>
                  <ChevronRight className="w-5 h-5 shrink-0" />
                </Link>
              ) : (
                <span />
              )}
            </nav>
          )}

          {/* Closing CTA */}
          <section
            className="mt-10 rounded-[28px] p-8 md:p-12"
            style={{
              background: `linear-gradient(135deg, ${PARCHMENT} 0%, #FFE0EC 100%)`,
              border: `2.5px solid ${INK}`,
              boxShadow: `5px 5px 0 ${INK}`,
              color: INK,
            }}
          >
            <h3 className="text-2xl md:text-3xl font-black tracking-tight">
              Still have a question?
            </h3>
            <p className="mt-2 max-w-2xl font-semibold opacity-80">
              Our AI support assistant answers in any language, 24/7 — and it knows every page of
              this documentation by heart.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/support"
                className="inline-flex items-center gap-2 h-11 px-5 rounded-full font-black"
                style={{ backgroundColor: INK, color: PARCHMENT, boxShadow: `3px 3px 0 ${INK}` }}
              >
                Open AI support <ChevronRight className="w-4 h-4" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 h-11 px-5 rounded-full font-black"
                style={{
                  backgroundColor: "#fff",
                  color: INK,
                  border: `2px solid ${INK}`,
                  boxShadow: `3px 3px 0 ${INK}`,
                }}
              >
                Contact our team
              </Link>
              <Link
                to="/pricing"
                className="inline-flex items-center gap-2 h-11 px-5 rounded-full font-black"
                style={{
                  backgroundColor: "#fff",
                  color: INK,
                  border: `2px solid ${INK}`,
                  boxShadow: `3px 3px 0 ${INK}`,
                }}
              >
                See plans
              </Link>
            </div>
          </section>
        </div>

        {/* Right mini TOC — sections within the currently active group */}
        <aside className="hidden xl:block sticky top-24 self-start max-h-[calc(100vh-7rem)] overflow-y-auto pl-2">
          <div
            className="text-[11px] font-black uppercase tracking-widest mb-3"
            style={{ color: PARCHMENT, opacity: 0.55 }}
          >
            On this page
          </div>
          <ul
            className="space-y-1.5 border-l-2 pl-3"
            style={{ borderColor: "hsl(var(--surface-4))" }}
          >
            {currentGroup.sections.map((s) => {
              const active = s.id === activeId;
              return (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="block text-[12.5px] leading-snug py-1 transition"
                    style={{
                      color: active ? PARCHMENT : PARCHMENT,
                      opacity: active ? 1 : 0.55,
                      fontWeight: active ? 800 : 500,
                    }}
                  >
                    {s.title}
                  </a>
                </li>
              );
            })}
          </ul>
        </aside>
      </main>

      <Suspense fallback={<SectionFallback />}>
        <LandingFooter />
      </Suspense>
    </div>
  );
}

/* ───────────────────────── Block renderer ───────────────────────── */

function BlockView({ block, accent }: { block: DocBlock; accent: string }) {
  switch (block.kind) {
    case "p":
      return <p className="text-[15px] leading-7 opacity-90">{block.text}</p>;
    case "h":
      return (
        <h4
          className="text-[13px] font-black uppercase tracking-[0.16em] pt-3"
          style={{ color: accent }}
        >
          {block.text}
        </h4>
      );
    case "ul":
      return (
        <ul className="space-y-2">
          {block.items.map((it, i) => (
            <li key={i} className="flex items-start gap-2.5 text-[15px] leading-7 opacity-90">
              <CheckCircle2 className="w-4 h-4 mt-1.5 shrink-0" style={{ color: accent }} />
              <span>{it}</span>
            </li>
          ))}
        </ul>
      );
    case "ol":
      return (
        <ol className="space-y-2.5">
          {block.items.map((it, i) => (
            <li key={i} className="flex items-start gap-3 text-[15px] leading-7 opacity-90">
              <span
                className="shrink-0 inline-flex items-center justify-center w-6 h-6 rounded-full text-[12px] font-black mt-0.5"
                style={{ backgroundColor: accent, color: INK, border: `1.5px solid ${INK}` }}
              >
                {i + 1}
              </span>
              <span>{it}</span>
            </li>
          ))}
        </ol>
      );
    case "kv":
      return (
        <div
          className="rounded-2xl overflow-hidden"
          style={{ border: `1.5px solid hsl(var(--surface-4))` }}
        >
          <dl className="divide-y" style={{ borderColor: "hsl(var(--surface-4))" }}>
            {block.rows.map((r, i) => (
              <div
                key={i}
                className="grid grid-cols-[minmax(140px,38%)_1fr] gap-3 px-4 py-3 text-[14px]"
                style={{
                  borderTop: i === 0 ? undefined : `1px solid hsl(var(--surface-4))`,
                }}
              >
                <dt className="font-black" style={{ color: accent }}>
                  {r.k}
                </dt>
                <dd className="opacity-90">{r.v}</dd>
              </div>
            ))}
          </dl>
        </div>
      );
    case "code":
      return <CodeBlock text={block.text} lang={block.lang} />;
    case "note":
      return (
        <div
          className="rounded-xl px-4 py-3 text-[14px]"
          style={{
            border: `1.5px solid ${accent}`,
            backgroundColor: `color-mix(in oklab, ${accent} 12%, transparent)`,
          }}
        >
          <strong style={{ color: accent }}>Tip · </strong>
          <span className="opacity-90">{block.text}</span>
        </div>
      );
    case "image":
      return (
        <figure className="my-2">
          <img
            src={block.src}
            alt={block.alt}
            loading="lazy"
            width={1024}
            height={1024}
            className="w-full max-w-md mx-auto rounded-2xl"
            style={{
              border: `2px solid ${INK}`,
              boxShadow: `4px 4px 0 ${INK}`,
              backgroundColor: "#fff",
            }}
          />
          {block.caption && (
            <figcaption className="mt-2 text-center text-[12.5px] opacity-70">
              {block.caption}
            </figcaption>
          )}
        </figure>
      );
    case "link":
      return (
        <Link
          to={block.href}
          className="inline-flex items-center gap-1 font-black hover:underline text-[14.5px]"
          style={{ color: accent }}
        >
          {block.label}
        </Link>
      );
  }
}

/* ───────────────────────── Helpers ───────────────────────── */

function CopyLinkButton({
  sectionId,
  groupId,
  pathPrefix = "",
}: {
  sectionId: string;
  groupId: string;
  pathPrefix?: string;
}) {
  const [copied, setCopied] = useState(false);
  const onCopy = async () => {
    const url = `${window.location.origin}${pathPrefix}/docs/${groupId}/${sectionId}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      // Older browsers — fall back to a temporary text area.
      const ta = document.createElement("textarea");
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
      } catch {
        /* noop */
      }
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    }
  };
  return (
    <button
      type="button"
      onClick={onCopy}
      aria-label={copied ? "Link copied" : "Copy link to this section"}
      title={copied ? "Copied!" : "Copy link"}
      className="opacity-0 group-hover/heading:opacity-100 focus:opacity-100 transition inline-flex items-center justify-center w-7 h-7 rounded-lg shrink-0"
      style={{
        border: `1.5px solid hsl(var(--surface-4))`,
        backgroundColor: "hsl(var(--surface-2))",
      }}
    >
      {copied ? <Check className="w-3.5 h-3.5" /> : <LinkIcon className="w-3.5 h-3.5" />}
    </button>
  );
}

function CodeBlock({ text, lang }: { text: string; lang?: string }) {
  const [copied, setCopied] = useState(false);
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      /* noop */
    }
  };
  return (
    <div className="relative group/code">
      {lang && (
        <div
          className="absolute left-3 top-2 text-[10px] font-black uppercase tracking-widest opacity-60"
          aria-hidden
        >
          {lang}
        </div>
      )}
      <button
        type="button"
        onClick={onCopy}
        aria-label={copied ? "Code copied" : "Copy code"}
        className="absolute right-2 top-2 inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-bold opacity-0 group-hover/code:opacity-100 focus:opacity-100 transition"
        style={{
          backgroundColor: "hsl(var(--surface-2))",
          border: `1.5px solid hsl(var(--surface-4))`,
        }}
      >
        {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
        {copied ? "Copied" : "Copy"}
      </button>
      <pre
        className={`rounded-xl p-4 ${lang ? "pt-7" : ""} overflow-x-auto text-[13px] leading-6`}
        style={{
          backgroundColor: "hsl(var(--surface-3))",
          border: `1px solid hsl(var(--surface-4))`,
        }}
      >
        <code>{text}</code>
      </pre>
    </div>
  );
}

/* ───────────────────────── Reading progress bar ─────────────────────────
   Thin top bar that fills as the user scrolls — same trick the best docs
   sites (Stripe, Vercel, Linear) use to give a sense of length & position. */
function ReadingProgressBar() {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      setPct(max > 0 ? Math.min(100, Math.max(0, (h.scrollTop / max) * 100)) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);
  return (
    <div
      aria-hidden
      className="fixed top-0 left-0 right-0 z-[60] h-[3px] pointer-events-none"
      style={{ backgroundColor: "transparent" }}
    >
      <div
        className="h-full transition-[width] duration-100"
        style={{ width: `${pct}%`, backgroundColor: ACTION, boxShadow: `0 0 8px ${ACTION}` }}
      />
    </div>
  );
}
