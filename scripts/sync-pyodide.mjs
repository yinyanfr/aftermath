import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const sourceDir = resolve(root, "node_modules", "pyodide");
const targetDir = resolve(root, "public", "vendor", "pyodide");

const runtimeFiles = [
  "pyodide.js",
  "pyodide.js.map",
  "pyodide.mjs",
  "pyodide.asm.js",
  "pyodide.asm.wasm",
  "python_stdlib.zip",
  "pyodide-lock.json",
];

const requiredPackages = ["micropip", "numpy", "sympy", "matplotlib"];

if (!existsSync(sourceDir)) {
  throw new Error("pyodide package not found. Run npm install first.");
}

mkdirSync(targetDir, { recursive: true });

for (const file of runtimeFiles) {
  cpSync(resolve(sourceDir, file), resolve(targetDir, file));
}

const pyodidePackageJson = JSON.parse(
  readFileSync(resolve(sourceDir, "package.json"), "utf8"),
);
const pyodideVersion = String(pyodidePackageJson.version);
const cdnBaseUrl = `https://cdn.jsdelivr.net/pyodide/v${pyodideVersion}/full/`;

const lock = JSON.parse(
  readFileSync(resolve(sourceDir, "pyodide-lock.json"), "utf8"),
);
const packages = lock.packages;
const filesToDownload = new Set();
const visitedPackages = new Set();

function collectPackageFiles(packageName) {
  if (visitedPackages.has(packageName)) return;
  visitedPackages.add(packageName);

  const pkg = packages[packageName];
  if (!pkg) {
    throw new Error(
      `Pyodide package '${packageName}' not found in pyodide-lock.json.`,
    );
  }

  if (pkg.file_name) {
    filesToDownload.add(pkg.file_name);
  }

  for (const dependency of pkg.depends ?? []) {
    collectPackageFiles(dependency);
  }
}

for (const packageName of requiredPackages) {
  collectPackageFiles(packageName);
}

async function downloadFile(fileName) {
  const targetPath = resolve(targetDir, fileName);
  if (existsSync(targetPath)) return;

  const response = await fetch(`${cdnBaseUrl}${fileName}`);
  if (!response.ok) {
    throw new Error(`Failed to download ${fileName} from ${cdnBaseUrl}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  writeFileSync(targetPath, Buffer.from(arrayBuffer));
}

await Promise.all([...filesToDownload].map(downloadFile));
