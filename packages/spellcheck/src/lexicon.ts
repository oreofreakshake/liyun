export const LEXICON_HEADER = "liyun-lexicon 1";
export const MAX_LEVEL = 15;

const PREFIX_BASE = 0x21;
const MAX_PREFIX = 0x7e - PREFIX_BASE;

export function levelOf(count: number) {
  return Math.max(0, Math.min(MAX_LEVEL, Math.floor(Math.log2(count / 5))));
}

export function encodeLexicon(
  entries: Iterable<[word: string, level: number]>,
) {
  const byLevel = new Map<number, string[]>();
  for (const [word, level] of entries) {
    const words = byLevel.get(level) ?? [];
    words.push(word);
    byLevel.set(level, words);
  }
  const lines = [LEXICON_HEADER];
  for (const level of [...byLevel.keys()].sort((a, b) => b - a)) {
    lines.push(`\t${level}`);
    let previous = "";
    for (const word of (byLevel.get(level) ?? []).sort()) {
      let shared = 0;
      const limit = Math.min(previous.length, word.length, MAX_PREFIX);
      while (shared < limit && previous[shared] === word[shared]) shared++;
      lines.push(
        String.fromCharCode(PREFIX_BASE + shared) + word.slice(shared),
      );
      previous = word;
    }
  }
  return `${lines.join("\n")}\n`;
}

export function decodeLexicon(text: string, into: Map<string, number>) {
  const lines = text.split(/\r?\n/);
  if (lines[0] !== LEXICON_HEADER) throw new Error("Not a Liyun lexicon");
  let level = 0;
  let previous = "";
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;
    if (line[0] === "\t") {
      level = Number(line.slice(1));
      previous = "";
      continue;
    }
    const shared = line.charCodeAt(0) - PREFIX_BASE;
    const word = previous.slice(0, shared) + line.slice(1);
    into.set(word, Math.max(level, into.get(word) ?? 0));
    previous = word;
  }
  return into;
}
