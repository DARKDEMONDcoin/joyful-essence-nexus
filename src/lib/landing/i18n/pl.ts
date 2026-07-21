import type { LandingContent } from "./types";

const pl: LandingContent = {
  meta: {
    title: "Megsy AI — Chat, Slajdy, Obrazy, Wideo i Kod",
    description:
      "Wszechstronna platforma AI: ponad 80 modeli do czatu, prezentacji, głębokiego researchu, generowania obrazów i wideo oraz budowania aplikacji full-stack.",
    keywords:
      "platforma AI, alternatywa dla ChatGPT, generator obrazów AI, generator wideo AI, prezentacje AI, głęboki research, kreator aplikacji full-stack AI, Nano Banana Pro, GPT-Image 2, Gemini 3 Pro, Veo 3.1",
    ogLocale: "pl_PL",
  },
  hero: {
    h1Pre: "JEDNO AI. KAŻDE NARZĘDZIE",
    h1Highlight: "KTÓREGO POTRZEBUJESZ.",
    subtitle:
      "Czat, slajdy, głęboki research, obrazy, wideo, kino, lip-sync i aplikacje full-stack — oparte na najlepszych modelach świata, zintegrowane w jednym obszarze roboczym.",
    ctaPrimary: "Zacznij tworzyć — za darmo",
    ctaSecondary: "Platforma API",
  },
  chatModels: {
    kicker: "MEGSY CHAT",
    title: "JEDEN CZAT.",
    titleHighlight: "KAŻDY MODEL.",
    subtitle:
      "Megsy inteligentnie kieruje Twoją wiadomość do najlepszego modelu — możesz też wybrać go ręcznie. Przełączaj się w trakcie rozmowy bez utraty kontekstu.",
    items: [
      {
        name: "Megsy",
        tag: "Domyślny · Inteligentny Router",
        description: "Wybiera idealny model dla każdego zapytania. Darmowy w użyciu.",
      },
      {
        name: "GPT-5",
        tag: "OpenAI",
        description: "Najlepsze w swojej klasie wnioskowanie, kodowanie i pisanie długich tekstów.",
      },
      {
        name: "Gemini 2.5 Pro",
        tag: "Google",
        description: "Kontekst 1 mln tokenów, natywne rozumienie obrazów i plików.",
      },
      {
        name: "Grok",
        tag: "xAI",
        description:
          "Wiedza internetowa w czasie rzeczywistym z błyskotliwym, nieocenzurowanym stylem.",
      },
      {
        name: "DeepSeek",
        tag: "Open-source",
        description: "Ekonomiczny model rozumowania do ciężkich zadań.",
      },
    ],
    modesTitle: "Tryby Specjalistyczne",
    modes: [
      {
        name: "Tryb Nauki",
        description: "Wyjaśnienia krok po kroku, quizy i fiszki na dowolny temat.",
      },
      {
        name: "Tryb Dokumentów",
        description: "Profesjonalne raporty, umowy, prace badawcze i szablony.",
      },
      {
        name: "Deep Research",
        description: "Autonomiczne badanie wielu źródeł wraz z cytatami pochodzenia.",
      },
      {
        name: "Slides",
        description: "Generuj pełne prezentacje z obrazami, wykresami i motywami.",
      },
    ],
  },
  imageModels: {
    kicker: "MODELE OBRAZU",
    title: "GENEROWANIE",
    titleHighlight: "PERFEKCYJNYCH OBRAZÓW.",
    subtitle:
      "Pięć flagowych modeli plus ponad 20 profesjonalnych narzędzi — face swap, zdjęcia profilowe, usuwanie tła, zmiana oświetlenia, cartoonify i więcej.",
    items: [
      {
        name: "Nano Banana Pro",
        cost: "4 MC",
        description: "Fotorealistyczne detale i spójne postacie w jakości studyjnej.",
      },
      {
        name: "Nano Banana 2",
        cost: "3 MC",
        description:
          "Jakość nowej generacji z najnowocześniejszym odwzorowaniem dłoni, tekstu i anatomii.",
      },
      {
        name: "GPT-Image 2",
        cost: "5 MC",
        description: "Flagowy model obrazu od OpenAI — idealna typografia i złożone sceny.",
      },
      {
        name: "Gemini 3 Pro Image",
        cost: "5 MC",
        description: "Najwyższej klasy generator od Google z kinową kompozycją i oświetleniem.",
      },
      {
        name: "Nano Banana",
        cost: "2 MC",
        description: "Błyskawiczne generowanie do burzy mózgów i szybkiej iteracji.",
      },
    ],
  },
  codeModels: {
    kicker: "MEGSY BUILD",
    title: "OD PROMPTU DO",
    titleHighlight: "APLIKACJI FULL-STACK.",
    subtitle:
      "Opisz to, czego potrzebujesz. Megsy Build wygeneruje frontend React + Tailwind, bazę danych, autoryzację, API i wdroży całość.",
    steps: [
      {
        title: "Kod",
        description: "Gotowy do produkcji React, TypeScript i Tailwind z czystą architekturą.",
      },
      {
        title: "Chmura",
        description: "Baza danych, storage i autoryzacja — skonfigurowane automatycznie.",
      },
      {
        title: "Szybkość",
        description: "Optymalizacja Lighthouse, lazy loading i automatyczna kompresja obrazów.",
      },
      {
        title: "Bezpieczeństwo",
        description:
          "Polityki RLS, zarządzanie sekretami i skanowanie zależności przy każdej zmianie.",
      },
      {
        title: "Publikacja",
        description: "Wdrożenie jednym kliknięciem na własną domenę z SSL i CDN w pakiecie.",
      },
    ],
  },
  howItWorks: {
    title: "ZACZNIJ",
    titleHighlight: "Z MEGSY",
    subtitle: "Od rejestracji do wdrożenia w pięciu prostych krokach.",
    steps: [
      {
        title: "Utwórz konto",
        description:
          "Zarejestruj się w kilka sekund i odbierz darmowe kredyty, aby od razu przetestować każdy model.",
      },
      {
        title: "Wybierz narzędzie",
        description:
          "Czat, Studio Obrazu, Wideo, Kino, Slajdy, Dokumenty, Kreator — wybierz swój obszar pracy.",
      },
      {
        title: "Wybierz model",
        description: "Ponad 80 modeli od OpenAI, Google, Black Forest Labs, xAI i innych.",
      },
      {
        title: "Twórz i ulepszaj",
        description:
          "Generuj, edytuj, powiększaj, zmieniaj styl. Megsy zapisuje każdą wersję w Twojej bibliotece.",
      },
      {
        title: "Eksportuj i wdrażaj",
        description:
          "Pobieraj w dowolnym formacie, publikuj na własnej domenie lub udostępniaj w mediach społecznościowych.",
      },
    ],
  },
  cta: {
    line1: "ZAUFALI NAM",
    line2: "NAJLEPSI TWÓRCY",
    subtitle:
      "Miliony twórców i najbardziej innowacyjne zespoły świata ufają Megsy, aby publikować szybciej, z pełną kontrolą i jakością.",
    button: "Zacznij generować",
  },
  faq: {
    title: "FAQ",
    subtitle: "Wszystko, co musisz wiedzieć o Megsy.",
    items: [
      {
        q: "Czym jest Megsy?",
        a: "Megsy to wszechstronny obszar roboczy AI, który łączy ponad 80 modeli do czatowania, tworzenia slajdów, głębokiego researchu, obrazów, wideo, kina, synchronizacji ruchu warg i generowania kodu full-stack — w jednym interfejsie i jednym systemie kredytowym.",
      },
      {
        q: "Jakie modele AI są dostępne?",
        a: "Czat: Megsy, GPT-5.5, Gemini 3 Pro, Claude 4.5, Grok 4, DeepSeek. Obrazy: Nano Banana Pro, Nano Banana 2, GPT-Image 2, Gemini 3 Pro Image. Wideo: Veo 3.1, Kling 3.0 Pro, Runway Gen-4, Hunyuan. Plus modele głosowe, lip-sync i budowniczy aplikacji — wszystko w jednej subskrypcji.",
      },
      {
        q: "Jak działa system kredytowy MC?",
        a: "MC (Megsy Credits) to waluta platformy. Czat jest darmowy; generowanie obrazów, wideo i praca narzędzi kosztuje niewielką ilość MC w zależności od modelu. Budowa aplikacji kosztuje 5 MC. Kredyty są dołączane do każdego planu Starter, Pro i Elite.",
      },
      {
        q: "Jakie plany są dostępne?",
        a: "Starter ($9/mo · 80 MC), Pro ($29/mo · 280 MC, API + publikacja w social media), Elite ($59/mo · 480 MC, webhooki + dedykowane wsparcie) oraz Business ($149/mo · 1,480 MC, dedykowana infrastruktura + SLA). Wszystkie plany obejmują użytek komercyjny, generowanie obrazów/wideo, kod i synchronizację z GitHub.",
      },
      {
        q: "Czy mogę używać Megsy w moim języku?",
        a: "Tak — Megsy rozumie i generuje treści w ponad 50 językach, w tym po polsku, arabsku, hiszpańsku, francusku, niemiecku, portugalsku, chińsku, japońsku, hindi i wielu innych.",
      },
      {
        q: "Czy dostępne jest API?",
        a: "Tak. Plany Pro i Elite obejmują API programistyczne do generowania obrazów, tworzenia wideo, czatu i narzędzi. Webhooki są dostępne w planie Elite.",
      },
      {
        q: "Czy mogę opublikować aplikację z Megsy Build?",
        a: "Tak. Megsy Build wysyła Twoją aplikację full-stack do zarządzanej chmury z własną domeną, SSL, edge cache i bazą danych — bez konieczności znajomości DevOps.",
      },
    ],
  },
};

export default pl;
