import "./dom";
import { afterEach, describe, expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { Editor } from "@tiptap/core";
import { visualAtoms } from "../../thaana-bidi/test/visual";
import { createEditor, firstParagraph, typeText } from "./editor";

type Fixture = {
  id: string;
  text: string;
  direction: "ltr" | "rtl";
  expected: string[];
};

const dir = join(import.meta.dir, "../../thaana-bidi/fixtures");
const all = readdirSync(dir)
  .filter((name) => name.endsWith(".json"))
  .flatMap((name) =>
    (JSON.parse(readFileSync(join(dir, name), "utf8")) as Fixture[]).map(
      (f) => ({ ...f, file: name }),
    ),
  );

let editor: Editor;
afterEach(() => editor?.destroy());

function check(f: Fixture) {
  const { text, dir } = firstParagraph(editor);
  expect(dir).toBe(f.direction);
  const atoms = visualAtoms(text, dir).atoms;
  expect({ screen: atoms.join(""), atoms }).toEqual({
    screen: f.expected.join(""),
    atoms: f.expected,
  });
}

describe.each(all)("$file: $id", (f) => {
  test("typed one character at a time", () => {
    editor = createEditor();
    typeText(editor, f.text);
    check(f);
  });

  test("pasted at once", () => {
    editor = createEditor();
    editor.commands.insertContent({ type: "text", text: f.text });
    check(f);
  });
});
