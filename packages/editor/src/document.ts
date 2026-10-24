import type { JSONContent } from "@tiptap/core";

export const DOCUMENT_VERSION = 2;

export type DocumentFile = {
  version: typeof DOCUMENT_VERSION;
  content: JSONContent;
};

export type Template = DocumentFile & {
  id: string;
  title: { dv: string; en: string };
  license: "Apache-2.0";
};

const frameParts = ["pageHeader", "pageFooter"];
const arabicOnly = /^[\u0600-\u06FF\s]+$/;

export function titleOf(content: JSONContent, max = 60): string {
  const lines: string[] = [];
  const walk = (node: JSONContent) => {
    if (lines.length || frameParts.includes(node.type ?? "")) return;
    if (node.type === "paragraph" || node.type === "heading") {
      const text = (node.content ?? [])
        .map((n) => (n as { text?: string }).text ?? " ")
        .join("")
        .trim();
      if (text && !arabicOnly.test(text)) lines.push(text);
      return;
    }
    node.content?.forEach(walk);
  };
  walk(content);
  const title = lines[0] ?? "";
  return title.length > max ? `${title.slice(0, max - 1)}…` : title;
}
