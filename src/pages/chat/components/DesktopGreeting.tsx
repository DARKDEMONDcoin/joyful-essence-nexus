import { useEffect, useState } from "react";
import { m as motion } from "framer-motion";
import { WavyBackground } from "@/components/ui/wavy-background";

interface DesktopGreetingProps {
  userName: string | null | undefined;
  isFirstVisit: boolean;
  returningGreetingIdx: number;
}

const entryTaglines = [
  "Let's cook something up.",
  "What should we build today?",
  "Drop an idea and I'll run with it.",
  "Start with a thought. I'll shape it.",
  "Tell me what you want to create.",
];

/**
 * Desktop-only chat empty state. The line changes once per page entry and then
 * stays fixed, sitting over the wavy canvas background.
 *
 * NOTE: Desktop-only (hidden md:flex). Do not repurpose for mobile.
 */
export const DesktopGreeting = (_: DesktopGreetingProps) => {
  const [tagline, setTagline] = useState(entryTaglines[0]);

  useEffect(() => {
    const key = "megsy:desktop-greeting-index";
    const previous = Number(window.localStorage.getItem(key) || "-1");
    const next = Number.isFinite(previous) ? (previous + 1) % entryTaglines.length : 0;
    window.localStorage.setItem(key, String(next));
    setTagline(entryTaglines[next]);
  }, []);

  return (
    <>
      <WavyBackground
        aria-hidden
        containerClassName="pointer-events-none fixed inset-0 z-[1] hidden h-screen md:flex"
        backgroundFill="#030712"
        colors={["#38bdf8", "#60a5fa", "#818cf8", "#c084fc", "#22d3ee"]}
        blur={14}
        speed="slow"
        waveWidth={58}
        waveOpacity={0.42}
      />

      <div className="relative z-[7] hidden md:flex items-center justify-center px-6 pb-6 w-full">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="relative flex flex-col items-center text-center max-w-4xl mx-auto"
        >
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p
              data-greeting
              dir="ltr"
              className="max-w-4xl text-center text-[42px] font-semibold leading-[1.06] text-white drop-shadow-[0_0_28px_rgba(96,165,250,0.28)] lg:text-[58px]"
              style={{ fontFamily: "'Instrument Serif', 'Fraunces', ui-serif, Georgia, serif" }}
            >
              {tagline}
            </p>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
};

export default DesktopGreeting;
