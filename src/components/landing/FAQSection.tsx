import { useState } from "react";
import { m as motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";
import { useLandingContent } from "@/lib/landing/LandingContentContext";
import { Helmet } from "react-helmet-async";

const FAQSection = () => {
  const { content } = useLandingContent();
  const { faq } = content;
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.items.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <section id="faq" className="relative overflow-hidden bg-black py-16 md:py-28">
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      {/* Massive FAQs headline */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9 }}
        className="px-4"
      >
        <h2 className="font-display text-[24vw] md:text-[28vw] font-black uppercase leading-[0.8] tracking-tighter text-violet-500 text-center select-none">
          FAQS
        </h2>
      </motion.div>

      {/* Question list */}
      <div className="mx-auto mt-16 max-w-6xl px-6">
        <ul className="border-t border-white/10">
          {faq.items.map((f, i) => {
            const isOpen = openIndex === i;
            return (
              <li key={i} className="border-b border-white/10">
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-panel-${i}`}
                  id={`faq-trigger-${i}`}
                  className="flex w-full items-center justify-between gap-6 py-7 text-left transition-colors hover:text-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded"
                >
                  <span className="font-display text-lg font-bold text-foreground md:text-2xl">
                    {f.q}
                  </span>
                  <span className="shrink-0 text-violet-400" aria-hidden="true">
                    {isOpen ? (
                      <Minus className="h-7 w-7" strokeWidth={2.5} />
                    ) : (
                      <Plus className="h-7 w-7" strokeWidth={2.5} />
                    )}
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      id={`faq-panel-${i}`}
                      role="region"
                      aria-labelledby={`faq-trigger-${i}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <p className="pb-7 pr-12 text-base leading-relaxed text-foreground/60 md:text-lg">
                        {f.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
};

export default FAQSection;
