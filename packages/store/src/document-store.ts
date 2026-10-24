import type { DocumentFile } from "editor";

export type DocumentMeta = {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
};

export type StoredDocument = DocumentMeta & { file: DocumentFile };

export interface DocumentStore {
  list(): Promise<DocumentMeta[]>;
  open(id: string): Promise<StoredDocument | null>;
  save(doc: {
    id?: string;
    title: string;
    file: DocumentFile;
  }): Promise<DocumentMeta>;
  remove(id: string): Promise<void>;
}

export const newId = () => crypto.randomUUID();
