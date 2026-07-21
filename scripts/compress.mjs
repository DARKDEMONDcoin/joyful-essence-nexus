import sharp from "sharp";
import { readdirSync, statSync, renameSync } from "node:fs";
import { join, extname } from "node:path";

const ROOTS = ["src/assets", "public"];
const LIMIT = 400 * 1024; // 400KB
const MAX_W = 1600;
const Q = 75;

function* walk(dir) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    const s = statSync(p);
    if (s.isDirectory()) yield* walk(p);
    else yield { p, size: s.size };
  }
}

let saved = 0, count = 0;
for (const root of ROOTS) {
  for (const { p, size } of walk(root)) {
    if (size < LIMIT) continue;
    const ext = extname(p).toLowerCase();
    if (![".webp", ".png", ".jpg", ".jpeg"].includes(ext)) continue;
    try {
      const tmp = p + ".tmp.webp";
      await sharp(p, { failOn: "none" })
        .resize({ width: MAX_W, withoutEnlargement: true })
        .webp({ quality: Q, effort: 4 })
        .toFile(tmp);
      const newSize = statSync(tmp).size;
      if (newSize < size * 0.9) {
        // replace original file but keep same name+ext (browsers don't care about ext mismatch for webp magic bytes, but to be safe keep .webp; for png/jpg, also overwrite with webp bytes — same path so imports still work)
        renameSync(tmp, p);
        saved += size - newSize;
        count++;
        console.log(`✓ ${p}: ${(size/1024).toFixed(0)}KB → ${(newSize/1024).toFixed(0)}KB`);
      } else {
        // remove tmp
        const fs = await import("node:fs");
        fs.unlinkSync(tmp);
      }
    } catch (e) {
      console.log(`✗ ${p}: ${e.message}`);
    }
  }
}
console.log(`\n${count} files, saved ${(saved/1024/1024).toFixed(2)} MB`);
