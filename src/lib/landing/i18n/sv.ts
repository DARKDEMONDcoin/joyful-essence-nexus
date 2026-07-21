import type { LandingContent } from "./types";

const sv: LandingContent = {
  meta: {
    title: "Megsy AI — Chat, Slides, Bilder, Videos & Kod",
    description:
      "Allt-i-ett AI-plattform: 80+ modeller för chat, slides, djupresearch, bild- och videogenerering samt fullstack-applikationer.",
    keywords:
      "AI-plattform, ChatGPT-alternativ, AI-bildgenerator, AI-videogenerator, AI-slides, djupresearch, fullstack AI builder, Nano Banana Pro, GPT-Image 2, Gemini 3 Pro, Veo 3.1",
    ogLocale: "sv_SE",
  },
  hero: {
    h1Pre: "En AI. Alla kreativa",
    h1Highlight: "verktyg du behöver.",
    subtitle:
      "Chat, slides, djupresearch, bilder, videos, bio-kvalitet, läppsynk och fullstack-appar — byggt på världens bästa modeller, samlat i en arbetsyta.",
    ctaPrimary: "Börja skapa — det är gratis",
    ctaSecondary: "API-plattform",
  },
  chatModels: {
    kicker: "MEGSY CHAT",
    title: "En chat.",
    titleHighlight: "Varje modell.",
    subtitle:
      "Megsy skickar intelligent ditt meddelande till den bästa modellen — eller välj din favorit manuellt. Byt mitt i konversationen utan att förlora sammanhang.",
    items: [
      {
        name: "Megsy",
        tag: "Standard · Smart Router",
        description: "Väljer den perfekta modellen för varje prompt. Gratis att använda.",
      },
      {
        name: "GPT-5",
        tag: "OpenAI",
        description: "Bäst i klassen på logiskt tänkande, kodning och texter med långt sammanhang.",
      },
      {
        name: "Gemini 2.5 Pro",
        tag: "Google",
        description: "1 miljon tokens i kontextfönster, inbyggd förståelse för bilder och filer.",
      },
      {
        name: "Grok",
        tag: "xAI",
        description: "Realtidskunskap från webben med en kvick och ocensurerad ton.",
      },
      {
        name: "DeepSeek",
        tag: "Open-source",
        description: "Kostnadseffektiv resonemangsmodell för tunga arbetsbelastningar.",
      },
    ],
    modesTitle: "Specialiserade lägen",
    modes: [
      {
        name: "Inlärningsläge",
        description: "Steg-för-steg-förklaringar, quiz och studiekort för valfritt ämne.",
      },
      {
        name: "Dokumentläge",
        description: "Professionella rapporter, kontrakt, uppsatser och mallar.",
      },
      {
        name: "Djupresearch",
        description: "Autonom forskning från flera källor med källhänvisningar.",
      },
      {
        name: "Slides",
        description: "Generera kompletta presentationer med bilder, diagram och teman.",
      },
    ],
  },
  imageModels: {
    kicker: "BILDMODELLER",
    title: "Pixelperfekt",
    titleHighlight: "bildgenerering.",
    subtitle:
      "Fem flaggskeppsmodeller plus 20+ proffsverktyg — face swap, headshots, bakgrundsborttagning, ljussättning och mer.",
    items: [
      {
        name: "Nano Banana Pro",
        cost: "4 MC",
        description: "Fotorealistisk detaljrikedom och konsekventa karaktärer i studioklass.",
      },
      {
        name: "Nano Banana 2",
        cost: "3 MC",
        description: "Nästa generations kvalitet med naturtrogna händer, text och anatomi.",
      },
      {
        name: "GPT-Image 2",
        cost: "5 MC",
        description:
          "OpenAIs flaggskeppsmodell för bilder — perfekt typografi och komplexa scener.",
      },
      {
        name: "Gemini 3 Pro Image",
        cost: "5 MC",
        description: "Googles bästa bildgenerator med filmisk komposition och ljussättning.",
      },
      {
        name: "Nano Banana",
        cost: "2 MC",
        description: "Blixtsnabb generering för idéarbete och stora volymer.",
      },
    ],
  },
  codeModels: {
    kicker: "MEGSY BUILD",
    title: "Från prompt till",
    titleHighlight: "fullstack-app.",
    subtitle:
      "Beskriv vad du vill ha. Megsy Build genererar React + Tailwind frontend, databas, autentisering, API — och distribuerar allt.",
    steps: [
      {
        title: "Kod",
        description: "Produktionsklar React, TypeScript och Tailwind med ren arkitektur.",
      },
      {
        title: "Molnet",
        description: "Databas, lagring, edge functions och auth — automatiskt sammankopplat.",
      },
      {
        title: "Hastighet",
        description: "Lighthouse-optimerade byggen, lazy loading och inbyggd bildkomprimering.",
      },
      {
        title: "Säkerhet",
        description: "RLS-policyer, hemlighetshantering och sårbarhetsscanning vid varje ändring.",
      },
      {
        title: "Publicera",
        description: "Distribuera till din egen domän med ett klick. SSL och CDN ingår.",
      },
    ],
  },
  howItWorks: {
    title: "Kom igång",
    titleHighlight: "med Megsy",
    subtitle: "Från registrering till driftsättning i fem enkla steg.",
    steps: [
      {
        title: "Skapa ditt konto",
        description:
          "Registrera dig på några sekunder och få gratis credits för att utforska alla modeller direkt.",
      },
      {
        title: "Välj ditt verktyg",
        description:
          "Chat, Image Studio, Video, Cinema, Slides, Dokument, Builder — välj din arbetsyta.",
      },
      {
        title: "Välj din modell",
        description: "80+ modeller från OpenAI, Google, Black Forest Labs, xAI med flera.",
      },
      {
        title: "Skapa & iterera",
        description:
          "Generera, redigera, skala upp, styla om. Megsy sparar varje version i ditt bibliotek.",
      },
      {
        title: "Exportera & publicera",
        description:
          "Ladda ner i valfritt format, publicera på en egen domän eller dela i sociala medier.",
      },
    ],
  },
  cta: {
    line1: "Används av",
    line2: "ledande kreatörer",
    subtitle:
      "Miljontals kreatörer och världens mest innovativa team litar på Megsy för att leverera snabbare med finess och kontroll.",
    button: "Börja skapa nu",
  },
  faq: {
    title: "Vanliga frågor",
    subtitle: "Allt du behöver veta om Megsy.",
    items: [
      {
        q: "Vad är Megsy?",
        a: "Megsy är en allt-i-ett AI-arbetsyta som samlar 80+ modeller för chat, slides, djupresearch, bilder, videos, bio, läppsynk och fullstack-kod — i ett gränssnitt, med ett creditsystem.",
      },
      {
        q: "Vilka AI-modeller ingår?",
        a: "Chat: Megsy, GPT-5.5, Gemini 3 Pro, Claude 4.5, Grok 4, DeepSeek. Bilder: Nano Banana Pro, Nano Banana 2, GPT-Image 2, Gemini 3 Pro Image. Video: Veo 3.1, Kling 3.0 Pro, Runway Gen-4, Hunyuan. Dessutom röst-, läppsynks- och builder-modeller — allt i en prenumeration.",
      },
      {
        q: "Hur fungerar MC-creditsystemet?",
        a: "MC (Megsy Credits) är plattformens valuta. Chat är gratis; bild, video och verktygskörningar kostar en liten mängd MC beroende på modell. Kodbyggen kostar 5 MC. Credits ingår i varje Starter, Pro eller Elite-plan.",
      },
      {
        q: "Vilka abonnemang finns tillgängliga?",
        a: "Starter ($9/mo · 80 MC), Pro ($29/mo · 280 MC, API + social publicering), Elite ($59/mo · 480 MC, webhooks + dedikerad support) och Business ($149/mo · 1,480 MC, dedikerad infrastruktur + SLA). Alla planer täcker kommersiell användning, bild- & videogenerering, kod och GitHub-synk.",
      },
      {
        q: "Kan jag använda Megsy på mitt språk?",
        a: "Ja — Megsy förstår och genererar innehåll på över 50 språk, inklusive svenska, arabiska, spanska, franska, tyska, portugisiska, kinesiska, japanska, hindi och många fler.",
      },
      {
        q: "Finns det ett API?",
        a: "Ja. Pro- och Elite-planerna inkluderar ett utvecklar-API för bildgenerering, videoskapande, chat och verktyg. Webhooks är tillgängliga på Elite.",
      },
      {
        q: "Kan jag publicera min Megsy Build-app?",
        a: "Ja. Megsy Build driftsätter din fullstack-app till ett administrerat moln med egen domän, SSL, edge-cache och databas färdigkopplat — ingen DevOps krävs.",
      },
    ],
  },
};

export default sv;
