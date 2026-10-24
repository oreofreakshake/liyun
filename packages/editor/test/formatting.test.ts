import "./dom";
import { afterEach, expect, test } from "bun:test";
import type { Editor } from "@tiptap/core";
import { Packer } from "docx";
import JSZip from "jszip";
import { toDocx } from "../src/export/docx";
import { fontStack } from "../src/fonts";
import { createEditor, typeText } from "./editor";

let editor: Editor;
afterEach(() => editor?.destroy());

async function documentXml() {
  const buffer = await Packer.toBuffer(toDocx(editor.getJSON()));
  const zip = await JSZip.loadAsync(buffer);
  return (await zip.file("word/document.xml")?.async("string")) ?? "";
}

test("indent and outdent stay between 0 and 8", () => {
  editor = createEditor("<p>ލިޔުން</p>");
  editor.commands.outdent();
  expect(editor.getJSON().content?.[0].attrs?.indent).toBe(0);
  for (let i = 0; i < 10; i++) editor.commands.indent();
  expect(editor.getJSON().content?.[0].attrs?.indent).toBe(8);
  expect(editor.getHTML()).toContain('data-indent="8"');
});

test("indent survives HTML round trip", () => {
  editor = createEditor('<p data-indent="2">ލިޔުން</p>');
  expect(editor.getJSON().content?.[0].attrs?.indent).toBe(2);
});

test("a table takes the direction of its first cell", () => {
  editor = createEditor("");
  editor.commands.insertTable({ rows: 2, cols: 2, withHeaderRow: false });
  typeText(editor, "ނަން");
  expect(editor.getJSON().content?.[0].attrs?.dir).toBe("rtl");
  expect(editor.getHTML()).toMatch(/<table[^>]*dir="rtl"/);
});

test("font, size, underline and indent reach Word", async () => {
  editor = createEditor('<p data-indent="1">ލިޔުން</p>');
  editor
    .chain()
    .selectAll()
    .setFontFamily(fontStack("MV Faseyha"))
    .setFontSize("20px")
    .toggleUnderline()
    .run();
  const xml = await documentXml();
  expect(xml).toContain('w:cs="MV Faseyha"');
  expect(xml).toContain('<w:sz w:val="30"/>');
  expect(xml).toContain('<w:u w:val="single"/>');
  expect(xml).toMatch(/<w:ind w:start="720"/);
});

test("RTL tables export right to left with every cell", async () => {
  editor = createEditor("");
  editor.commands.insertTable({ rows: 2, cols: 3, withHeaderRow: true });
  typeText(editor, "ނަން");
  const xml = await documentXml();
  expect(xml).toContain("<w:bidiVisual/>");
  expect(xml.match(/<w:tc>/g)?.length).toBe(6);
  expect(xml).toContain("<w:tblHeader/>");
});

test("Tab in a table moves to the next cell instead of indenting", () => {
  editor = createEditor("");
  editor.commands.insertTable({ rows: 2, cols: 2, withHeaderRow: false });
  typeText(editor, "ނަން");
  const { view } = editor;
  const event = new KeyboardEvent("keydown", { key: "Tab" });
  view.someProp("handleKeyDown", (f) => f(view, event));
  typeText(editor, "ގ");
  const row = editor.state.doc.firstChild?.child(0);
  expect(row?.child(0).child(0).attrs.indent).toBe(0);
  expect(row?.child(1).textContent).toBe("ގ");
});
