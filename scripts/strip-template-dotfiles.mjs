import { readdirSync, statSync, unlinkSync } from "node:fs";
import { join } from "node:path";

const ROOTS = ["public/templates", "dist/templates"];

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    const s = statSync(p);
    if (s.isDirectory()) {
      walk(p);
    } else if (entry === ".gitignore") {
      unlinkSync(p);
      console.log(`removed ${p}`);
    }
  }
}

for (const root of ROOTS) {
  try {
    walk(root);
  } catch (err) {
    // Directory may not exist during the build step; skip silently.
    if (err.code !== "ENOENT") {
      console.error(`Failed to strip dotfiles from ${root}:`, err.message);
      process.exitCode = 1;
    }
  }
}
