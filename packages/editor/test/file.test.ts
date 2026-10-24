import { expect, test } from "bun:test";
import { parseDocumentFile, toDocumentFile } from "../src/export/file";

const content = { type: "doc", content: [{ type: "paragraph" }] };

test("a backup round-trips", () => {
  const text = JSON.stringify(toDocumentFile(content));
  expect(parseDocumentFile(text)).toEqual({ version: 1, content });
});

test("rejects files that are not backups", () => {
  expect(() => parseDocumentFile("not json")).toThrow("not valid JSON");
  expect(() => parseDocumentFile('{"hello":1}')).toThrow(
    "not a document backup",
  );
});

test("rejects backups from a newer version", () => {
  expect(() =>
    parseDocumentFile(JSON.stringify({ version: 99, content })),
  ).toThrow("newer version");
});

test("titleOf takes the first non-empty line and shortens it", async () => {
  const { titleOf } = await import("../src/document");
  const doc = (texts: string[]) => ({
    type: "doc",
    content: texts.map((text) => ({
      type: "paragraph",
      content: text ? [{ type: "text", text }] : [],
    })),
  });
  expect(titleOf(doc(["", "  ބައްދަލުވުން (Meeting 2026)  ", "x"]))).toBe(
    "ބައްދަލުވުން (Meeting 2026)",
  );
  expect(titleOf(doc([]))).toBe("");
  expect(titleOf(doc(["a".repeat(80)]))).toHaveLength(60);
});
