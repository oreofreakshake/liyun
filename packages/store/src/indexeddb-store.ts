import {
  applyPatch,
  type DocumentMeta,
  type DocumentPatch,
  type DocumentStore,
  newId,
  type StoredDocument,
} from "./document-store";

const VERSION = 1;
const META = "meta";
const CONTENT = "content";

function request<T>(req: IDBRequest<T>) {
  return new Promise<T>((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function done(tx: IDBTransaction) {
  return new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

export class IndexedDbStore implements DocumentStore {
  private db: Promise<IDBDatabase>;

  constructor(name = "write-documents") {
    const open = indexedDB.open(name, VERSION);
    open.onupgradeneeded = () => {
      const db = open.result;
      db.createObjectStore(META, { keyPath: "id" });
      db.createObjectStore(CONTENT);
    };
    this.db = request(open);
  }

  async list() {
    const db = await this.db;
    const all = await request<DocumentMeta[]>(
      db.transaction(META).objectStore(META).getAll(),
    );
    return all.sort((a, b) => b.updatedAt - a.updatedAt);
  }

  async open(id: string): Promise<StoredDocument | null> {
    const db = await this.db;
    const tx = db.transaction([META, CONTENT]);
    const [meta, file] = await Promise.all([
      request<DocumentMeta | undefined>(tx.objectStore(META).get(id)),
      request<StoredDocument["file"] | undefined>(
        tx.objectStore(CONTENT).get(id),
      ),
    ]);
    return meta && file ? { ...meta, file } : null;
  }

  async save({ id, title, file }: Parameters<DocumentStore["save"]>[0]) {
    const db = await this.db;
    const tx = db.transaction([META, CONTENT], "readwrite");
    const metaStore = tx.objectStore(META);
    const existing = id
      ? await request<DocumentMeta | undefined>(metaStore.get(id))
      : undefined;
    const now = Date.now();
    const meta: DocumentMeta = {
      id: id ?? newId(),
      title,
      name: existing?.name,
      path: existing?.path,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };
    metaStore.put(meta);
    tx.objectStore(CONTENT).put(file, meta.id);
    await done(tx);
    return meta;
  }

  async update(id: string, patch: DocumentPatch) {
    const db = await this.db;
    const tx = db.transaction(META, "readwrite");
    const store = tx.objectStore(META);
    const meta = await request<DocumentMeta | undefined>(store.get(id));
    if (meta) store.put(applyPatch(meta, patch));
    await done(tx);
  }

  async remove(id: string) {
    const db = await this.db;
    const tx = db.transaction([META, CONTENT], "readwrite");
    tx.objectStore(META).delete(id);
    tx.objectStore(CONTENT).delete(id);
    await done(tx);
  }
}
