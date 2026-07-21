/** @doc Progressive <picture> wrapper: emits AVIF → WebP → original fallback for every <img>. Silently downgrades if variants are missing. */
import { useState, type ImgHTMLAttributes } from "react";


interface SmartImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  /** When true, the browser also considers AVIF (default true). Turn off for tiny icons. */
  avif?: boolean;
  /** When true, the browser also considers WebP (default true). */
  webp?: boolean;
}

/**
 * Progressive image: emits <picture> with AVIF → WebP → original fallback.
 * Assumes sibling files exist at the same path with .avif and .webp extensions
 * (produced by `scripts/convert-images.mjs`). If a variant is missing the
 * browser silently falls back to the next <source>, then to <img src>.
 */
const SmartImage = ({
  src,
  alt,
  avif = true,
  webp = true,
  loading = "lazy",
  decoding = "async",
  ...rest
}: SmartImageProps) => {
  const [failed, setFailed] = useState(false);
  const dot = src.lastIndexOf(".");
  const stem = dot > 0 ? src.slice(0, dot) : src;
  const isRemote = /^https?:\/\//i.test(src);

  if (failed || isRemote) {
    return <img src={src} alt={alt} loading={loading} decoding={decoding} {...rest} />;
  }

  return (
    <picture>
      {avif && <source srcSet={`${stem}.avif`} type="image/avif" />}
      {webp && <source srcSet={`${stem}.webp`} type="image/webp" />}
      <img
        src={src}
        alt={alt}
        loading={loading}
        decoding={decoding}
        onError={() => setFailed(true)}
        {...rest}
      />
    </picture>
  );
};

export default SmartImage;
