import { m as motion } from "framer-motion";
import { translateExactText, useUserLang } from "@/lib/authI18n";

type Card = {
  title: string;
  description: string;
  bg: string;
  fg: string;
  rotate: number;
  offsetX: number;
};

const cards: Card[] = [
  {
    title: "AI Chat",
    description:
      "Chat naturally with Megsy's own model. Upload files, search the web in real-time, and let AI remember everything.",
    bg: "#22d36b",
    fg: "#000",
    rotate: -4,
    offsetX: 0,
  },
  {
    title: "Image Generation",
    description:
      "Megsy Image — our in-house generator built for cinematic concept art, product shots, and photoreal scenes. One model, every style.",
    bg: "#f5d90a",
    fg: "#000",
    rotate: 3,
    offsetX: 24,
  },
  {
    title: "Video Creation",
    description:
      "Megsy Video — cinematic scenes with camera control, prompt-to-video, and character consistency built in.",
    bg: "#ff6b5e",
    fg: "#000",
    rotate: -3,
    offsetX: 12,
  },
  {
    title: "Code & Deploy",
    description:
      "Describe what you want, watch it come to life. Live preview, GitHub sync & one-click deploy.",
    bg: "#e879c1",
    fg: "#000",
    rotate: 4,
    offsetX: 32,
  },
  {
    title: "Voice & TTS",
    description:
      "Studio-grade speech in 40+ languages, cloned voices, and lip-sync built for cinematic dialogue.",
    bg: "#7dd3fc",
    fg: "#000",
    rotate: -3,
    offsetX: 8,
  },
  {
    title: "Characters & Consistency",
    description:
      "Lock characters, styles, and worlds across every image and video — one identity, endless scenes.",
    bg: "#c4b5fd",
    fg: "#000",
    rotate: 3,
    offsetX: 20,
  },
];

const StickyFeatureTabs = () => {
  const lang = useUserLang();
  const tx = (text: string) => translateExactText(text, lang);

  return (
    <section id="features" className="bg-black py-16 md:py-28 text-foreground overflow-hidden">
      <div className="mx-auto max-w-[1400px] px-5 md:px-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mb-10 md:mb-20 text-center"
        >
          <h2
            id="anchor-what-create"
            style={{ fontFamily: '"Dela Gothic One", sans-serif' }}
            className="uppercase tracking-tight text-foreground leading-[0.95] text-[9vw] md:text-7xl"
          >
            {tx("HOW MEGSY'S AI")}
            <br className="hidden md:inline" />{" "}
            {tx("CREATIVE SUITE WORKS")}
          </h2>
          <p className="mt-4 md:mt-6 mx-auto max-w-2xl text-[13px] md:text-base text-foreground/70 leading-snug">
            {tx("Pick a tool, prompt it, refine it, ship it. Four steps, one creative platform.")}
          </p>
        </motion.div>

        {/* Cinematic staggered grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-7">
          {cards.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 40, rotate: card.rotate }}
              whileInView={{ opacity: 1, y: 0, rotate: card.rotate }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: 0.6,
                delay: (i % 3) * 0.08 + Math.floor(i / 3) * 0.05,
                ease: [0.22, 1, 0.36, 1],
              }}
              whileHover={{ scale: 1.03, rotate: 0, y: -4 }}
              style={{
                backgroundColor: card.bg,
                color: card.fg,
                boxShadow: "0 20px 45px -12px rgba(0,0,0,0.55)",
                marginTop: i % 2 === 1 ? "1.75rem" : 0,
              }}
              className="relative flex flex-col justify-between rounded-ios-lg p-6 md:p-7 min-h-[240px] md:min-h-[280px] transition-shadow"
            >
              <span
                style={{ fontFamily: '"Dela Gothic One", sans-serif' }}
                className="text-[72px] md:text-[96px] leading-none tracking-tighter opacity-90"
              >
                {i + 1}
              </span>
              <div className="mt-4 flex flex-col gap-2">
                <span
                  style={{ fontFamily: '"Dela Gothic One", sans-serif' }}
                  className="text-xl md:text-2xl leading-tight"
                >
                  {tx(card.title)}
                </span>
                <span className="text-[13px] md:text-sm font-medium opacity-80 leading-snug">
                  {tx(card.description)}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StickyFeatureTabs;
