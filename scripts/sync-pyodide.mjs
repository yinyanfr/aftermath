import { cpSync, existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const sourceDir = resolve(root, "node_modules", "pyodide");
const targetDir = resolve(root, "public", "vendor", "pyodide");

const files = [
  "pyodide.js",
  "pyodide.js.map",
  "pyodide.mjs",
  "pyodide.asm.js",
  "pyodide.asm.wasm",
  "python_stdlib.zip",
  "pyodide-lock.json",
];

if (!existsSync(sourceDir)) {
  throw new Error("pyodide package not found. Run npm install first.");
}

mkdirSync(targetDir, { recursive: true });

for (const file of files) {
  cpSync(resolve(sourceDir, file), resolve(targetDir, file));
}
