import type { JSONContent } from "@tiptap/core";
import { parseDocumentFile } from "../export/file";

export const DOCUMENT_EXTENSION = "liyun";

export const openFilters = [
  { name: "Documents", extensions: [DOCUMENT_EXTENSION, "docx", "json"] },
];

export const openAccept = `.${DOCUMENT_EXTENSION},.docx,.json,application/json`;

export function splitFileName(fileName: string) {
  const dot = fileName.lastIndexOf(".");
  if (dot <= 0) return { stem: fileName, extension: "" };
  return {
    stem: fileName.slice(0, dot),
    extension: fileName.slice(dot + 1).toLowerCase(),
  };
}

export type OpenSource = { name: string; path?: string };

export async function contentFromFile(
  fileName: string,
  data: ArrayBuffer,
): Promise<JSONContent> {
  if (splitFileName(fileName).extension === "docx") {
    const { docxToContent } = await import("./docx");
    try {
      return await docxToContent(data);
    } catch {
      throw new Error("This Word file could not be read.");
    }
  }
  return parseDocumentFile(new TextDecoder().decode(data)).content;
}

export async function readDocument(
  fileName: string,
  data: ArrayBuffer,
  path?: string,
): Promise<{ content: JSONContent; source: OpenSource }> {
  const { stem, extension } = splitFileName(fileName);
  const content = await contentFromFile(fileName, data);
  const linked = extension === DOCUMENT_EXTENSION ? path : undefined;
  return { content, source: { name: stem, path: linked } };
}
