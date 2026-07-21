import type { LandingContent } from "./types";

const el: LandingContent = {
  meta: {
    title: "Megsy AI — Chat, Slides, Εικόνες, Βίντεο & Κώδικας",
    description:
      "Όλα-σε-ένα πλατφόρμα AI: 80+ μοντέλα για chat, slides, βαθιά έρευνα, παραγωγή εικόνας & βίντεο και δημιουργία full-stack εφαρμογών.",
    keywords:
      "πλατφόρμα AI, εναλλακτική λύση ChatGPT, AI γεννήτρια εικόνων, AI γεννήτρια βίντεο, AI slides, βαθιά έρευνα, full-stack AI builder, Nano Banana Pro, GPT-Image 2, Gemini 3 Pro, Veo 3.1",
    ogLocale: "el_GR",
  },
  hero: {
    h1Pre: "ΜΙΑ AI. ΚΑΘΕ ΔΗΜΙΟΥΡΓΙΚΟ",
    h1Highlight: "ΕΡΓΑΛΕΙΟ ΠΟΥ ΧΡΕΙΑΖΕΣΤΕ.",
    subtitle:
      "Chat, slides, βαθιά έρευνα, εικόνες, βίντεο, κινηματογραφική ποιότητα, lip-sync και full-stack εφαρμογές — χτισμένα στα κορυφαία μοντέλα του κόσμου, ενοποιημένα σε έναν χώρο εργασίας.",
    ctaPrimary: "Ξεκινήστε τη Δημιουργία — Είναι Δωρεάν",
    ctaSecondary: "Πλατφόρμα API",
  },
  chatModels: {
    kicker: "MEGSY CHAT",
    title: "ΕΝΑ CHAT.",
    titleHighlight: "ΚΑΘΕ ΜΟΝΤΕΛΟ.",
    subtitle:
      "Το Megsy δρομολογεί έξυπνα το μήνυμά σας στο καλύτερο μοντέλο — ή επιλέξτε το αγαπημένο σας χειροκίνητα. Αλλάξτε μοντέλο στη μέση της συνομιλίας χωρίς να χάσετε το πλαίσιο.",
    items: [
      {
        name: "Megsy",
        tag: "Προεπιλογή · Έξυπνη Δρομολόγηση",
        description: "Επιλέγει το τέλειο μοντέλο για κάθε προτροπή. Δωρεάν χρήση.",
      },
      {
        name: "GPT-5",
        tag: "OpenAI",
        description:
          "Κορυφαία συλλογιστική, κωδικοποίηση και συγγραφή κειμένων μεγάλου περιεχομένου.",
      },
      {
        name: "Gemini 2.5 Pro",
        tag: "Google",
        description: "Πλαίσιο 1 εκατομμυρίου token, εγγενής κατανόηση εικόνας και αρχείων.",
      },
      {
        name: "Grok",
        tag: "xAI",
        description: "Γνώση του ιστού σε πραγματικό χρόνο με πνευματώδες, χωρίς λογοκρισία ύφος.",
      },
      {
        name: "DeepSeek",
        tag: "Open-source",
        description: "Αποδοτικό μοντέλο συλλογιστικής για βαριά φορτία εργασίας.",
      },
    ],
    modesTitle: "Εξειδικευμένες Λειτουργίες",
    modes: [
      {
        name: "Λειτουργία Μάθησης",
        description: "Βήμα-προς-βήμα εξηγήσεις, κουίζ και κάρτες μελέτης για οποιοδήποτε θέμα.",
      },
      {
        name: "Λειτουργία Εγγράφων",
        description: "Επαγγελματικές αναφορές, συμβόλαια, ερευνητικές εργασίες και πρότυπα.",
      },
      {
        name: "Βαθιά Έρευνα",
        description: "Αυτόνομη έρευνα πολλαπλών πηγών με αναφορές και πηγές.",
      },
      {
        name: "Slides",
        description: "Δημιουργήστε πλήρεις παρουσιάσεις με εικόνες, διαγράμματα και θέματα.",
      },
    ],
  },
  imageModels: {
    kicker: "ΜΟΝΤΕΛΑ ΕΙΚΟΝΑΣ",
    title: "ΤΕΛΕΙΑ ΣΕ ΚΑΘΕ PIXEL",
    titleHighlight: "ΠΑΡΑΓΩΓΗ ΕΙΚΟΝΑΣ.",
    subtitle:
      "Πέντε κορυφαία μοντέλα συν 20+ επαγγελματικά εργαλεία — face swap, headshots, αφαίρεση φόντου, relight, cartoonify και πολλά άλλα.",
    items: [
      {
        name: "Nano Banana Pro",
        cost: "4 MC",
        description:
          "Φωτορεαλιστική λεπτομέρεια, συνεπείς χαρακτήρες και στυλ επωνυμίας σε ποιότητα στούντιο.",
      },
      {
        name: "Nano Banana 2",
        cost: "3 MC",
        description:
          "Ποιότητα επόμενης γενιάς με προηγμένη απόδοση χεριών, κειμένου και ανατομίας.",
      },
      {
        name: "GPT-Image 2",
        cost: "5 MC",
        description:
          "Το κορυφαίο μοντέλο εικόνας της OpenAI — τέλεια τυπογραφία και σύνθετες σκηνές.",
      },
      {
        name: "Gemini 3 Pro Image",
        cost: "5 MC",
        description:
          "Η κορυφαία γεννήτρια εικόνας της Google με κινηματογραφική σύνθεση και φωτισμό.",
      },
      {
        name: "Nano Banana",
        cost: "2 MC",
        description: "Αστραπιαία δημιουργία για ιδέες και επαναλήψεις μεγάλου όγκου.",
      },
    ],
  },
  codeModels: {
    kicker: "MEGSY BUILD",
    title: "ΑΠΟ PROMPT ΣΕ",
    titleHighlight: "FULL-STACK APP.",
    subtitle:
      "Περιγράψτε τι θέλετε. Το Megsy Build δημιουργεί το React + Tailwind frontend, τη βάση δεδομένων, το auth, το API — και κάνει το deployment.",
    steps: [
      {
        title: "Κώδικας",
        description: "React, TypeScript και Tailwind έτοιμα για παραγωγή με καθαρή αρχιτεκτονική.",
      },
      {
        title: "Cloud",
        description: "Βάση δεδομένων, αποθήκευση, edge functions και auth — συνδεδεμένα αυτόματα.",
      },
      {
        title: "Ταχύτητα",
        description: "Lighthouse-optimized builds, lazy loading και συμπίεση εικόνων ενσωματωμένα.",
      },
      {
        title: "Ασφάλεια",
        description: "Πολιτικές RLS, διαχείριση μυστικών και σαρώσεις εξαρτήσεων σε κάθε αλλαγή.",
      },
      {
        title: "Δημοσίευση",
        description: "Deploy με ένα κλικ στο δικό σας domain με SSL και CDN συμπεριλαμβανόμενα.",
      },
    ],
  },
  howItWorks: {
    title: "ΞΕΚΙΝΗΣΤΕ",
    titleHighlight: "ΜΕ ΤΟ MEGSY",
    subtitle: "Από την εγγραφή μέχρι το deployment σε πέντε απλά βήματα.",
    steps: [
      {
        title: "Δημιουργήστε λογαριασμό",
        description:
          "Εγγραφή σε δευτερόλεπτα και δωρεάν credits για να εξερευνήσετε κάθε μοντέλο αμέσως.",
      },
      {
        title: "Επιλέξτε εργαλείο",
        description:
          "Chat, Image Studio, Video, Cinema, Slides, Docs, Builder — διαλέξτε τον χώρο εργασίας σας.",
      },
      {
        title: "Επιλέξτε μοντέλο",
        description: "80+ μοντέλα από OpenAI, Google, Black Forest Labs, xAI και άλλα.",
      },
      {
        title: "Δημιουργήστε & Βελτιώστε",
        description:
          "Δημιουργήστε, επεξεργαστείτε, αναβαθμίστε την ποιότητα. Το Megsy κρατά κάθε έκδοση στη βιβλιοθήκη σας.",
      },
      {
        title: "Εξαγωγή & Deploy",
        description:
          "Λήψη σε οποιαδήποτε μορφή, δημοσίευση σε προσαρμοσμένο domain ή κοινή χρήση στα social media.",
      },
    ],
  },
  cta: {
    line1: "ΤΩ ΕΜΠΙΣΤΕΥΟΝΤΑΙ",
    line2: "ΚΟΡΥΦΑΙΟΙ ΔΗΜΙΟΥΡΓΟΙ",
    subtitle:
      "Εκατομμύρια δημιουργοί και οι πιο καινοτόμες ομάδες του κόσμου εμπιστεύονται το Megsy για ταχύτερη υλοποίηση με ποιότητα και έλεγχο.",
    button: "Ξεκινήστε τη δημιουργία",
  },
  faq: {
    title: "Συχνές Ερωτήσεις",
    subtitle: "Όλα όσα πρέπει να γνωρίζετε για το Megsy.",
    items: [
      {
        q: "Τι είναι το Megsy;",
        a: "Το Megsy είναι ένας ολοκληρωμένος χώρος εργασίας AI που ενοποιεί 80+ μοντέλα για chat, slides, βαθιά έρευνα, εικόνες, βίντεο, cinema, lip-sync και παραγωγή full-stack κώδικα — σε μία διεπαφή, με ένα σύστημα credits.",
      },
      {
        q: "Ποια μοντέλα AI περιλαμβάνονται;",
        a: "Chat: Megsy, GPT-5.5, Gemini 3 Pro, Claude 4.5, Grok 4, DeepSeek. Εικόνες: Nano Banana Pro, Nano Banana 2, GPT-Image 2, Gemini 3 Pro Image. Βίντεο: Veo 3.1, Kling 3.0 Pro, Runway Gen-4, Hunyuan. Επιπλέον μοντέλα φωνής, lip-sync και builder — όλα σε μία συνδρομή.",
      },
      {
        q: "Πώς λειτουργεί το σύστημα credits MC;",
        a: "Τα MC (Megsy Credits) είναι το νόμισμα της πλατφόρμας. Το chat είναι δωρεάν. Η χρήση εικόνας, βίντεο και εργαλείων κοστίζει έναν μικρό αριθμό MC ανάλογα με το μοντέλο. Οι κατασκευές κώδικα κοστίζουν 5 MC. Τα credits περιλαμβάνονται σε κάθε πλάνο Starter, Pro ή Elite.",
      },
      {
        q: "Ποια πλάνα είναι διαθέσιμα;",
        a: "Starter ($9/mo · 80 MC), Pro ($29/mo · 280 MC, API + δημοσίευση στα social) και Elite ($59/mo · 480 MC, webhooks + εξειδικευμένη υποστήριξη) και Business ($149/mo · 1,480 MC, αποκλειστική υποδομή + SLA). Όλα τα πλάνα καλύπτουν εμπορική χρήση, παραγωγή εικόνας & βίντεο, κώδικα και συγχρονισμό GitHub.",
      },
      {
        q: "Μπορώ να χρησιμοποιήσω το Megsy στη γλώσσα μου;",
        a: "Ναι — το Megsy κατανοεί και παράγει περιεχόμενο σε 50+ γλώσσες, συμπεριλαμβανομένων των Ελληνικών, Αραβικών, Ισπανικών, Γαλλικών, Γερμανικών, Πορτογαλικών, Κινεζικών, Ιαπωνικών, Χίντι και πολλών άλλων.",
      },
      {
        q: "Υπάρχει API;",
        a: "Ναι. Τα πλάνα Pro και Elite περιλαμβάνουν API προγραμματιστή για παραγωγή εικόνας, δημιουργία βίντεο, chat και εργαλεία. Τα webhooks είναι διαθέσιμα στο Elite πλάνο.",
      },
      {
        q: "Μπορώ να δημοσιεύσω την εφαρμογή μου από το Megsy Build;",
        a: "Ναι. Το Megsy Build στέλνει την full-stack εφαρμογή σας σε ένα διαχειριζόμενο cloud, με custom domain, SSL, edge cache και βάση δεδομένων — όλα έτοιμα χωρίς να απαιτείται DevOps.",
      },
    ],
  },
};

export default el;
