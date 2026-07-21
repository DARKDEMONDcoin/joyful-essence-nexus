import type { LandingContent } from "./types";

const cs: LandingContent = {
  meta: {
    title: "Megsy AI — Chat, prezentace, obrázky, videa a kód",
    description:
      "Vše v jednom AI platforma: 80+ modelů pro chat, prezentace, hloubkový výzkum, generování obrázků a videa i tvorbu full-stack aplikací.",
    keywords:
      "AI platforma, alternativa ChatGPT, AI generátor obrázků, AI generátor videa, AI prezentace, hloubkový výzkum, full-stack AI builder, Nano Banana Pro, GPT-Image 2, Gemini 3 Pro, Veo 3.1",
    ogLocale: "cs_CZ",
  },
  hero: {
    h1Pre: "JEDNA AI. KAŽDÝ KREATIVNÍ",
    h1Highlight: "NÁSTROJ, KTERÝ POTŘEBUJETE.",
    subtitle:
      "Chat, prezentace, hloubkový výzkum, obrázky, videa, kino, lip-sync a full-stack aplikace — postavené na nejlepších světových modelech, sjednocené v jednom pracovním prostoru.",
    ctaPrimary: "Začněte tvořit — je to zdarma",
    ctaSecondary: "API Platforma",
  },
  chatModels: {
    kicker: "MEGSY CHAT",
    title: "Jeden chat.",
    titleHighlight: "Každý model.",
    subtitle:
      "Megsy inteligentně směruje vaši zprávu k nejlepšímu modelu — nebo si vyberte svůj oblíbený ručně. Přepínejte uprostřed konverzace bez ztráty kontextu.",
    items: [
      {
        name: "Megsy",
        tag: "Výchozí · Inteligentní směrovač",
        description: "Vybere perfektní model pro každý dotaz. Použití zdarma.",
      },
      {
        name: "GPT-5",
        tag: "OpenAI",
        description: "Špičkové uvažování, programování a psaní s dlouhým kontextem.",
      },
      {
        name: "Gemini 2.5 Pro",
        tag: "Google",
        description: "Kontext 1M tokenů, nativní porozumění obrázkům a souborům.",
      },
      {
        name: "Grok",
        tag: "xAI",
        description: "Znalost webu v reálném čase s vtipným a necenzurovaným tónem.",
      },
      {
        name: "DeepSeek",
        tag: "Open-source",
        description: "Nákladově efektivní model uvažování pro náročné pracovní úkoly.",
      },
    ],
    modesTitle: "Specializované režimy",
    modes: [
      {
        name: "Režim učení",
        description: "Vysvětlení krok za krokem, kvízy a studijní karty pro jakékoli téma.",
      },
      {
        name: "Režim dokumentů",
        description: "Profesionální zprávy, smlouvy, výzkumné práce a šablony.",
      },
      {
        name: "Hloubkový výzkum",
        description: "Autonomní výzkum z více zdrojů s uvedenými citacemi.",
      },
      {
        name: "Prezentace",
        description: "Generujte kompletní prezentace s obrázky, grafy a tématy.",
      },
    ],
  },
  imageModels: {
    kicker: "MODELY OBRÁZKŮ",
    title: "Dokonalé",
    titleHighlight: "generování obrázků.",
    subtitle:
      "Pět vlajkových modelů a více než 20 profesionálních nástrojů — face swap, portréty, odstranění pozadí, nasvícení, cartoonify a další.",
    items: [
      {
        name: "Nano Banana Pro",
        cost: "4 MC",
        description:
          "Fotorealistické detaily, konzistentní postavy a studiová kvalita ve stylu značky.",
      },
      {
        name: "Nano Banana 2",
        cost: "3 MC",
        description: "Kvalita nové generace s nejmodernějším vykreslením rukou, textu a anatomie.",
      },
      {
        name: "GPT-Image 2",
        cost: "5 MC",
        description: "Vlajkový model OpenAI pro obrázky — perfektní typografie a komplexní scény.",
      },
      {
        name: "Gemini 3 Pro Image",
        cost: "5 MC",
        description: "Prémiový generátor obrázků od Google s filmovou kompozicí a osvětlením.",
      },
      {
        name: "Nano Banana",
        cost: "2 MC",
        description: "Bleskurychlé generování pro ideový vývoj a objemnou iteraci.",
      },
    ],
  },
  codeModels: {
    kicker: "MEGSY BUILD",
    title: "Z promptu do",
    titleHighlight: "full-stack aplikace.",
    subtitle:
      "Popište, co chcete. Megsy Build vygeneruje React + Tailwind frontend, databázi, autentizaci, API — a vše nasadí.",
    steps: [
      {
        title: "Kód",
        description: "Produkční React, TypeScript a Tailwind s čistou architekturou.",
      },
      {
        title: "Cloud",
        description: "Databáze, úložiště, edge funkce a autentizace — automaticky propojeno.",
      },
      {
        title: "Rychlost",
        description:
          "Buildy optimalizované pro Lighthouse, lazy loading a komprese obrázků v ceně.",
      },
      {
        title: "Bezpečnost",
        description: "RLS politiky, správa tajných klíčů a skenování závislostí při každé změně.",
      },
      {
        title: "Publikování",
        description: "Nasazení na vlastní doménu jedním kliknutím včetně SSL a CDN.",
      },
    ],
  },
  howItWorks: {
    title: "ZAČNĚTE",
    titleHighlight: "S MEGSY",
    subtitle: "Od registrace k nasazení v pěti jednoduchých krocích.",
    steps: [
      {
        title: "Vytvořte si účet",
        description:
          "Zaregistrujte se během několika sekund a získejte kredity zdarma k okamžitému vyzkoušení každého modelu.",
      },
      {
        title: "Vyberte si nástroj",
        description:
          "Chat, Image Studio, Video, Kino, Prezentace, Dokumenty, Builder — vyberte si svůj pracovní prostor.",
      },
      {
        title: "Zvolte model",
        description: "80+ modelů od OpenAI, Google, Black Forest Labs, xAI a dalších.",
      },
      {
        title: "Tvořte a vylaďujte",
        description:
          "Generujte, upravujte, zvětšujte rozlišení, měňte styl. Megsy uchovává každou verzi ve vaší knihovně.",
      },
      {
        title: "Exportujte a nasaďte",
        description:
          "Stahujte v libovolném formátu, publikujte na vlastní doménu nebo sdílejte na sociálních sítích.",
      },
    ],
  },
  cta: {
    line1: "DŮVĚŘUJÍ NÁM",
    line2: "PŘEDNÍ TVŮRCI",
    subtitle:
      "Miliony tvůrců a nejinovativnější týmy světa věří Megsy pro rychlejší dodávání projektů s precizností a kontrolou.",
    button: "Začít generovat",
  },
  faq: {
    title: "Časté dotazy",
    subtitle: "Vše, co potřebujete vědět o Megsy.",
    items: [
      {
        q: "Co je Megsy?",
        a: "Megsy je all-in-one pracovní prostor pro AI, který sjednocuje 80+ modelů pro chat, prezentace, hloubkový výzkum, obrázky, videa, kino, lip-sync a generování full-stack kódu — v jednom rozhraní a s jedním systémem kreditů.",
      },
      {
        q: "Které AI modely jsou zahrnuty?",
        a: "Chat: Megsy, GPT-5.5, Gemini 3 Pro, Claude 4.5, Grok 4, DeepSeek. Obrázky: Nano Banana Pro, Nano Banana 2, GPT-Image 2, Gemini 3 Pro Image. Video: Veo 3.1, Kling 3.0 Pro, Runway Gen-4, Hunyuan. Plus modely pro hlas, lip-sync a vývoj — vše v jednom předplatném.",
      },
      {
        q: "Jak funguje systém kreditů MC?",
        a: "MC (Megsy Credits) je měna platformy. Chat je zdarma; generování obrázků, videí a nástrojů stojí malé množství MC v závislosti na modelu. Tvorba kódu stojí 5 MC. Kredity jsou součástí každého plánu Starter, Pro nebo Elite.",
      },
      {
        q: "Jaké plány jsou k dispozici?",
        a: "Starter ($9/mo · 80 MC), Pro ($29/mo · 280 MC, API + publikování na soc. sítě), Elite ($59/mo · 480 MC, webhooky + dedikovaná podpora) a Business ($149/mo · 1,480 MC, dedikovaná infrastruktura + SLA). Všechny plány zahrnují komerční využití, generování obrázků a videa, kód a synchronizaci s GitHub.",
      },
      {
        q: "Mohu používat Megsy ve svém jazyce?",
        a: "Ano — Megsy rozumí a generuje ve více než 50 jazycích včetně češtiny, arabštiny, španělštiny, francouzštiny, němčiny, portugalštiny, čínštiny, japonštiny, hindštiny a mnoha dalších.",
      },
      {
        q: "Je k dispozici API?",
        a: "Ano. Plány Pro a Elite obsahují vývojářské API pro generování obrázků, tvorbu videa, chat a nástroje. Webhooky jsou k dispozici v plánu Elite.",
      },
      {
        q: "Mohu publikovat svou aplikaci z Megsy Build?",
        a: "Ano. Megsy Build nasadí vaši full-stack aplikaci do spravovaného cloudu s vlastní doménou, SSL, edge cache a databází — vše je připraveno, není vyžadováno žádné DevOps.",
      },
    ],
  },
};

export default cs;
