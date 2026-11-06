#!/usr/bin/env node
/**
 * "Solid colors only. No gradients anywhere (no bg-gradient-*, no linear-gradient/radial-gradient,
 * no gradient overlays on images, no gradient text). Fail CI if `gradient` appears in `src/**` or CSS."
 */
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import console from "node:console";

const ROOT = process.cwd();
const TARGET_DIRS = [path.join(ROOT, "src")];
const FORBIDDEN_PATTERN = /gradient/i;

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, files);
    } else if (/\.(ts|tsx|js|jsx|css|scss|mdx)$/.test(entry.name)) {
      files.push(fullPath);
    }
  }
  return files;
}

const violations = [];
for (const dir of TARGET_DIRS) {
  for (const file of walk(dir)) {
    const content = fs.readFileSync(file, "utf8");
    const lines = content.split(/\r?\n/);
    lines.forEach((line, idx) => {
      if (FORBIDDEN_PATTERN.test(line)) {
        violations.push({
          file: path.relative(ROOT, file),
          line: idx + 1,
          text: line.trim(),
        });
      }
    });
  }
}

if (violations.length > 0) {
  console.error("\x1b[31m[ERROR] Gradient usage detected! Solid colors only are allowed:\x1b[0m");
  for (const v of violations) {
    console.error(`  ${v.file}:${v.line} -> ${v.text}`);
  }
  process.exit(1);
} else {
  console.log("\x1b[32m[OK] Zero gradients found in src/**.\x1b[0m");
}
