import "./dom";
import { afterEach, expect, test } from "bun:test";
import { Editor } from "@tiptap/core";
import type { Speller } from "spellcheck";
import { coreExtensionOptions, editorExtensions } from "../src/extensions";
import { misspellingAt, Spellcheck, spellcheckKey } from "../src/spellcheck";

const known = new Set(["ދިވެހި", "ބަސް", "ލިޔުން"]);
const speller: Speller = {
  check: async (words) => words.filter((w) => !known.has(w)),
  suggest: async () => [],
  ready: Promise.resolve(true),
};

let editor: Editor;
afterEach(() => editor?.destroy());

function create(content: string, saved: string[] = [], use = speller) {
  const personal = {
    words: saved,
    save(words: string[]) {
      this.words = words;
    },
    load() {
      return this.words;
    },
  };
  editor = new Editor({
    element: document.createElement("div"),
    extensions: [
      ...editorExtensions({ keyboard: null }),
      Spellcheck.configure({ speller: use, personal }),
    ],
    enableCoreExtensions: coreExtensionOptions,
    content,
  });
  return personal;
}

const settle = () => new Promise((resolve) => setTimeout(resolve, 20));

async function underlined() {
  editor.storage.spellcheck.refresh();
  await settle();
  const set = spellcheckKey.getState(editor.state);
  return (set?.find() ?? []).map((d) =>
    editor.state.doc.textBetween(d.from, d.to),
  );
}

test("underlines unknown Thaana words only", async () => {
  create("<p>ދިވެހި ބަހް Liyun ލިޔުން</p>");
  editor.commands.setTextSelection(1);
  expect(await underlined()).toEqual(["ބަހް"]);
});

test("does not underline the word being typed", async () => {
  create("<p>ދިވެހި ބަހް</p>");
  editor.commands.setTextSelection(editor.state.doc.content.size - 1);
  expect(await underlined()).toEqual([]);
});

test("a word split by formatting is still one word", async () => {
  create("<p>ދިވެ<strong>ހި</strong> ބަ<em>ހް</em></p>");
  editor.commands.setTextSelection(1);
  expect(await underlined()).toEqual(["ބަހް"]);
});

test("misspellingAt finds the word under a position", async () => {
  create("<p>ދިވެހި ބަހް</p>");
  editor.commands.setTextSelection(1);
  await underlined();
  expect(misspellingAt(editor.state, 10)?.word).toBe("ބަހް");
  expect(misspellingAt(editor.state, 3)).toBeNull();
});

test("ignore and add to dictionary clear the underline", async () => {
  const personal = create("<p>ބަހް ލިޔުނ</p>");
  editor.commands.setTextSelection(1);
  editor.commands.ignoreWord("ބަހް");
  editor.commands.addToDictionary("ލިޔުނ");
  expect(await underlined()).toEqual([]);
  expect(personal.words).toEqual(["ލިޔުނ"]);
});

test("the personal dictionary is loaded on start", async () => {
  create("<p>ދިވެހި ބަހް</p>", ["ބަހް"]);
  editor.commands.setTextSelection(1);
  expect(await underlined()).toEqual([]);
});

test("turning it off removes every underline", async () => {
  create("<p>ދިވެހި ބަހް</p>");
  editor.commands.setTextSelection(1);
  expect(await underlined()).toEqual(["ބަހް"]);
  editor.commands.setSpellcheck(false);
  expect(await underlined()).toEqual([]);
});

test("typing into an underlined word removes its underline at once", async () => {
  create("<p>ދިވެހި ބަހް</p>");
  editor.commands.setTextSelection(1);
  await underlined();
  const end = editor.state.doc.content.size - 1;
  editor.view.dispatch(editor.state.tr.insertText("ް", end));
  expect(spellcheckKey.getState(editor.state)?.find()).toEqual([]);
});

test("available once the word list loads", async () => {
  create("<p>ދިވެހި</p>");
  await settle();
  expect(editor.storage.spellcheck.available).toBe(true);
});

test("without a word list it stays unavailable and underlines nothing", async () => {
  create("<p>ދިވެހި ބަހް</p>", [], {
    check: async () => [],
    suggest: async () => [],
    ready: Promise.resolve(false),
  });
  editor.commands.setTextSelection(1);
  expect(await underlined()).toEqual([]);
  expect(editor.storage.spellcheck.available).toBe(false);
});
