import bidiFactory from "bidi-js";

const bidi = bidiFactory();

export const LRI = "\u2066";
export const RLI = "\u2067";
export const FSI = "\u2068";
export const PDI = "\u2069";
const isolateControl = /[\u2066-\u2069]/;

const atomPattern =
  /\p{Script=Thaana}+|[\p{L}\p{M}]+|\p{Nd}+|[\u2066-\u2069]|[\s\S]/gu;

export function visualAtoms(text: string, direction: "ltr" | "rtl" | "auto") {
  const levels = bidi.getEmbeddingLevels(text, direction);
  const order = bidi.getReorderedIndices(text, levels);
  const mirrored = bidi.getMirroredCharactersMap(text, levels.levels);

  const visualPos = new Map<number, number>();
  order.forEach((logical, visual) => {
    visualPos.set(logical, visual);
  });

  const atoms: { text: string; pos: number }[] = [];
  for (const match of text.matchAll(atomPattern)) {
    const atom = match[0];
    if (isolateControl.test(atom)) continue;
    const start = match.index;
    const positions = [...atom].map((_, i) =>
      visualPos.get(start + i),
    ) as number[];
    const min = Math.min(...positions);
    const contiguous = Math.max(...positions) - min === atom.length - 1;
    const shown = atom.length === 1 ? (mirrored.get(start) ?? atom) : atom;
    atoms.push({ text: contiguous ? shown : `⟦${shown}⟧`, pos: min });
  }

  return {
    atoms: atoms.sort((a, b) => a.pos - b.pos).map((a) => a.text),
    paragraphDirection: levels.paragraphs[0]?.level % 2 ? "rtl" : "ltr",
  };
}

export function isolate(text: string, spans: string[]) {
  let out = text;
  for (const span of spans) {
    const at = out.indexOf(span);
    if (at < 0) throw new Error(`span not found: ${span}`);
    out = `${out.slice(0, at)}${LRI}${span}${PDI}${out.slice(at + span.length)}`;
  }
  return out;
}

export function isolateSpans(
  text: string,
  spans: { start: number; end: number }[],
) {
  let out = text;
  for (const { start, end } of [...spans].sort((a, b) => b.start - a.start)) {
    out = `${out.slice(0, start)}${LRI}${out.slice(start, end)}${PDI}${out.slice(end)}`;
  }
  return out;
}
