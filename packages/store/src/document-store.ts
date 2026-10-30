import type { DocumentFile } from "editor";

export type DocumentMeta = {
  id: string;
  title: string;
  name?: string;
  path?: string;
  createdAt: number;
  updatedAt: number;
};

export type DocumentPatch = Partial<Pick<DocumentMeta, "name" | "path">>;

export function applyPatch(meta: DocumentMeta, patch: DocumentPatch) {
  const next = { ...meta };
  for (const key of ["name", "path"] as const) {
    if (key in patch) next[key] = patch[key]?.trim() || undefined;
  }
  return next;
}

export type StoredDocument = DocumentMeta & { file: DocumentFile };

export interface DocumentStore {
  list(): Promise<DocumentMeta[]>;
  open(id: string): Promise<StoredDocument | null>;
  save(doc: {
    id?: string;
    title: string;
    file: DocumentFile;
  }): Promise<DocumentMeta>;
  update(id: string, patch: DocumentPatch): Promise<void>;
  remove(id: string): Promise<void>;
}

export const displayName = (doc: Pick<DocumentMeta, "name" | "title">) =>
  doc.name || doc.title || "Untitled";

export function newId(): string {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  const b = crypto.getRandomValues(new Uint8Array(16));
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = [...b].map((x) => x.toString(16).padStart(2, "0")).join("");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}
