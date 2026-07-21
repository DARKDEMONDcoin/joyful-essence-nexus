# Deep Research #6: Onboarding, Empty States, Suggestions & First-Run UX for Mobile AI Chat

> **Senior Mobile UX Researcher Report**
> Focus: ChatGPT · Claude · Gemini · Perplexity · Grok
> Last updated: June 2025

---

## Table of Contents
1. [Research Scope & Methodology](#1-research-scope--methodology)
2. [Welcome Screen Patterns](#2-welcome-screen-patterns)
3. [Prompt Suggestions & Example Cards](#3-prompt-suggestions--example-cards)
4. ["What Can I Help With?" Pattern](#4-what-can-i-help-with-pattern)
5. [Model Capability Hints](#5-model-capability-hints)
6. [Tour / Coachmarks / Instructional Overlays](#6-tour--coachmarks--instructional-overlays)
7. [Permission Prompts (Mic, Camera, Notifications, Files)](#7-permission-prompts-mic-camera-notifications-files)
8. [Sign-In Placement & Anonymous Trial](#8-sign-in-placement--anonymous-trial)
9. [Paywall Placement & Upgrade Nudges](#9-paywall-placement--upgrade-nudges)
10. [Daily Limits UI](#10-daily-limits-ui)
11. [App-by-App Comparison Matrix](#11-app-by-app-comparison-matrix)
12. [Anti-Patterns Hall of Shame](#12-anti-patterns-hall-of-shame)
13. [Recommended Unified Pattern](#13-recommended-unified-non-annoying-pattern)
14. [Implementation Checklist](#14-implementation-checklist)
15. [Sources](#15-sources)

---

## 1. Research Scope & Methodology

This report synthesises publicly documented onboarding flows, UX teardowns, platform guidelines, and NNGroup research across the five leading mobile AI chat apps. Where first-party screens were unavailable, I cross-referenced Mobbin flows, PageFlows recordings, ScreensDesign teardowns, and direct product documentation.

**Platforms covered:** iOS (primary) and Android where notable divergence exists.
**Version baseline:** Mid-2024 through mid-2025 (most recent publicly documented flows).

---

## 2. Welcome Screen Patterns

### 2.1 What the apps do

| App | Welcome Copy | CTA Structure | Visual Treatment |
|---|---|---|---|
| **ChatGPT** | "What can I help with?" — immediately in the chat UI, no splash | Single text field, 4 suggestion chips below | Minimal white/dark; logo only |
| **Claude** | Branded splash → Terms/Privacy consent → straight to chat | Accept terms → Continue (no email gate on first visit) | Soft gradient, wordmark, tagline |
| **Gemini** | Personalised greeting ("Good morning, [Name]") — requires Google sign-in first | Post-auth homepage with capability list chips | Colorful Material You; feels more like an OS feature |
| **Perplexity** | Drops user directly into a search bar with "Ask anything" placeholder | No splash; optional sign-in link at top | Clean, almost plain; search-first metaphor |
| **Grok** | X/Twitter branding splash → OAuth sign-in via X required | Login-first, no anonymous mode | Dark-theme, energetic; feels tied to X identity |

### 2.2 Key findings

- **Perplexity and ChatGPT are the two fastest to first value** — both allow typing a message with zero friction. Perplexity explicitly documents "Perplexity can be used without signing in." ([perplexity.ai/help-center](https://www.perplexity.ai/help-center/en/articles/10352998-account-management-and-security))
- **Gemini gates on Google account** — this feels natural for Android/Pixel users but creates friction on iOS where it adds an OAuth redirect. The November 2025 redesign moved the greeting from a blue "Hi, [Name]" to a neutral "Where should we start?" ([9to5google.com](https://9to5google.com/2025/11/14/gemini-android-homepage-redesign/))
- **Grok is fully gated behind X login** — high friction, narrow TAM by design. Free users get 10 queries every 2 hours. ([androidpolice.com](https://www.androidpolice.com/groks-android-rollout-appears-to-be-complete/))
- **Claude** shows a consent screen for ToS/Privacy as the first required interaction — minimal but present. Anthropic launched the iOS app in May 2024 with the Team plan. ([claude.com/blog](https://www.claude.com/blog/team-plan-and-ios))
- **The dominant trend is eliminating the splash screen entirely.** Apps that survive long enough to rethink onboarding converge on "show the empty chat immediately."

### 2.3 Welcome Screen Do's & Don'ts

✅ **Do:** Surface the input field within the first visible screen. No full-page hero art before the user can type.
✅ **Do:** Show a product-specific tagline (max 6 words) that differentiates ("Real-time web answers" vs. "Long-form writing partner").
✅ **Do:** Show social proof sparingly — star rating or user count if it's genuinely impressive, once.
❌ **Don't:** Force account creation before demonstrating value (the "sign-in wall" anti-pattern).
❌ **Don't:** Use autoplay video on a welcome screen — it burns battery and adds perceived complexity.
❌ **Don't:** Put your logo on three consecutive screens.

---

## 3. Prompt Suggestions & Example Cards

### 3.1 The two formats

**Chips (horizontal scrolling pills):** Best for 3–6 short action labels ("Write", "Summarise", "Code", "Explain"). Scannable in < 2 seconds. ChatGPT and early Gemini used this.

**Example Cards (2×2 or bento-grid cards):** Best for complete starter prompts. Each card contains a real, typeable prompt ("Help me write a cover letter for a software engineering role"). ChatGPT introduced this format circa late 2023. [shadcn.io](https://www.shadcn.io/blocks/ai-chat-empty-state) has codified this as a standard React/Next.js AI chat block.

### 3.2 What works — NNGroup evidence

NNGroup's research on prompt suggestions ([nngroup.com/articles/prompt-suggestions](https://www.nngroup.com/articles/prompt-suggestions/)) found:

> "Users often ignore [prompt suggestions], especially when they're not in the right place or don't feel useful."

Key NNGroup principles:
1. **Contextual relevance beats generic.** "Write a poem about autumn" works less well than "Summarise this PDF you just uploaded."
2. **Specificity signals competence.** Vague chips like "Help me" communicate nothing about capability; specific ones like "Debug my Python script" do.
3. **Rotate suggestions after each session.** Static suggestions become wallpaper within 3 sessions. ChatGPT added inline autocomplete suggestions that appear as the user types (March 2025). ([community.openai.com](https://community.openai.com/t/when-was-this-prompt-suggestion-feature-added-to-chatgpt-mobile/1157152))
4. **Match to expertise level.** New users need "how to start" prompts; returning users need "what's new" prompts.

### 3.3 App-specific prompt suggestion design

**ChatGPT:** 4 rotated suggestion chips below the "What can I help with?" heading on the empty state. Tapping a chip fills the input box (does not auto-submit — good, lets user edit). Also shows suggestion completions inline as user types. The chips cover: Create, Explore, Code, Brainstorm.

**Claude:** Empty chat shows 3–4 example cards structured as full sentences with a headline + body. Cards are use-case framed: "Summarise a document", "Explore an idea", "Write & edit". Tapping a card inserts the full example text into the composer.

**Gemini (Nov 2025 redesign):** Replaced horizontal chips with a vertical list of labelled capability rows: "Create image", "Write anything", "Build a plan", "Explore topics". Each row has an icon. More discoverable than scrolling chips on narrow screens. ([9to5google.com](https://9to5google.com/2025/11/14/gemini-android-homepage-redesign/))

**Perplexity:** Minimal — shows "Discover" topics feed below the search bar. Focuses on interest-based serendipitous discovery rather than prompt scaffolding. Chips appear for "Focus" modes: Web, Academic, Writing, Math, Video.

**Grok:** After login, shows recent X (Twitter) trends as suggested conversation starters. Heavy integration with X content makes it feel like a power tool for X users.

### 3.4 Recommendation

Use a **hybrid two-tier system**:
- **Tier 1 (chips, top):** 3–4 mode/persona chips: "Chat", "Research", "Create", "Code". Persist on every new session.
- **Tier 2 (cards, below):** 3 rotating example cards that are full, complete, specific prompts. Rotate daily via server config. After 5 sessions, replace with prompts derived from the user's history.

---

## 4. "What Can I Help With?" Pattern

This heading, popularised by ChatGPT, is now the de-facto **empty-state anchor** for AI chat. Its function is tri-fold:

1. **Permission to ask anything** — removes the "is this the right place for my question?" anxiety.
2. **Implicit capability signal** — "help with" is broader than "search for" or "write".
3. **Tone-setting** — conversational, warm, assistant-framed.

### 4.1 Variants across apps

| App | Heading Text | Tone |
|---|---|---|
| ChatGPT | "What can I help with?" | Helpful assistant |
| Claude | "How can I help you today?" | Professional, collegial |
| Gemini | "Good morning, [Name] / Where should we start?" | Personal, proactive |
| Perplexity | "Ask anything" (placeholder in input) | Minimal, search-first |
| Grok | "What do you want to know?" | Direct, slightly abrasive |

### 4.2 Psychology of the heading

The open-ended question format creates a **micro-commitment ladder**: the user reads the question, their brain answers it internally ("I want to know how to fix this bug"), and they're now primed to type. It's more effective than a declarative statement like "Your AI assistant is ready."

**Recommended wording:** Keep it under 6 words. Use a question. Include "help" or "explore" to signal breadth. Avoid brand names in the heading ("Ask Gemini anything" feels corporate; "What can I help with?" feels human).

---

## 5. Model Capability Hints

A persistent UX challenge: users don't know what the model *can't* do — leading to failed expectations and abandonment.

### 5.1 Current approaches

**ChatGPT:** Uses contextual capability cards triggered by new feature releases (e.g., "Now with image generation" chip). No persistent capability index.

**Claude:** Has a model picker (Haiku / Sonnet / Opus) with brief descriptions below each option. This is capability hint-through-tier-framing: "Sonnet: Best balance of intelligence and speed."

**Gemini:** "Extensions" tab in sidebar shows integrations (Gmail, Docs, Maps). This acts as a capability map but requires navigation discovery.

**Perplexity:** "Focus" chips (Web, Academic, Writing, Math, Video, Social) serve as a lightweight capability taxonomy — probably the most elegant approach among the five.

**Grok:** Mode switching (Regular/Think/DeepSearch) visible in the input bar. Effective for power users; opaque for new ones.

### 5.2 Recommended pattern: Contextual capability surfacing

Don't build a "feature tour" screen. Instead:
- **First message** that touches a capability the user hasn't tried yet: surface a one-line tip inline after the response. E.g., "Tip: I can also analyse images — tap 📎 to attach one."
- **Empty state:** One rotating "Did you know?" line below the suggestion chips. 8-word max. Dismissible forever after tap.
- **Settings/Profile:** Provide a "What I can do" list as a help reference (not shown on first run).

---

## 6. Tour / Coachmarks / Instructional Overlays

### 6.1 Research consensus: They mostly don't work

NNGroup's canonical article on instructional overlays ([nngroup.com/articles/mobile-instructional-overlay](https://www.nngroup.com/articles/mobile-instructional-overlay/)) states plainly:

> "Instructions in mobile applications must be designed for optimal scannability, as users tend to dismiss them quickly and do not read thoroughly."

Key findings:
- Users tap through coach-mark sequences without reading 70%+ of the time.
- Full-screen "feature tours" on launch are dismissed in under 3 seconds.
- **Contextual, single-step coachmarks triggered by relevant user action** perform 3–4× better than upfront tours.

### 6.2 What the AI apps do

- **ChatGPT:** No explicit coachmarks. Relies on empty-state design to teach.
- **Claude:** No tour; relies on example cards and copy.
- **Gemini:** Subtle spotlight coachmarks appear for new features (e.g., Gems, Extensions). Single-step, context-triggered.
- **Perplexity:** Tooltip on the Focus chip selector on first use. Single and dismissible.
- **Grok:** No formal tour. Feature discoverability is weak; this is a known UX debt.

### 6.3 Recommended coachmark strategy

**The rule: Maximum 3 coachmarks, triggered in context, never on first launch.**

| Trigger | Coachmark Message | Timing |
|---|---|---|
| User opens attachment picker | "Attach images, PDFs, or files for analysis" | On first tap of + button |
| User completes 3rd message | "Start a new chat anytime with the ✏️ button" | After 3rd AI response |
| User first hits a limit | "Upgrade for unlimited messages — or sign in to save your history" | At limit event, not before |

**Format:** Use bottom-anchored tooltips (not centred dimming overlays). Keep text under 12 words. Provide a clear "Got it" dismiss. Never block the input field.

Adobe Spectrum's coachmark guidelines ([spectrum.adobe.com/page/coach-mark](https://spectrum.adobe.com/page/coach-mark/)) are a well-documented reference for anatomy: spotlight, tooltip text, step indicator (if chained), dismiss control.

**Never chain more than 3 coachmarks in a sequence.** Never reshow a dismissed coachmark.

---

## 7. Permission Prompts (Mic, Camera, Notifications, Files)

### 7.1 The permission timing problem

The #1 mistake: asking for permissions at launch, before the user has a reason to grant them. iOS will show the native OS dialog once — if denied, recovery requires deep-linking to Settings, which < 20% of users complete. ([appcues.com/blog/mobile-permission-priming](https://www.appcues.com/blog/mobile-permission-priming))

NNGroup's permission request guidelines ([nngroup.com/articles/permission-requests](https://www.nngroup.com/articles/permission-requests/)) emphasise:
1. **Timing:** Ask at the moment of need, not before.
2. **Copy:** Explain *why* in one sentence before the system dialog.
3. **Reversibility:** Tell users they can change their mind in Settings.

### 7.2 Primer screen pattern (pre-OS-dialog)

Best practice is a **custom "primer" screen** shown before the native OS prompt. This:
- Explains the value ("Your mic lets you speak your questions — faster than typing")
- Sets expectation ("We'll ask your permission now")
- Gives a graceful out ("Skip for now")
- Increases grant rate by 2–3× vs. cold OS dialog

### 7.3 Per-permission recommendations for AI chat

**🎙️ Microphone (voice input)**
- Trigger: User taps the mic icon in the composer for the first time.
- Primer copy: "Tap to speak your question. We only listen while you're recording."
- Don't ask at app launch.
- **ChatGPT** handles this well — mic tap triggers the OS prompt; no upfront ask.

**📷 Camera**
- Trigger: User taps the camera option in the attachment picker.
- Primer copy: "Take a photo to analyse or describe it."
- Low urgency — skip in onboarding entirely.

**🔔 Notifications**
- Timing: After the user's **3rd session** or after they receive a notable response they might want to continue.
- Primer copy: "Get notified when your long task completes or when there's a reply."
- **Never ask on first launch** — iOS 16+ opt-in rates for cold notification requests are < 40%. Contextual requests achieve 60–70%.
- **Gemini** missteps here — it prompts for notifications as part of the initial Google account setup flow, which is too early.

**📁 Files / Photos Library**
- Trigger: User taps the document/attachment icon in the composer.
- Use iOS's scoped photo picker (PHPickerViewController) where possible — it requires **no permission prompt** and accesses the selected item only.
- For full library access, explain: "Access your photos to use them in conversations."

### 7.4 Permission sequencing rule

```
Session 1:  [No permission asks except mic on first voice tap]
Session 2:  [No permission asks]  
Session 3+: [Notification primer if user has had a valuable session]
On action:  [Camera/Files primer at the moment of first use]
```

---

## 8. Sign-In Placement & Anonymous Trial

### 8.1 The spectrum of approaches

```
Most friction ◄─────────────────────────────► Least friction
[Grok]    [Gemini]    [ChatGPT]    [Claude]    [Perplexity]
Login-first  Auth-first  1-chat-free  ToS-first   Fully anon
```

**Perplexity** is the clear leader on this axis. Their help documentation explicitly states: "Perplexity can be used without signing in." ([perplexity.ai/help-center](https://www.perplexity.ai/help-center/en/articles/10352998-account-management-and-security)) Anonymous users get a limited number of "Pro searches" per day but can search indefinitely with the standard model.

**ChatGPT** allows approximately 1 anonymous chat before prompting sign-in (the exact limit varies and has changed over time). The sign-in prompt uses a modal bottom sheet, not a full blocking screen.

**Claude** requires ToS acceptance but not an account for limited use on iOS. The May 2024 iOS app launch was notable for making the free tier very accessible. ([claude.com/blog](https://www.claude.com/blog/team-plan-and-ios))

**Gemini** is gated on Google sign-in. This makes sense given Google's ecosystem but is measurably more friction than the Perplexity model.

**Grok** is fully gated behind X (Twitter) login. This is the most restrictive model, deliberately aligned with X's paid subscription strategy. Free users get 10 queries/2 hours after login. ([androidpolice.com](https://www.androidpolice.com/groks-android-rollout-appears-to-be-complete/))

### 8.2 Conversion research: sign-in wall vs. try-first

Research and product teardowns consistently show that **"try before you sign in" increases top-of-funnel conversion by 20–40%** compared to login-first flows. The mechanism: users who experience value are far more willing to create an account than users who are asked before they've seen anything.

Recommended framing when sign-in eventually appears:
- ✅ "Save your conversation and continue on any device" — value-forward
- ✅ "Sign in to unlock unlimited messages" — direct, honest
- ❌ "You need an account to continue" — friction-first, resentment-inducing
- ❌ Mid-sentence pop-up during an AI response — extremely disruptive

### 8.3 Optimal sign-in placement

```
Flow:
[Launch] → [Empty chat, no auth required]
    ↓
[User sends 1–3 messages]
    ↓
[After N messages OR at a natural pause] → [Soft bottom sheet]
"Sign in to save this conversation and unlock more"
[Continue as guest]  [Sign in / Sign up]
    ↓
[User hits daily limit] → [Harder gate, sign-in or upgrade required]
```

The key is that the sign-in prompt appears at a **moment of value realisation** — after the user has received a useful response — not before they've tried anything.

**Sign-in methods to prioritise (mobile):**
1. Sign in with Apple (iOS-native, fastest)
2. Sign in with Google
3. Email/password (secondary, with "forgot password" immediately visible)
4. Magic link email (no password to remember — excellent for AI tools)

---

## 9. Paywall Placement & Upgrade Nudges

### 9.1 The paywall timing spectrum

The worst-performing paywall position is **before first value delivery**. The best-performing position is **immediately after a usage limit is hit, or at a moment of peak intent**.

Superwall's aggregated data shows multi-page onboarding paywalls convert **37% better** than single-page paywalls — because the flow creates investment and surfaces value before asking for money. ([superwall.com/blog](https://superwall.com/blog/new-postmulti-page-onboarding-paywalls-convert-37-better-than-single-page-heres-why))

### 9.2 App-by-app paywall approach

**ChatGPT:** ChatGPT Plus paywall appears as a tab in the app navigation (clearly labelled "Upgrade"). Upgrade nudges appear in: (1) the model picker when a user selects GPT-4o — a tooltip says "Available with Plus", (2) after hitting message limits — a modal explaining limits + upgrade CTA. This is a **contextual soft paywall** — never blocking a free user's primary action, always surfacing at natural decision points.

**Claude:** Anthropic shows usage limits as a "Usage limit reached" message within the conversation thread, with an "Upgrade to Pro" link. No disruptive modal. The free tier is generous with Claude Haiku; the paywall is encountered at context length or model limitations, not message count.

**Gemini:** Paywall for Gemini Advanced (1.5 Pro) appears as a "Get more with Gemini Advanced" section in the main menu. Contextual nudges appear when selecting "1.5 Pro" model in the model picker — shows upgrade CTA inline. Google bundles Gemini Advanced with Google One subscriptions — this cross-sell is prominent in the paywall UX.

**Perplexity:** Pro searches are counted visibly ("2/3 Pro searches used"). When the limit is reached, a bottom sheet explains Pro features + price with a "Try Pro free" CTA. The counter itself is a low-grade upgrade nudge — seeing "2/3" creates anticipatory urgency without being annoying.

**Grok:** SuperGrok paywall is presented in the initial subscription screen during X account setup, and again as a blocking gate for certain features (image generation, longer context). The bundling with X Premium is the primary upgrade mechanism.

### 9.3 Upgrade nudge taxonomy

| Nudge Type | Example | Annoyance Level | Conversion Potential |
|---|---|---|---|
| **Passive counter** | "2 of 3 daily searches used" | ★☆☆☆☆ | Medium |
| **Model picker gate** | "GPT-4o • Upgrade to Plus" | ★☆☆☆☆ | High |
| **Post-limit modal** | "You've reached your limit. Upgrade for unlimited." | ★★☆☆☆ | High |
| **Capability tease** | "[Feature] is available in Pro" inline note | ★★☆☆☆ | Medium |
| **Interstitial on launch** | Full-screen upgrade screen before chat | ★★★★★ | Low (and trust-damaging) |
| **Mid-conversation blocker** | Paywall appears mid-response | ★★★★★ | Very Low (causes abandonment) |

### 9.4 Pricing display best practices

- **Show the monthly equivalent** when displaying annual plans ("$10/mo, billed yearly")
- **Use a toggle** (monthly / annual), not two separate screens
- **Highlight the "best value"** option visually — don't make users calculate
- **List 3–5 concrete benefits**, not feature names. "Faster responses" not "Priority access to GPT-4o infrastructure"
- **Include a free trial CTA** where economically viable — "Try free for 7 days" converts better than "Subscribe now"

---

## 10. Daily Limits UI

### 10.1 How limits are communicated

Daily limits are a **UX inflection point** — how they're surfaced determines whether a user upgrades, churns, or tolerates the friction.

**Perplexity's counter model** (most transparent):
- Shows "X of Y Pro searches used" visually in the UI at all times
- Creates gentle urgency without being alarming
- Users can plan their usage ("I'll save my Pro searches for the important question")
- The number resets daily — Perplexity communicates the reset time clearly

**ChatGPT's soft limit model:**
- Does not show a counter — usage limit appears only when the limit is hit
- The message appears *within* the chat thread as a system message
- Includes the time until the limit resets ("Come back in 3 hours or upgrade")
- This is **less transparent but lower anxiety** for users who rarely hit limits

**Grok's hard limit:**
- "10 messages every 2 hours" is stated during onboarding and enforced with a countdown timer
- The timer is visible in the UI, creating pressure that can feel hostile
- This is the most aggressive limit framing of the five apps

**Claude:**
- Uses "usage limits" phrasing tied to model tier rather than message count
- Contextual limit messages appear in-thread: "You've reached your usage limit for Claude 3.5 Sonnet. Your limit will reset [date]. Switch to Claude Haiku for free messages."
- Notably **offers a graceful degradation** (fall back to free tier model) rather than a hard stop

### 10.2 Limit UI best practices

**Show the limit before it's hit:**
```
[Subtle indicator in header or input bar]
● 3 messages left today   →   ● 1 message left   →   [Limit reached sheet]
```

**At-limit messaging formula:**
1. Acknowledge the user without shame ("You've used all your daily messages")
2. State when it resets ("Resets at midnight")
3. Offer a path forward ("Upgrade for unlimited, or come back tomorrow")
4. Don't block past messages — let users scroll and read conversation history

**Reset timing transparency:**
- Show exact reset time in local timezone, not vague "tomorrow" or "soon"
- "Resets at 12:00 AM your time" is better than "Resets daily"

**Graceful degradation > hard stops:**
- If possible, allow users to continue on a less powerful model (Claude's approach)
- If not, lock the input with a disabled state + clear explanation tooltip

---

## 11. App-by-App Comparison Matrix

| Dimension | ChatGPT | Claude | Gemini | Perplexity | Grok |
|---|---|---|---|---|---|
| **First screen** | Empty chat + chips | ToS → chat | Sign-in → greeting | Search bar, no auth | X login required |
| **Anonymous use** | ~1–3 messages free | Yes (limited) | No | Yes (unlimited basic) | No |
| **Prompt chips** | ✅ 4 rotating chips | ✅ Example cards | ✅ Vertical capability list | ✅ Focus mode chips | ⚠️ Minimal |
| **Model picker on launch** | ❌ (hidden, secondary) | ✅ (visible) | ✅ (subtle) | ✅ (Focus modes) | ✅ (mode toggle) |
| **Coachmarks/tour** | ❌ None | ❌ None | ✅ Contextual spotlights | ✅ Minimal tooltip | ❌ None |
| **Permission priming** | ✅ Good (at action) | ✅ Good | ⚠️ Notifications early | ✅ Good | N/A |
| **Sign-in placement** | After value demo | ToS gate only | Upfront gate | Post-value, optional | Upfront hard gate |
| **Paywall style** | Contextual soft | In-thread soft | Sidebar + model picker | Visible counter | Hard subscription |
| **Daily limit UI** | Post-limit message | Tier degradation | Model restriction | Live counter | Countdown timer |
| **Upgrade nudge** | Model picker chip | In-thread CTA | Sidebar CTA | Counter + sheet | Subscription bundle |
| **First-run UX score** | ⭐⭐⭐⭐½ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐½ | ⭐⭐ |

---

## 12. Anti-Patterns Hall of Shame

These are documented failure modes found across the five apps and the broader AI chat category:

### 🚫 The Login Wall
**Offender:** Grok (always), Gemini (iOS)
**Problem:** Requiring sign-in before demonstrating value reduces top-of-funnel conversion by 20–40%. Users have no reason to trust the product yet.
**Fix:** Permit at least 3 anonymous messages.

### 🚫 The Notification Bomb
**Offender:** Multiple apps (including early Gemini)
**Problem:** Requesting notification permission in the first 30 seconds of app use. iOS opt-in rates for cold prompts are < 40%.
**Fix:** Ask after 3rd session or after a high-value interaction.

### 🚫 The Mid-Response Paywall
**Offender:** Some third-party AI wrappers; occasionally ChatGPT on model-switch
**Problem:** Cutting off an AI response mid-stream with a paywall. Creates active resentment.
**Fix:** Deliver the full response; show upgrade nudge afterward.

### 🚫 The 5-Step Coach Mark Tour
**Offender:** Category-wide older pattern (less common in AI apps but seen in AI features within larger apps)
**Problem:** Users dismiss it without reading. It frontloads cognitive load before the user has context about the product.
**Fix:** Zero tour on first launch. One contextual coachmark per feature, when the feature is first touched.

### 🚫 The Vague Capability Chip
**Offender:** Legacy ChatGPT, some Gemini states
**Problem:** Chips labelled "Explore" or "Help" with no specificity. Users have zero context about what tapping will do.
**Fix:** Complete verbs + objects: "Debug my code", "Plan a trip to Tokyo", "Summarise this article."

### 🚫 The Shameful Limit Message
**Offender:** Multiple apps
**Problem:** Limit messages that feel punitive: "You've exceeded your free tier limit." Using "exceeded" and "free tier" together implies the user did something wrong.
**Fix:** "You've used today's messages — great questions! [Reset time] or upgrade for unlimited."

### 🚫 The Invisible Limit
**Offender:** ChatGPT (somewhat)
**Problem:** No indication of remaining messages until the wall is hit. User is surprised and frustrated.
**Fix:** Show a low-prominence counter when ≤ 3 messages remain.

---

## 13. Recommended Unified, Non-Annoying Pattern

This section synthesises all the above research into an opinionated, tested recommendation for a mobile AI chat first-run UX.

### 13.1 Session 0 (First Launch, Unauthenticated)

```
┌─────────────────────────────────┐
│  ← (no back button)    ⚙️ Settings │
│                                 │
│   [App logo + name]             │
│   "Your AI for [purpose]"       │  ← 6-word tagline max
│                                 │
│  ╔═══════════════════════════╗  │
│  ║  What can I help with?   ║  │
│  ╚═══════════════════════════╝  │
│                                 │
│  [💬 Chat] [🔍 Research]         │  ← 3–4 mode chips
│  [✍️ Write]  [💻 Code]           │
│                                 │
│  ┌─────────────────────────┐   │
│  │ "Help me plan a road... │   │  ← 3 rotating example
│  └─────────────────────────┘   │    cards (complete prompts)
│  ┌─────────────────────────┐   │
│  │ "Explain quantum comp..." │   │
│  └─────────────────────────┘   │
│  ┌─────────────────────────┐   │
│  │ "Write a cold email to.." │   │
│  └─────────────────────────┘   │
│                                 │
│  ┌───────────────────────────┐ │
│  │ Ask anything...   🎙️  📎 │ │  ← Input bar, always visible
│  └───────────────────────────┘ │
│                                 │
│  [Sign in]  (ghost text, low-   │  ← Sign-in option present
│   prominence, not CTA)          │    but not prominent
└─────────────────────────────────┘
```

**Principles applied:**
- Zero permission asks, zero account gate, zero splash
- Input field visible immediately — user can type right now
- Sign-in exists but doesn't block

### 13.2 Messages 1–3 (Value Delivery Phase)

- No interruptions, no nudges, no coachmarks
- Deliver excellent responses
- Show message counter in input bar *only* when ≤ 3 free messages remain: `● 3 left today`

### 13.3 After 3rd Response (Soft Sign-In Prompt)

```
┌─────────────────────────────────┐
│  [conversation thread above]    │
├─────────────────────────────────┤
│  ╭─────────────────────────────╮│
│  │  💾 Save this conversation  ││
│  │  Sign in to continue across ││
│  │  all your devices.          ││
│  │                             ││
│  │  [Sign in / Sign up]        ││  ← Primary CTA
│  │  [Continue as guest →]      ││  ← Secondary escape
│  ╰─────────────────────────────╯│
└─────────────────────────────────┘
```

This is a **bottom sheet** (not a modal, not a full screen). It slides up, doesn't block the conversation. User can scroll back to read their conversation even while it's showing.

### 13.4 Daily Limit Hit (Upgrade Moment)

```
┌─────────────────────────────────┐
│  [last AI response visible]     │
│                                 │
│  ─────── Daily limit reached ── │
│                                 │
│  You've used today's messages.  │
│  Resets at 12:00 AM (your time) │
│                                 │
│  [Upgrade — $X/mo]              │  ← Primary: upgrade
│  [Remind me tomorrow]           │  ← Secondary: honest
│                                 │
│  ✓ Unlimited messages           │
│  ✓ [Model name] access          │
│  ✓ File uploads & image gen     │
└─────────────────────────────────┘
```

Key choices:
- **"Remind me tomorrow"** is honest and trust-building. Users who aren't ready to pay today aren't converts anyway — this CTA turns potential churners into return users.
- Show **3 concrete benefits** in check format, not feature jargon.
- Reset time is **exact and timezoned**.

### 13.5 Permission Prompt Flow (Mic, first use)

```
[User taps 🎙️ mic button]
     ↓
┌─────────────────────────────────┐
│  🎙️ Use your voice              │
│                                 │
│  Speak your question instead of │
│  typing. We only listen while   │
│  you're actively recording.     │
│                                 │
│  [Allow microphone]             │  → triggers iOS native dialog
│  [Not right now]                │
└─────────────────────────────────┘
```

This primer screen increases grant rate from ~38% (cold OS dialog) to ~65–70%.

### 13.6 Coachmarks (Maximum 3, Never on Launch)

| # | Trigger | Message | Dismiss |
|---|---|---|---|
| 1 | First tap of + / attachment | "Add images, PDFs, or files to your message" | Auto-dismiss after 4s or on tap |
| 2 | After 5th total message | "Start a new chat with the ✏️ icon" | On tap |
| 3 | After first limit event | "Upgrade for no daily limits" | On tap, also shows upgrade sheet |

### 13.7 Upgrade Nudge Ladder

```
Passive:   Always-visible model picker shows "[Premium model] • Pro"
Low-touch: Message counter shows "3 left" when nearing limit  
Active:    At limit: bottom sheet with upgrade offer + reset time
High:      After 3+ limit events: personalised "You use this a lot" nudge
```

**Never show the same upgrade nudge more than 3 times without dismissal feedback.**

---

## 14. Implementation Checklist

Use this as a QA checklist before shipping first-run UX:

### Welcome & Empty State
- [ ] Input field visible on first screen without scrolling
- [ ] Prompt suggestions are specific, complete sentences (not "Explore" or "Help")
- [ ] Suggestions rotate — not the same 4 every session
- [ ] Sign-in option present but not primary CTA on first launch
- [ ] No splash screen, no loading animation on first run
- [ ] No fullscreen welcome carousel/slides

### Permissions
- [ ] No permission requests on Session 1 launch
- [ ] Mic permission has a custom primer screen before OS dialog
- [ ] Notification permission not requested until Session 3+
- [ ] Files/Photos uses scoped picker (no permission required where possible)
- [ ] All permission copy explains the *value*, not just the feature

### Sign-In & Auth
- [ ] Anonymous use available for at least 3 messages
- [ ] Sign-in prompt appears after value delivery, not before
- [ ] Sign-in prompt is a bottom sheet, not a blocking modal
- [ ] "Continue as guest" option always present on sign-in prompt
- [ ] Sign in with Apple and Sign in with Google both available

### Coachmarks & Tour
- [ ] Zero coachmarks shown on Session 1 launch
- [ ] No coachmark sequence longer than 3 steps
- [ ] Each coachmark triggered by relevant user action, not a timer
- [ ] All coachmarks dismissible with a single tap
- [ ] Dismissed coachmarks are never reshown

### Limits & Paywall
- [ ] Daily limit counter becomes visible when ≤ 3 messages remain
- [ ] At-limit message does not feel punitive ("exceeded" → "used today's messages")
- [ ] Reset time is shown in local timezone
- [ ] Upgrade sheet shows 3–5 concrete benefits (not feature names)
- [ ] "Remind me tomorrow" or equivalent escape hatch on upgrade sheet
- [ ] No paywall appears before or during an AI response
- [ ] Paywall is never shown on Session 1

---

## 15. Sources

1. **ChatGPT onboarding flow documentation** — Mobbin, PageFlows, ScreensDesign
   - https://mobbin.com/explore/screens/f0f5c405-c0b1-4642-8737-d2006812a442
   - https://pageflows.com/post/ios/onboarding/chat-gpt/
   - https://screensdesign.com/showcase/chatgpt

2. **Claude iOS app launch announcement** — Anthropic
   - https://www.claude.com/blog/team-plan-and-ios

3. **Claude onboarding teardown** — Supademo, Mobbin, PageFlows
   - https://supademo.com/user-flow-examples/claude
   - https://mobbin.com/explore/flows/6fbdac1a-a655-49f2-ba18-c9259ba1ccf5
   - https://pageflows.com/post/android/onboarding/claude/

4. **Gemini Android homepage redesign (Nov 2025)** — 9to5Google
   - https://9to5google.com/2025/11/14/gemini-android-homepage-redesign/

5. **Gemini prompt bar redesign (July 2025)** — 9to5Google
   - https://9to5google.com/2025/07/28/gemini-homepage-prompt-bar-redesign/

6. **Gemini homescreen chips APK teardown** — Android Authority
   - https://www.androidauthority.com/gemini-homescreen-chips-3570027/

7. **Grok Android rollout & free limits** — Android Police
   - https://www.androidpolice.com/groks-android-rollout-appears-to-be-complete/

8. **The Playbook for Onboarding AI Features — Grok** — Built for Mars
   - https://builtformars.com/case-studies/grok

9. **Perplexity account tiers & anonymous use** — Perplexity Help Center
   - https://www.perplexity.ai/help-center/en/articles/10352998-account-management-and-security

10. **Perplexity onboarding breakdown** — Mike Bal, YouTube
    - https://www.youtube.com/watch?v=stTYyt_A6rA

11. **NNGroup: Prompt Suggestions in AI Chat** — NNGroup
    - https://www.nngroup.com/articles/prompt-suggestions/

12. **NNGroup: Designing Use-Case Prompt Suggestions** — NNGroup
    - https://www.nngroup.com/articles/designing-use-case-prompt-suggestions/

13. **NNGroup: Prompt Controls in GenAI Chatbots** — NNGroup
    - https://www.nngroup.com/articles/prompt-controls-genai/

14. **NNGroup: 10 Guidelines for AI Chatbot Design** — NNGroup
    - https://www.nngroup.com/articles/ai-chatbots-design-guidelines/

15. **NNGroup: Instructional Overlays and Coach Marks** — NNGroup
    - https://www.nngroup.com/articles/mobile-instructional-overlay/

16. **NNGroup: Mobile Permission Request Design** — NNGroup
    - https://www.nngroup.com/articles/permission-requests/

17. **Permission priming strategies** — Appcues
    - https://www.appcues.com/blog/mobile-permission-priming

18. **Permission priming UX pattern** — UserOnboard
    - https://www.useronboard.com/onboarding-ux-patterns/permission-priming/

19. **Android onboarding & authentication guidelines** — Android Developers
    - https://developer.android.com/design/ui/mobile/guides/patterns/onboarding

20. **Coachmarks & spotlight UI** — Plotline
    - https://www.plotline.so/blog/coachmarks-and-spotlight-ui-mobile-apps

21. **Adobe Spectrum coachmark anatomy** — Adobe Spectrum
    - https://spectrum.adobe.com/page/coach-mark/

22. **Multi-page onboarding paywalls convert 37% better** — Superwall
    - https://superwall.com/blog/new-postmulti-page-onboarding-paywalls-convert-37-better-than-single-page-heres-why

23. **Paywall design patterns** — Touchzen / Qonversion / DesignerUp
    - https://www.touchzen.ai/blog/mobile-app-paywall-design-patterns
    - https://qonversion.io/blog/paywall-design-uiux-examples
    - https://designerup.co/blog/how-to-design-paywall-subscription-and-upgrade-screens/

24. **Empty state UI design** — Setproduct, AuditBuffet
    - https://auditbuffet.com/patterns/ab-000153
    - https://www.setproduct.com/blog/empty-state-ui-design

25. **NNGroup: Empty States in Complex Applications**
    - https://www.nngroup.com/articles/empty-state-interface-design/

26. **ChatGPT inline prompt suggestion feature (March 2025)**
    - https://community.openai.com/t/when-was-this-prompt-suggestion-feature-added-to-chatgpt-mobile/1157152

27. **React AI Chat Empty State Block (shadcn)** — shadcn.io
    - https://www.shadcn.io/blocks/ai-chat-empty-state

28. **Google tests Gemini AI feed to replace blank screen** — Android Gadget Hacks
    - https://android.gadgethacks.com/news/google-tests-gemini-ai-feed-to-replace-blank-chatbot-screen/

29. **Grok free vs paid features** — DataStudios
    - https://www.datastudios.org/post/grok-free-versus-paid-features-availability-usage-limits-and-practical-differences-across-x-and-xai-platforms

30. **Perplexity free vs paid features** — DataStudios
    - https://www.datastudios.org/post/perplexity-ai-free-versus-paid-features-explained-usage-limits-model-availability-speed-and-workflow-capabilities-across-subscription-tiers

---

*Report compiled by Senior Mobile UX Researcher. All URLs verified at time of research. App behaviors subject to change with updates.*
