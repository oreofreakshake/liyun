import { expect, test } from "bun:test";
import {
  parseDocumentFile,
  safeFileName,
  toDocumentFile,
} from "../src/export/file";

const content = { type: "doc", content: [{ type: "paragraph" }] };

test("a backup round-trips", () => {
  const text = JSON.stringify(toDocumentFile(content));
  expect(parseDocumentFile(text)).toEqual({ version: 2, content });
});

test("version 1 backups open as the current version", () => {
  const text = JSON.stringify({ version: 1, content });
  expect(parseDocumentFile(text)).toEqual({ version: 2, content });
});

test("rejects files that are not backups", () => {
  expect(() => parseDocumentFile("not json")).toThrow("not valid JSON");
  expect(() => parseDocumentFile('{"hello":1}')).toThrow(
    "not a Liyun document",
  );
});

test("rejects backups from a newer version", () => {
  expect(() =>
    parseDocumentFile(JSON.stringify({ version: 99, content })),
  ).toThrow("newer version");
});

const doc = (texts: string[]) => ({
  type: "doc",
  content: texts.map((text) => ({
    type: "paragraph",
    content: text ? [{ type: "text", text }] : [],
  })),
});

test("titleOf skips an Arabic opening line such as the Bismillah", async () => {
  const { titleOf } = await import("../src/document");
  expect(titleOf(doc(["بسم الله الرحمن الرحيم", "ސިޓީ"]))).toBe("ސިޓީ");
});

test("titleOf takes the first non-empty line and shortens it", async () => {
  const { titleOf } = await import("../src/document");
  expect(titleOf(doc(["", "  ބައްދަލުވުން (Meeting 2026)  ", "x"]))).toBe(
    "ބައްދަލުވުން (Meeting 2026)",
  );
  expect(titleOf(doc([]))).toBe("");
  expect(titleOf(doc(["a".repeat(80)]))).toHaveLength(60);
});

test("file names drop characters the OS refuses", () => {
  expect(safeFileName('  Q3: "plan" / draft?  ')).toBe("Q3 plan draft");
  expect(safeFileName("ބައްދަލުވުން 2026")).toBe("ބައްދަލުވުން 2026");
  expect(safeFileName("..hidden")).toBe("hidden");
  expect(safeFileName("a\tb\nc")).toBe("a b c");
  expect(safeFileName(" <> ")).toBe("");
});
