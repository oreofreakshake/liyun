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
  editor.commands.setKeyboardLayout("phonetic");
  editor.commands.toggleThaanaKeyboard();
  expect(editor.storage.thaanaKeyboard.layout).toBeNull();
  editor.commands.toggleThaanaKeyboard();
  expect(editor.storage.thaanaKeyboard.layout).toBe("phonetic");
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

function press(
  editor: Editor,
  type: "keydown" | "keyup",
  key: string,
  mods = {},
) {
  const event = new KeyboardEvent(type, { key, ...mods });
  if (type === "keydown") {
    editor.view.someProp("handleKeyDown", (f) => f(editor.view, event));
  } else {
    editor.view.dom.dispatchEvent(event);
  }
}

test("Alt + Shift, pressed and released alone, switches Thaana and English", () => {
  editor = createEditor();
  editor.commands.setKeyboardLayout("phonetic");
  press(editor, "keydown", "Alt", { altKey: true });
  press(editor, "keydown", "Shift", { altKey: true, shiftKey: true });
  press(editor, "keyup", "Shift", { altKey: true });
  expect(editor.storage.thaanaKeyboard.layout).toBeNull();
  press(editor, "keydown", "Shift", { shiftKey: true });
  press(editor, "keydown", "Alt", { altKey: true, shiftKey: true });
  press(editor, "keyup", "Alt", { shiftKey: true });
  expect(editor.storage.thaanaKeyboard.layout).toBe("phonetic");
});

test("Alt + Shift with another key in between does not switch", () => {
  editor = createEditor();
  editor.commands.setKeyboardLayout("phonetic");
  press(editor, "keydown", "Alt", { altKey: true });
  press(editor, "keydown", "Shift", { altKey: true, shiftKey: true });
  press(editor, "keydown", "ArrowLeft", { altKey: true, shiftKey: true });
  press(editor, "keyup", "Shift", { altKey: true });
  expect(editor.storage.thaanaKeyboard.layout).toBe("phonetic");
});
