import type { JSONContent } from "@tiptap/core";
import { DOCUMENT_VERSION, type DocumentFile } from "../document";
import { isTauri, saveNative } from "../native";

export function toDocumentFile(content: JSONContent): DocumentFile {
  return { version: DOCUMENT_VERSION, content };
}

export function parseDocumentFile(text: string): DocumentFile {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("This is not a Liyun document (not valid JSON).");
  }
  const file = data as Partial<DocumentFile>;
  if (typeof file.version !== "number" || file.content?.type !== "doc") {
    throw new Error("This is not a Liyun document.");
  }
  if (file.version > DOCUMENT_VERSION) {
    throw new Error(
      "This document was made by a newer version of Liyun. Update and try again.",
    );
  }
  return { version: DOCUMENT_VERSION, content: file.content };
}

// Characters Windows or macOS refuse in file names, and control characters.
const unsafe = /[\\/:*?"<>|\p{Cc}]/gu;

export function safeFileName(name: string) {
  return name
    .replace(unsafe, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^\.+/, "")
    .slice(0, 120);
}

export async function download(blob: Blob, filename: string) {
  if (isTauri()) return saveNative(blob, filename);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
