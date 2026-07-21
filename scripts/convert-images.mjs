#!/usr/bin/env node
/**
 * Batch image optimizer.
 * Walks src/assets/ and public/ (excluding icons/logos), and for every
 * .png/.jpg/.jpeg produces sibling .avif and .webp files.
 *
 * Usage:  bun run scripts/convert-images.mjs
 *         bun run scripts/convert-images.mjs --force   (re-encode existing)
 */
import { readdir, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, extname, dirname } from "node:path";
import sharp from "sharp";

const ROOTS = ["src/assets", "public"];
const SKIP_DIRS = new Set([
  "favicon", "model-logos", "brands", "icons", "pwa",
]);
const EXTS = new Set([".png", ".jpg", ".jpeg", ".webp"]);
const FORCE = process.argv.includes("--force");

async function walk(dir, out = []) {
  let entries;
  try { entries = await readdir(dir, { withFileTypes: true }); }
  catch { return out; }
  for (const e of entries) {
    if (e.name.startsWith(".")) continue;
    if (e.isDirectory()) {
      if (SKIP_DIRS.has(e.name)) continue;
      await walk(join(dir, e.name), out);
    } else if (EXTS.has(extname(e.name).toLowerCase())) {
      out.push(join(dir, e.name));
    }
  }
  return out;
}

async function convert(file) {
  const stem = file.slice(0, file.length - extname(file).length);
  const avif = `${stem}.avif`;
  const webp = `${stem}.webp`;
  const isWebpSrc = file.toLowerCase().endsWith(".webp");
  const jobs = [];
  const src = sharp(file);
  const meta = await src.metadata();
  const w = meta.width ?? 0;
  const maxW = w > 1920 ? 1920 : w;

  // Skip webp encoding when the source IS webp.
  if (!isWebpSrc && (FORCE || !existsSync(webp))) {
    jobs.push(
      sharp(file)
        .resize({ width: maxW, withoutEnlargement: true })
        .webp({ quality: 78, effort: 4 })
        .toFile(webp),
    );
  }

  if (FORCE || !existsSync(avif)) {
    jobs.push(
      sharp(file)
        .resize({ width: maxW, withoutEnlargement: true })
        .avif({ quality: 55, effort: 4 })
        .toFile(avif),
    );
  }
  if (jobs.length === 0) return { file, skipped: true };
  await Promise.all(jobs);
  const [a, w2, o] = await Promise.all([
    stat(avif).catch(() => null),
    stat(webp).catch(() => null),
    stat(file),
  ]);
  return {
    file,
    avif: a?.size,
    webp: w2?.size,
    orig: o.size,
  };
}

const files = (await Promise.all(ROOTS.map((r) => walk(r)))).flat();
console.log(`Found ${files.length} images to process (force=${FORCE}).`);

let done = 0, savedAvif = 0, savedWebp = 0, origTotal = 0;
const CONCURRENCY = 4;
async function worker() {
  while (true) {
    const f = files.shift();
    if (!f) return;
    try {
      const r = await convert(f);
      done++;
      if (!r.skipped) {
        origTotal += r.orig;
        if (r.avif) savedAvif += r.orig - r.avif;
        if (r.webp) savedWebp += r.orig - r.webp;
      }
      if (done % 10 === 0) console.log(`  ${done} done…`);
    } catch (e) {
      console.error(`FAIL ${f}: ${e.message}`);
    }
  }
}
await Promise.all(Array.from({ length: CONCURRENCY }, worker));

const mb = (b) => (b / 1024 / 1024).toFixed(2);
console.log(`\nDone: ${done} files`);
console.log(`Original total (converted): ${mb(origTotal)} MB`);
console.log(`AVIF savings: ${mb(savedAvif)} MB`);
console.log(`WebP savings: ${mb(savedWebp)} MB`);
