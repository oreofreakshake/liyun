import { decodeLexicon } from "./lexicon";
import { isMark, LETTERS, MARKS, normalize } from "./thaana";

const ALPHABET = [...LETTERS, ...MARKS];

const CONFUSED = [
  "ަާ",
  "ިީ",
  "ުޫ",
  "ެޭ",
  "ޮޯ",
  "އށ",
  "އތ",
  "ށތ",
  "ސށ",
  "ސހ",
  "ހޙ",
  "ހޚ",
  "ސޘ",
  "ސޞ",
  "ށޝ",
  "ޒޛ",
  "ޒޜ",
  "ޒޡ",
  "ދޑ",
  "ޑޟ",
  "ތޓ",
  "ތޠ",
  "އޢ",
  "ގޣ",
  "ކޤ",
  "ވޥ",
];
const confused = new Set(CONFUSED.flatMap(([a, b]) => [a + b, b + a]));

const COST = {
  confused: 0.3,
  mark: 0.5,
  transpose: 0.8,
  letter: 1,
};
const LEVEL_WEIGHT = 0.1;

function substitutionCost(from: string, to: string) {
  if (confused.has(from + to)) return COST.confused;
  if (isMark(from) && isMark(to)) return COST.mark;
  return COST.letter;
}

const insertCost = (char: string) => (isMark(char) ? COST.mark : COST.letter);

function edits(word: string) {
  const out = new Map<string, number>();
  const add = (candidate: string, cost: number) => {
    const known = out.get(candidate);
    if (known === undefined || cost < known) out.set(candidate, cost);
  };
  for (let i = 0; i <= word.length; i++) {
    const head = word.slice(0, i);
    const tail = word.slice(i);
    for (const char of ALPHABET) add(head + char + tail, insertCost(char));
    if (i === word.length) break;
    const char = word[i];
    const rest = word.slice(i + 1);
    add(head + rest, insertCost(char));
    for (const other of ALPHABET) {
      if (other !== char)
        add(head + other + rest, substitutionCost(char, other));
    }
    if (i + 1 < word.length && word[i + 1] !== char) {
      add(head + word[i + 1] + char + word.slice(i + 2), COST.transpose);
    }
  }
  out.delete(word);
  return out;
}

export class SpellChecker {
  #words = new Map<string, number>();

  get size() {
    return this.#words.size;
  }

  load(lexicon: string) {
    decodeLexicon(lexicon, this.#words);
  }

  addWords(words: Iterable<string>, level = 0) {
    for (const word of words) {
      const w = normalize(word);
      this.#words.set(w, Math.max(level, this.#words.get(w) ?? 0));
    }
  }

  isCorrect(word: string) {
    return this.#words.has(normalize(word));
  }

  suggest(word: string, limit = 5) {
    const w = normalize(word);
    const found = new Map<string, number>();
    const keep = (candidate: string, cost: number) => {
      if (candidate === w || !this.#words.has(candidate)) return;
      const known = found.get(candidate);
      if (known === undefined || cost < known) found.set(candidate, cost);
    };
    const first = edits(w);
    for (const [candidate, cost] of first) keep(candidate, cost);
    if (found.size < limit) {
      for (const [step, cost] of first) {
        for (const [candidate, more] of edits(step))
          keep(candidate, cost + more);
      }
    }
    const score = (candidate: string) =>
      (found.get(candidate) ?? 0) -
      LEVEL_WEIGHT * (this.#words.get(candidate) ?? 0);
    return [...found.keys()]
      .sort((a, b) => score(a) - score(b) || a.localeCompare(b))
      .slice(0, limit);
  }
}
