// Packs the Lambda: compiles the site's knowledge base (the same one the terminal shows Read(...)
// lines from) to dist/kb.json and copies the handler next to it.
import { execSync } from "node:child_process";
import { copyFileSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";

const here = new URL(".", import.meta.url).pathname;
rmSync(`${here}.build`, { recursive: true, force: true });
rmSync(`${here}dist`, { recursive: true, force: true });
execSync(
  `npx tsc ${here}../src/variants/remix/ask/knowledge.ts --outDir ${here}.build --module commonjs --target es2019 --esModuleInterop --skipLibCheck`,
  { stdio: "inherit" }
);
const { KB } = createRequire(import.meta.url)(`${here}.build/variants/remix/ask/knowledge.js`);
mkdirSync(`${here}dist`);
writeFileSync(`${here}dist/kb.json`, JSON.stringify(KB));
copyFileSync(`${here}handler.mjs`, `${here}dist/handler.mjs`);
console.log(`kb.json: ${KB.length} entries, ${JSON.stringify(KB).length} chars`);
