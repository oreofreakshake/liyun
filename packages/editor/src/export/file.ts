import type { JSONContent } from "@tiptap/core";
import { DOCUMENT_VERSION, type DocumentFile } from "../document";

export function toDocumentFile(content: JSONContent): DocumentFile {
  return { version: DOCUMENT_VERSION, content };
}

export function parseDocumentFile(text: string): DocumentFile {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("This file is not a document backup (not valid JSON).");
  }
  const file = data as Partial<DocumentFile>;
  if (typeof file.version !== "number" || file.content?.type !== "doc") {
    throw new Error("This file is not a document backup.");
  }
  if (file.version > DOCUMENT_VERSION) {
    throw new Error(
      "This backup was made by a newer version of the editor. Update and try again.",
    );
  }
  return file as DocumentFile;
}

export function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
