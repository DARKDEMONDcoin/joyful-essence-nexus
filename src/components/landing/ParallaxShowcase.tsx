import { m as motion } from "framer-motion";
import LazyVideo from "@/components/landing/LazyVideo";
import parallaxAr from "@/assets/landing/parallax-showcase-ar.mp4.asset.json";
import parallaxEn from "@/assets/landing/parallax-showcase-en.mp4.asset.json";
import { useLandingContent } from "@/lib/landing/LandingContentContext";

const ParallaxShowcase = () => {
  const { locale } = useLandingContent();
  const isArabic = locale.code.startsWith("ar");
  const videoUrl = isArabic ? parallaxAr.url : parallaxEn.url;
  return (
    <section dir="rtl" className="relative scroll-mt-28 py-16 md:py-24">
      <div className="pointer-events-none absolute inset-x-0 top-1/2 -z-10 h-[480px] -translate-y-1/2 bg-gradient-to-b from-fuchsia-500/[0.07] via-purple-500/[0.04] to-transparent blur-3xl" />

      <div className="mx-auto mb-10 max-w-3xl px-6 text-center md:mb-14">
        <motion.h2
          id="anchor-depth"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl md:text-6xl"
        >
          شوف Megsy وهي شغّالة
          <span className="mt-2 block bg-gradient-to-r from-purple-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
            شات، صور، فيديو وكود
          </span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-foreground/70 md:text-lg"
        >
          مساحة واحدة تنقّلك بين كل أدوات الـ AI من غير ما تخرج من التطبيق.
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 60, scale: 0.96 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="mx-auto w-full max-w-6xl px-4 md:px-6"
      >
        <div className="relative overflow-hidden rounded-2xl border border-white/10 md:rounded-[28px]">
          <LazyVideo src={videoUrl} className="aspect-video w-full" />
        </div>

      </motion.div>
    </section>
  );
};

export default ParallaxShowcase;
