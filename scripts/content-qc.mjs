import fs from "node:fs";
import path from "node:path";

const CONTENT_ROOT = path.resolve(process.cwd(), "src/content");

function walk(directory) {
  const entries = fs.readdirSync(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...walk(fullPath));
      continue;
    }

    if (/\.(md|mdx)$/i.test(entry.name)) {
      files.push(fullPath);
    }
  }

  return files;
}

function relativePath(filePath) {
  return path.relative(process.cwd(), filePath).split(path.sep).join("/");
}

function collectExerciseIssues(source, filePath, issues) {
  const exerciseMatches = [...source.matchAll(/^## 练习 \d+/gm)];
  if (exerciseMatches.length !== 5) {
    issues.push(
      `${filePath}: expected 5 exercises, found ${exerciseMatches.length}`,
    );
  }

  for (let index = 1; index <= 5; index += 1) {
    const currentMatch = exerciseMatches[index - 1];
    if (!currentMatch) continue;

    const start = currentMatch.index ?? 0;
    const end = exerciseMatches[index]?.index ?? source.length;
    const section = source.slice(start, end);
    if (!section) continue;

    for (const heading of ["### 答案", "### 讲解", "### Python 实现"]) {
      if (!section.includes(heading)) {
        issues.push(`${filePath}: 练习 ${index} missing section ${heading}`);
      }
    }
  }
}

function collectWeakPythonIssues(source, filePath, issues) {
  const weakSnippetPattern =
    /<InlinePythonPlayground\s+code=\{`\s*print\((?:"[^"]*"|'[^']*')\)\s*`\}\s*\/>/g;
  const matches = source.match(weakSnippetPattern);
  if (!matches) return;
  issues.push(
    `${filePath}: found ${matches.length} print-only inline Python snippet(s)`,
  );
}

function collectKatexIssues(source, filePath, issues) {
  const mathChinesePattern = /\\text\{[^}]*[一-龥][^}]*\}/g;
  const matches = source.match(mathChinesePattern);
  if (!matches) return;
  issues.push(
    `${filePath}: found ${matches.length} Chinese text-in-math pattern(s)`,
  );
}

const files = walk(CONTENT_ROOT);
const issues = [];

for (const filePath of files) {
  const source = fs.readFileSync(filePath, "utf8");
  const displayPath = relativePath(filePath);
  collectExerciseIssues(source, displayPath, issues);
  collectWeakPythonIssues(source, displayPath, issues);
  collectKatexIssues(source, displayPath, issues);
}

if (issues.length === 0) {
  console.log("content-qc: no issues found");
  process.exit(0);
}

console.log("content-qc: issues found");
for (const issue of issues) {
  console.log(`- ${issue}`);
}
process.exit(1);
