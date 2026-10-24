export type Direction = "ltr" | "rtl";
export type Span = { start: number; end: number };

const thaanaLetter = /[\u0780-\u07A5\u07B1]/u;
const thaana = /\p{Script=Thaana}/u;
const latinLetter = /\p{Script=Latin}/u;
const ltrStrong = /[\p{Script=Latin}\p{Nd}]/u;
const sentenceEnd = /[.,:;\u060C\u061B\u061F]+$/u;

function words(text: string) {
  return [...text.matchAll(/\S+/gu)].map((m) => ({
    text: m[0],
    start: m.index,
    end: m.index + m[0].length,
  }));
}

export function paragraphDirection(
  text: string,
  fallback: Direction = "rtl",
): Direction {
  const strong = words(text)
    .map((w) =>
      thaanaLetter.test(w.text)
        ? "thaana"
        : latinLetter.test(w.text)
          ? "latin"
          : null,
    )
    .filter((kind) => kind !== null);
  if (strong.length === 0) return fallback;

  const latin = strong.filter((kind) => kind === "latin").length;
  const latinEdges = strong[0] === "latin" && strong.at(-1) === "latin";
  return latinEdges && latin > strong.length - latin ? "ltr" : "rtl";
}

export function ltrRuns(text: string): Span[] {
  const runs: Span[] = [];
  let run: Span | null = null;

  for (const word of words(text)) {
    if (thaana.test(word.text)) {
      run = null;
      continue;
    }
    if (!ltrStrong.test(word.text)) continue;
    if (run) run.end = word.end;
    else {
      run = { start: word.start, end: word.end };
      runs.push(run);
    }
  }

  for (const r of runs) {
    const trailing = text.slice(r.start, r.end).match(sentenceEnd);
    if (trailing && r.end === text.trimEnd().length) {
      r.end -= trailing[0].length;
    }
  }
  return runs.filter((r) => r.end > r.start);
}

const LRM = String.fromCodePoint(0x200e);

export function withLtrMarks(text: string, runs: Span[]) {
  let out = text;
  for (const { start, end } of [...runs].sort((a, b) => b.start - a.start)) {
    out = `${out.slice(0, start)}${LRM}${out.slice(start, end)}${LRM}${out.slice(end)}`;
  }
  return out;
}
