#!/usr/bin/env node
/** Production start for Render Web Service — serves static Expo web export. */
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";

const port = process.env.PORT || "10000";
const distIndex = "dist/index.html";

if (!existsSync(distIndex)) {
  console.error("Missing dist/index.html — run: npm run build");
  process.exit(1);
}

const child = spawn(
  "npx",
  ["serve", "dist", "-s", "-l", port],
  { stdio: "inherit", shell: true },
);

child.on("exit", (code) => process.exit(code ?? 0));
