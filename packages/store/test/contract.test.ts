import "fake-indexeddb/auto";
import { describe, expect, test } from "bun:test";
import { DOCUMENT_VERSION, type DocumentFile } from "editor";
import { type DocumentStore, IndexedDbStore, MemoryStore } from "../src";

const file = (text: string): DocumentFile => ({
  version: DOCUMENT_VERSION,
  content: {
    type: "doc",
    content: [{ type: "paragraph", content: [{ type: "text", text }] }],
  },
});

let dbCount = 0;
const stores: [string, () => DocumentStore][] = [
  ["MemoryStore", () => new MemoryStore()],
  ["IndexedDbStore", () => new IndexedDbStore(`test-${++dbCount}`)],
];

describe.each(stores)("%s", (_, create) => {
  test("starts empty", async () => {
    expect(await create().list()).toEqual([]);
  });

  test("save creates a document that opens again", async () => {
    const store = create();
    const meta = await store.save({ title: "ދިވެހި", file: file("ދިވެހި 50%") });
    expect(meta.id).toBeString();
    const doc = await store.open(meta.id);
    expect(doc?.title).toBe("ދިވެހި");
    expect(doc?.file).toEqual(file("ދިވެހި 50%"));
  });

  test("saving with an id overwrites and keeps createdAt", async () => {
    const store = create();
    const first = await store.save({ title: "a", file: file("a") });
    await Bun.sleep(2);
    const second = await store.save({
      id: first.id,
      title: "b",
      file: file("b"),
    });
    expect(second.id).toBe(first.id);
    expect(second.createdAt).toBe(first.createdAt);
    expect(second.updatedAt).toBeGreaterThan(first.updatedAt);
    expect((await store.open(first.id))?.file).toEqual(file("b"));
    expect(await store.list()).toHaveLength(1);
  });

  test("list is most recently updated first, without content", async () => {
    const store = create();
    const a = await store.save({ title: "a", file: file("a") });
    await Bun.sleep(2);
    await store.save({ title: "b", file: file("b") });
    await Bun.sleep(2);
    await store.save({ id: a.id, title: "a2", file: file("a2") });
    const list = await store.list();
    expect(list.map((d) => d.title)).toEqual(["a2", "b"]);
    expect(list[0]).not.toHaveProperty("file");
  });

  test("remove deletes the document", async () => {
    const store = create();
    const meta = await store.save({ title: "a", file: file("a") });
    await store.remove(meta.id);
    expect(await store.open(meta.id)).toBeNull();
    expect(await store.list()).toEqual([]);
  });

  test("open returns null for unknown ids", async () => {
    expect(await create().open("nope")).toBeNull();
  });

  test("changing an opened document does not change the stored one", async () => {
    const store = create();
    const meta = await store.save({ title: "a", file: file("a") });
    const doc = await store.open(meta.id);
    doc?.file.content.content?.pop();
    expect((await store.open(meta.id))?.file).toEqual(file("a"));
  });
});

test("ids are UUIDs even where crypto.randomUUID is missing (plain http)", async () => {
  const { newId } = await import("../src/document-store");
  const original = crypto.randomUUID;
  Object.defineProperty(crypto, "randomUUID", {
    value: undefined,
    configurable: true,
  });
  try {
    const id = newId();
    expect(id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
    expect(newId()).not.toBe(id);
  } finally {
    Object.defineProperty(crypto, "randomUUID", {
      value: original,
      configurable: true,
    });
  }
});
