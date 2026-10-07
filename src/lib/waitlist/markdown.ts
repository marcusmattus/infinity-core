/**
 * The broadcast body format: a deliberately small subset of Markdown.
 *
 * Email clients are a hostile rendering target, so the composer accepts only
 * what we can render as inline-styled, table-safe HTML: `##` headings, `-`
 * bullets, paragraphs, `**bold**` and `[text](url)` links. Everything is
 * HTML-escaped *first*, then the inline rules run over the escaped text, so a
 * body containing `<script>` becomes visible text rather than markup.
 *
 * Pure and client-safe, so the dashboard can preview exactly what will send.
 */

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Only http(s) links survive; anything else renders as plain text. */
function safeUrl(url: string): string | null {
  const trimmed = url.trim();
  if (!/^https?:\/\//i.test(trimmed)) return null;
  // The URL is already HTML-escaped at this point; a quote cannot break out.
  return trimmed;
}

function inline(escaped: string, linkColor: string): string {
  return escaped
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (match, text: string, url: string) => {
      const href = safeUrl(url);
      if (!href) return text;
      return `<a href="${href}" style="color:${linkColor};text-decoration:underline">${text}</a>`;
    })
    .replace(/\*\*([^*]+)\*\*/g, '<strong style="color:#f5f7fa">$1</strong>');
}

type Block =
  | { kind: "heading"; text: string }
  | { kind: "paragraph"; text: string }
  | { kind: "list"; items: string[] };

/** Splits the body into blocks without interpreting anything inline yet. */
export function parseBlocks(body: string): Block[] {
  const blocks: Block[] = [];
  let paragraph: string[] = [];
  let list: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length) blocks.push({ kind: "paragraph", text: paragraph.join(" ") });
    paragraph = [];
  };
  const flushList = () => {
    if (list.length) blocks.push({ kind: "list", items: list });
    list = [];
  };

  for (const raw of body.replace(/\r\n/g, "\n").split("\n")) {
    const line = raw.trim();

    if (!line) {
      flushParagraph();
      flushList();
      continue;
    }

    if (line.startsWith("## ")) {
      flushParagraph();
      flushList();
      blocks.push({ kind: "heading", text: line.slice(3).trim() });
      continue;
    }

    if (line.startsWith("- ")) {
      flushParagraph();
      list.push(line.slice(2).trim());
      continue;
    }

    flushList();
    paragraph.push(line);
  }

  flushParagraph();
  flushList();
  return blocks;
}

export function renderBodyHtml(body: string, linkColor = "#7aa6ff"): string {
  return parseBlocks(body)
    .map((block) => {
      switch (block.kind) {
        case "heading":
          return `<h2 style="margin:32px 0 12px;font-size:18px;line-height:1.3;font-weight:600;color:#f5f7fa">${inline(
            escapeHtml(block.text),
            linkColor,
          )}</h2>`;
        case "list":
          return `<ul style="margin:0 0 18px;padding-left:20px;color:#c3cada">${block.items
            .map(
              (item) =>
                `<li style="margin:0 0 8px;line-height:1.6">${inline(escapeHtml(item), linkColor)}</li>`,
            )
            .join("")}</ul>`;
        case "paragraph":
          return `<p style="margin:0 0 18px;font-size:15px;line-height:1.65;color:#c3cada">${inline(
            escapeHtml(block.text),
            linkColor,
          )}</p>`;
        default:
          return "";
      }
    })
    .join("");
}

/** The text/plain alternative. Links become "text (url)" so they stay usable. */
export function renderBodyText(body: string): string {
  return parseBlocks(body)
    .map((block) => {
      const flatten = (value: string) =>
        value
          .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (match, text: string, url: string) =>
            safeUrl(url) ? `${text} (${url.trim()})` : text,
          )
          .replace(/\*\*([^*]+)\*\*/g, "$1");

      switch (block.kind) {
        case "heading":
          return `${flatten(block.text).toUpperCase()}\n`;
        case "list":
          return block.items.map((item) => `  - ${flatten(item)}`).join("\n");
        case "paragraph":
          return flatten(block.text);
        default:
          return "";
      }
    })
    .join("\n\n");
}
