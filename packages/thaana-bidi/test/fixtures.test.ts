import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { ltrRuns, paragraphDirection, withLtrMarks } from "../src";
import { isolate, isolateSpans, visualAtoms } from "./visual";

type Fixture = {
  id: string;
  text: string;
  direction: "ltr" | "rtl";
  expected: string[];
  reference: string[];
  breaks: {
    inWrongDirection: boolean;
    withAutoDirection: boolean;
    withoutIsolation: boolean;
  };
  source: string;
  status?: string;
  note: string;
};

const dir = join(import.meta.dir, "../fixtures");
const files = readdirSync(dir)
  .filter((name) => name.endsWith(".json"))
  .map((name) => ({ name, source: readFileSync(join(dir, name), "utf8") }));
const all = files.flatMap(({ name, source }) =>
  (JSON.parse(source) as Fixture[]).map((f) => ({ ...f, file: name })),
);

const maxFileChars = 3000;

test.each(files)("$name is at most 3000 characters", ({ source }) => {
  expect([...source].length).toBeLessThanOrEqual(maxFileChars);
});

const layout = (atoms: string[]) => ({ screen: atoms.join(""), atoms });

describe.each(all)("$file: $id", (f) => {
  test("reference isolation produces the expected layout", () => {
    const actual = visualAtoms(isolate(f.text, f.reference), f.direction);
    expect(layout(actual.atoms)).toEqual(layout(f.expected));
  });

  test("plain UBA breaks exactly as recorded", () => {
    const differs = (atoms: string[]) =>
      JSON.stringify(atoms) !== JSON.stringify(f.expected);
    const wrong = f.direction === "rtl" ? "ltr" : "rtl";
    expect({
      inWrongDirection: differs(visualAtoms(f.text, wrong).atoms),
      withAutoDirection:
        visualAtoms(f.text, "auto").paragraphDirection !== f.direction,
      withoutIsolation: differs(visualAtoms(f.text, f.direction).atoms),
    }).toEqual(f.breaks);
  });

  test("thaana-bidi picks the paragraph direction", () => {
    expect(paragraphDirection(f.text)).toBe(f.direction);
  });

  test("LRM marks (used for DOCX) give the same layout", () => {
    const direction = paragraphDirection(f.text);
    const runs = direction === "rtl" ? ltrRuns(f.text) : [];
    const lrm = String.fromCodePoint(0x200e);
    const atoms = visualAtoms(withLtrMarks(f.text, runs), direction).atoms;
    expect(layout(atoms.filter((a) => a !== lrm))).toEqual(layout(f.expected));
  });

  test("thaana-bidi lays it out as expected", () => {
    const direction = paragraphDirection(f.text);
    const runs = direction === "rtl" ? ltrRuns(f.text) : [];
    const actual = visualAtoms(isolateSpans(f.text, runs), direction);
    expect(layout(actual.atoms)).toEqual(layout(f.expected));
  });
});
