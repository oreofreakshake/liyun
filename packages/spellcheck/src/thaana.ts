const range = (from: number, to: number) =>
  Array.from({ length: to - from + 1 }, (_, i) =>
    String.fromCodePoint(from + i),
  );

export const LETTERS = [...range(0x0780, 0x07a5), "ޱ"];
export const MARKS = range(0x07a6, 0x07b0);
export const SUKUN = "ް";

const markSet = new Set(MARKS);
export const isMark = (char: string) => markSet.has(char);

const WORD = /[ހ-ޱ]+/g;
const INVISIBLE = /[​-‏⁠⁦-⁩﻿]/g;

export function normalize(word: string) {
  return word.normalize("NFC").replace(INVISIBLE, "");
}

export type Token = { word: string; start: number; end: number };

export function tokenize(text: string): Token[] {
  return [...text.matchAll(WORD)].map((m) => ({
    word: m[0],
    start: m.index,
    end: m.index + m[0].length,
  }));
}

export function isWellFormed(word: string) {
  let previousIsLetter = false;
  for (const char of word) {
    const mark = isMark(char);
    if (mark && !previousIsLetter) return false;
    previousIsLetter = !mark;
  }
  return true;
}
