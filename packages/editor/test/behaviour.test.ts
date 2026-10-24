import "./dom";
import { afterEach, expect, test } from "bun:test";
import type { Editor } from "@tiptap/core";
import { createEditor, firstParagraph, typeText } from "./editor";

let editor: Editor;
afterEach(() => editor?.destroy());

test("bold inside a Latin run still renders as one <bdi>", () => {
  editor = createEditor("<p>ބައްދަލުވުން (Meeting <strong>2026</strong>) ހުޅުވާލި</p>");
  expect(editor.getHTML()).toBe(
    '<p dir="rtl">ބައްދަލުވުން <bdi dir="ltr">(Meeting <strong>2026</strong>)</bdi> ހުޅުވާލި</p>',
  );
});

test("loaded content is normalized without adding an undo step", () => {
  editor = createEditor("<p>ބޮޑުވީ 50% އިން</p>");
  expect(editor.getHTML()).toBe(
    '<p dir="rtl">ބޮޑުވީ <bdi dir="ltr">50%</bdi> އިން</p>',
  );
  expect(editor.can().undo()).toBe(false);
});

test("a locked direction survives typing, and auto unlocks it", () => {
  editor = createEditor();
  editor.commands.setParagraphDirection("ltr");
  typeText(editor, "ބޮޑުވީ 50% އިން");
  expect(firstParagraph(editor).dir).toBe("ltr");
  expect(editor.getHTML()).not.toContain("<bdi");

  editor.commands.setParagraphDirection("auto");
  expect(firstParagraph(editor).dir).toBe("rtl");
  expect(editor.getHTML()).toContain('<bdi dir="ltr">50%</bdi>');
});

test("undo removes typed text and its isolation together", () => {
  editor = createEditor();
  editor.commands.insertContent({ type: "text", text: "ބޮޑުވީ 50% އިން" });
  editor.commands.undo();
  expect(editor.getText()).toBe("");
  expect(editor.getHTML()).not.toContain("<bdi");
});

test("an empty paragraph defaults to RTL", () => {
  editor = createEditor();
  expect(firstParagraph(editor).dir).toBe("rtl");
});

test("lists take the direction of their first item", () => {
  editor = createEditor(
    "<ol><li><p>ކުރީ ޖަލްސާގެ ޔައުމިއްޔާ</p></li></ol><ul><li><p>First item</p></li></ul>",
  );
  const html = editor.getHTML();
  expect(html).toContain('<ol dir="rtl">');
  expect(html).toContain('<ul dir="ltr">');
});

test("a list follows its first item when that item is locked", () => {
  editor = createEditor("<ol><li><p>ކުރީ ޖަލްސާ</p></li></ol>");
  editor.commands.setTextSelection(3);
  editor.commands.setParagraphDirection("ltr");
  expect(editor.getHTML()).toContain('<ol dir="ltr">');
});
