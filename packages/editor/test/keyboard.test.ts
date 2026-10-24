import "./dom";
import { afterEach, expect, test } from "bun:test";
import type { Editor } from "@tiptap/core";
import { visualAtoms } from "../../thaana-bidi/test/visual";
import { translate } from "../src";
import { createEditor, firstParagraph, pressKeys } from "./editor";

let editor: Editor;
afterEach(() => editor?.destroy());

test("phonetic: divehi types ދިވެހި", () => {
  expect(translate("divehi", "phonetic")).toBe("ދިވެހި");
});

test("typewriter: home row", () => {
  expect(translate("asdfghjkl", "typewriter")).toBe("ިުްަެވއނކ");
});

test("keys outside the layout type themselves", () => {
  expect(translate("2026 ", "phonetic")).toBe("2026 ");
});

test("typing goes through the active layout", () => {
  editor = createEditor();
  editor.commands.setKeyboardLayout("phonetic");
  pressKeys(editor, "divehi");
  expect(editor.getText()).toBe("ދިވެހި");
  expect(firstParagraph(editor).dir).toBe("rtl");
});

test("with no layout, typing passes through", () => {
  editor = createEditor();
  pressKeys(editor, "divehi");
  expect(editor.getText()).toBe("divehi");
});

test("toggle switches between the last layout and plain typing", () => {
  editor = createEditor();
  editor.commands.setKeyboardLayout("typewriter");
  editor.commands.toggleThaanaKeyboard();
  expect(editor.storage.thaanaKeyboard.layout).toBeNull();
  editor.commands.toggleThaanaKeyboard();
  expect(editor.storage.thaanaKeyboard.layout).toBe("typewriter");
});

test("switching layouts mid-line produces an isolated Latin run", () => {
  editor = createEditor();
  editor.commands.setKeyboardLayout("phonetic");
  pressKeys(editor, "divehi ");
  editor.commands.setKeyboardLayout(null);
  pressKeys(editor, "C++");
  editor.commands.setKeyboardLayout("phonetic");
  pressKeys(editor, " winq");

  expect(editor.getText()).toBe("ދިވެހި C++ އިން");
  const { text, dir } = firstParagraph(editor);
  expect(dir).toBe("rtl");
  const atoms = visualAtoms(text, dir).atoms;
  expect(atoms.slice(1, 6)).toEqual([" ", "C", "+", "+", " "]);
});
