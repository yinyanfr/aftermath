import path from "node:path";

const CONTENT_ROOT = path.resolve(process.cwd(), "src/content");

const BLOCKED_LINK_TEXTS = new Set([
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

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getCurrentEntryId(file) {
  const astroEntryId = String(file.data?.astro?.entry?.id ?? "");
  if (astroEntryId) return astroEntryId;

  const filePath = file.path ?? file.history?.[0];
  if (!filePath) return "";

  const relativePath = path.relative(CONTENT_ROOT, filePath);
  if (relativePath.startsWith("..")) return "";

  return relativePath
    .replace(/\.(md|mdx)$/i, "")
    .split(path.sep)
    .join("/");
}

function getMatchPattern(keyword, isAscii) {
  const escaped = escapeRegExp(keyword);
  if (!isAscii) return new RegExp(escaped, "g");
  return new RegExp(`(^|[^A-Za-z0-9_])(${escaped})(?=$|[^A-Za-z0-9_])`, "g");
}

function shouldSkipNode(parent) {
  if (!parent) return true;
  return new Set([
    "heading",
    "link",
    "linkReference",
    "inlineCode",
    "code",
    "math",
    "inlineMath",
    "definition",
    "image",
    "imageReference",
    "mdxJsxTextElement",
    "mdxJsxFlowElement",
  ]).has(parent.type);
}

function splitTextNode(value, matches) {
  const children = [];
  let cursor = 0;

  for (const match of matches) {
    if (match.start > cursor) {
      children.push({ type: "text", value: value.slice(cursor, match.start) });
    }

    children.push({
      type: "link",
      url: match.href,
      title: null,
      data: {
        hProperties: {
          target: "_blank",
          rel: "noopener noreferrer",
          className: ["knowledge-link"],
        },
      },
      children: [{ type: "text", value: match.text }],
    });

    cursor = match.end;
  }

  if (cursor < value.length) {
    children.push({ type: "text", value: value.slice(cursor) });
  }

  return children;
}

export function remarkKnowledgeLinks(options) {
  const { resolvedKeywords, getRelativeHref } = options;

  return function transformer(tree, file) {
    const currentEntryId = getCurrentEntryId(file);
    if (!currentEntryId) return;

    const linkedTargets = new Set();

    function visit(node, parent, index) {
      if (!node) return;

      if (node.type === "text" && parent && typeof index === "number") {
        if (shouldSkipNode(parent)) return;

        const value = node.value;
        const matches = [];
        const occupied = [];

        for (const keywordEntry of resolvedKeywords) {
          if (keywordEntry.entryId === currentEntryId) continue;
          if (linkedTargets.has(keywordEntry.entryId)) continue;

          const pattern = getMatchPattern(
            keywordEntry.keyword,
            keywordEntry.isAscii,
          );
          const result = pattern.exec(value);
          if (!result) continue;

          const keywordText = keywordEntry.isAscii ? result[2] : result[0];
          if (BLOCKED_LINK_TEXTS.has(keywordText)) continue;
          const start = keywordEntry.isAscii
            ? result.index + result[1].length
            : result.index;
          const end = start + keywordText.length;

          if (
            occupied.some(
              (range) => !(end <= range.start || start >= range.end),
            )
          ) {
            continue;
          }

          matches.push({
            start,
            end,
            text: keywordText,
            href: getRelativeHref(currentEntryId, keywordEntry.entryId),
            targetEntryId: keywordEntry.entryId,
          });
          occupied.push({ start, end });
          linkedTargets.add(keywordEntry.entryId);
        }

        if (matches.length === 0) return;

        matches.sort((a, b) => a.start - b.start);
        parent.children.splice(index, 1, ...splitTextNode(value, matches));
        return;
      }

      if (!node.children) return;

      for (
        let childIndex = 0;
        childIndex < node.children.length;
        childIndex += 1
      ) {
        visit(node.children[childIndex], node, childIndex);
      }
    }

    visit(tree, null, undefined);
  };
}
