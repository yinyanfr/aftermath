import fs from "node:fs";
import path from "node:path";

const CONTENT_ROOT = path.resolve(process.cwd(), "src/content");

const BLOCKED_KEYWORDS = new Set([
  "集合",
  "函数",
  "等式",
  "方程",
  "区间",
  "组合",
  "建模",
  "体积",
  "比例",
  "几何意义",
  "化简",
]);

function walkContentFiles(directory) {
  const entries = fs.readdirSync(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkContentFiles(fullPath));
      continue;
    }

    if (/\.(md|mdx)$/i.test(entry.name)) {
      files.push(fullPath);
    }
  }

  return files;
}

function extractFrontmatter(fileContent) {
  const match = fileContent.match(/^---\n([\s\S]*?)\n---/);
  return match?.[1] ?? "";
}

function extractScalar(frontmatter, key) {
  const match = frontmatter.match(new RegExp(`^${key}:\\s*(.+)$`, "m"));
  if (!match) return null;
  return match[1].trim().replace(/^['"]|['"]$/g, "");
}

function extractList(frontmatter, key) {
  const blockMatch = frontmatter.match(
    new RegExp(`^${key}:\\s*\\n((?:^\\s+-\\s+.+\\n?)*)`, "m"),
  );
  if (!blockMatch) return [];

  return blockMatch[1]
    .split("\n")
    .map((line) => line.match(/^\s+-\s+(.+)$/)?.[1]?.trim() ?? "")
    .filter(Boolean)
    .map((value) => value.replace(/^['"]|['"]$/g, ""));
}

function getEntryId(filePath) {
  const relativePath = path.relative(CONTENT_ROOT, filePath);
  return relativePath
    .replace(/\.(md|mdx)$/i, "")
    .split(path.sep)
    .join("/");
}

function getRelativeHref(fromEntryId, toEntryId) {
  const relative = path.posix.relative(fromEntryId, toEntryId);
  return `${relative || "."}/`;
}

function isAsciiKeyword(keyword) {
  return /^[A-Za-z0-9_\- ]+$/.test(keyword);
}

function buildCandidate(keyword, entryId, priority) {
  return {
    keyword,
    entryId,
    priority,
    isAscii: isAsciiKeyword(keyword),
  };
}

export function buildKnowledgeLinkData() {
  const files = walkContentFiles(CONTENT_ROOT);
  const entryMeta = [];

  for (const filePath of files) {
    const source = fs.readFileSync(filePath, "utf8");
    const frontmatter = extractFrontmatter(source);
    const title = extractScalar(frontmatter, "title");
    const aliases = extractList(frontmatter, "aliases");
    if (!title) continue;

    entryMeta.push({
      entryId: getEntryId(filePath),
      title,
      aliases,
    });
  }

  const keywordMap = new Map();

  for (const entry of entryMeta) {
    const candidates = [
      buildCandidate(entry.title, entry.entryId, 2),
      ...entry.aliases.map((alias) => buildCandidate(alias, entry.entryId, 3)),
    ];

    for (const candidate of candidates) {
      const normalizedKeyword = candidate.keyword.trim();
      if (!normalizedKeyword || normalizedKeyword.length < 2) continue;
      if (BLOCKED_KEYWORDS.has(normalizedKeyword)) continue;

      const bucket = keywordMap.get(normalizedKeyword) ?? [];
      bucket.push(candidate);
      keywordMap.set(normalizedKeyword, bucket);
    }
  }

  const resolvedKeywords = [];

  for (const [keyword, candidates] of keywordMap.entries()) {
    const uniqueEntryIds = [
      ...new Set(candidates.map((candidate) => candidate.entryId)),
    ];
    if (uniqueEntryIds.length !== 1) continue;

    const winner = candidates.sort((a, b) => b.priority - a.priority)[0];
    resolvedKeywords.push({
      keyword,
      entryId: winner.entryId,
      isAscii: winner.isAscii,
    });
  }

  resolvedKeywords.sort((a, b) => b.keyword.length - a.keyword.length);

  const entriesById = new Map(entryMeta.map((entry) => [entry.entryId, entry]));

  return {
    entriesById,
    resolvedKeywords,
    getRelativeHref,
  };
}
