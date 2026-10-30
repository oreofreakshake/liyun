import { expect, test } from "bun:test";
import {
  decodeLexicon,
  encodeLexicon,
  isWellFormed,
  levelOf,
  normalize,
  SpellChecker,
  tokenize,
} from "../src";

const words: [string, number][] = [
  ["ކަމަށް", 15],
  ["ކަމަށާ", 4],
  ["ދިވެހި", 14],
  ["ދިވެސް", 2],
  ["މާލެއަށް", 9],
  ["ރަށުގައި", 9],
  ["ރައީސް", 13],
  ["ޙުކޫމަތު", 8],
];

function checker() {
  const c = new SpellChecker();
  c.load(encodeLexicon(words));
  return c;
}

test("tokenize finds Thaana words with offsets and skips other scripts", () => {
  const text = "ދިވެހި Liyun 2026 ރައީސް";
  expect(tokenize(text)).toEqual([
    { word: "ދިވެހި", start: 0, end: 6 },
    { word: "ރައީސް", start: 18, end: 24 },
  ]);
});

test("normalize strips invisible characters", () => {
  expect(normalize("ދިވެ‌ހި")).toBe("ދިވެހި");
  expect(normalize("⁧ރައީސް⁩")).toBe("ރައީސް");
});

test("well-formed: every mark sits on a letter", () => {
  expect(isWellFormed("ކަމަށް")).toBe(true);
  expect(isWellFormed("ހަނދު")).toBe(true);
  expect(isWellFormed("ކަަމަށް")).toBe(false);
  expect(isWellFormed("ަކަމަށް")).toBe(false);
});

test("lexicon round-trips words and levels", () => {
  const decoded = decodeLexicon(encodeLexicon(words), new Map());
  expect(decoded).toEqual(new Map(words));
});

test("levels grow with the log of the count", () => {
  expect(levelOf(5)).toBe(0);
  expect(levelOf(40)).toBe(3);
  expect(levelOf(10_000_000)).toBe(15);
});

test("known words are correct, others are not", () => {
  const c = checker();
  expect(c.isCorrect("ދިވެހި")).toBe(true);
  expect(c.isCorrect("ދިވެހް")).toBe(false);
  expect(c.isCorrect("ދިވެ‍ހި")).toBe(true);
});

test("a doubled fili is fixed by dropping it", () => {
  expect(checker().suggest("ކަަމަށް")[0]).toBe("ކަމަށް");
});

test("a wrong ending prefers the common word", () => {
  expect(checker().suggest("ދިވެހް")[0]).toBe("ދިވެހި");
});

test("a missing sukun is one cheap edit", () => {
  expect(checker().suggest("މާލެއަށ")[0]).toBe("މާލެއަށް");
});

test("short and long vowels are close", () => {
  expect(checker().suggest("ރައިސް")[0]).toBe("ރައީސް");
});

test("letters that share a sound are close", () => {
  expect(checker().suggest("ހުކޫމަތު")[0]).toBe("ޙުކޫމަތު");
});

test("two edits away still finds the word", () => {
  expect(checker().suggest("ރަށްގައި")).toContain("ރަށުގައި");
});

test("added words count as correct", () => {
  const c = checker();
  c.addWords(["ލިޔުން"]);
  expect(c.isCorrect("ލިޔުން")).toBe(true);
});

test("lexicon survives Windows line endings", () => {
  const crlf = encodeLexicon(words).replaceAll("\n", "\r\n");
  expect(decodeLexicon(crlf, new Map())).toEqual(new Map(words));
});
