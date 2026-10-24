import { type DocumentStore, IndexedDbStore, MemoryStore } from "store";

let store: DocumentStore | undefined;

export function documentStore(): DocumentStore {
  if (!store) {
    store =
      typeof indexedDB === "undefined"
        ? new MemoryStore()
        : new IndexedDbStore();
  }
  return store;
}

export const isPersistent = () => !(documentStore() instanceof MemoryStore);

export function fallBackToMemory() {
  store = new MemoryStore();
}
