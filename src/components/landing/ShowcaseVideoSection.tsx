/**
 * ShowcaseVideoSection — full-width autoplay showcase video used on both
 * desktop and mobile between the hero and parallax sections. Sourced locally
 * from /public/videos so it doesn't depend on any external CDN.
 */
const SHOWCASE_VIDEO_SRC = "/videos/landing-showcase.mp4";

const ShowcaseVideoSection = () => {
  return (
    <section
      aria-label="Product showcase video"
      className="relative w-full bg-black"
    >
      <div className="mx-auto max-w-6xl px-4 py-10 md:py-16">
        <div className="relative overflow-hidden rounded-2xl border border-white/10 shadow-2xl bg-black">
          <video
            src={SHOWCASE_VIDEO_SRC}
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            aria-hidden
            className="block h-auto w-full object-cover"
          />
        </div>
      </div>
    </section>
  );
};

export default ShowcaseVideoSection;
