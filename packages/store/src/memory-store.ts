import {
  applyPatch,
  type DocumentMeta,
  type DocumentPatch,
  type DocumentStore,
  newId,
  type StoredDocument,
} from "./document-store";

export class MemoryStore implements DocumentStore {
  private docs = new Map<string, StoredDocument>();

  async list() {
    return [...this.docs.values()]
      .map(({ file: _, ...meta }) => meta)
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }

  async open(id: string) {
    return structuredClone(this.docs.get(id) ?? null);
  }

  async save({ id, title, file }: Parameters<DocumentStore["save"]>[0]) {
    const now = Date.now();
    const existing = id ? this.docs.get(id) : undefined;
    const meta: DocumentMeta = {
      id: id ?? newId(),
      title,
      name: existing?.name,
      path: existing?.path,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };
    this.docs.set(meta.id, { ...meta, file: structuredClone(file) });
    return meta;
  }

  async update(id: string, patch: DocumentPatch) {
    const doc = this.docs.get(id);
    if (doc) this.docs.set(id, { ...applyPatch(doc, patch), file: doc.file });
  }

  async remove(id: string) {
    this.docs.delete(id);
  }
}
