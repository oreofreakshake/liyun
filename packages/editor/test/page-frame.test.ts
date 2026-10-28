import "./dom";
import { afterEach, expect, test } from "bun:test";
import type { Editor } from "@tiptap/core";
import { Packer } from "docx";
import JSZip from "jszip";
import { titleOf } from "../src/document";
import { toDocx } from "../src/export/docx";
import { createEditor, typeText } from "./editor";

let editor: Editor;
afterEach(() => editor?.destroy());

const types = () => editor.getJSON().content?.map((n) => n.type);

test("header goes first and footer last, and both toggle off", () => {
  editor = createEditor("<p>ލިޔުން</p>");
  editor.commands.togglePageFrame("pageFooter");
  editor.commands.togglePageFrame("pageHeader");
  expect(types()).toEqual(["pageHeader", "paragraph", "pageFooter"]);
  editor.commands.togglePageFrame("pageHeader");
  editor.commands.togglePageFrame("pageFooter");
  expect(types()).toEqual(["paragraph"]);
});

test("typing goes into the new header with its own direction", () => {
  editor = createEditor("<p>ލިޔުން</p>");
  editor.commands.togglePageFrame("pageHeader");
  typeText(editor, "ހަދު");
  const line = editor.state.doc.firstChild?.firstChild;
  expect(line?.textContent).toBe("ހަދު");
  expect(line?.attrs.dir).toBe("rtl");
});

test("header and footer survive HTML round trip", () => {
  editor = createEditor(
    "<div data-page-header><p>a</p></div><p>b</p><div data-page-footer><p>c</p></div>",
  );
  expect(types()).toEqual(["pageHeader", "paragraph", "pageFooter"]);
});

test("the title skips the header", () => {
  editor = createEditor("<div data-page-header><p>ހަދު</p></div><p>ސިޓީ</p>");
  expect(titleOf(editor.getJSON())).toBe("ސިޓީ");
});

test("header and footer become Word headers and footers", async () => {
  editor = createEditor(
    "<div data-page-header><p>ހަދު</p></div><p>ސިޓީ</p><div data-page-footer><p>ސަފުހާ</p></div>",
  );
  const zip = await JSZip.loadAsync(
    await Packer.toBuffer(toDocx(editor.getJSON())),
  );
  const files = Object.keys(zip.files);
  const header = files.find((f) => /^word\/header\d*\.xml$/.test(f));
  const footer = files.find((f) => /^word\/footer\d*\.xml$/.test(f));
  expect(await zip.file(header ?? "")?.async("string")).toContain("ހަދު");
  expect(await zip.file(footer ?? "")?.async("string")).toContain("ސަފުހާ");
  const body = await zip.file("word/document.xml")?.async("string");
  expect(body).toContain("ސިޓީ");
  expect(body).not.toContain("ހަދު");
});

const pageBreakCases = [
  {
    name: "at the end",
    at: (len: number) => len,
    want: ["paragraph", "pageBreak", "paragraph"],
  },
  { name: "at the start", at: () => 0, want: ["pageBreak", "paragraph"] },
  {
    name: "in the middle",
    at: () => 2,
    want: ["paragraph", "pageBreak", "paragraph"],
  },
];

test.each(pageBreakCases)("a page break $name of a paragraph", ({
  at,
  want,
}) => {
  editor = createEditor("<p>ލިޔުން</p>");
  const len = editor.state.doc.firstChild?.content.size ?? 0;
  editor.commands.setTextSelection(1 + at(len));
  expect(editor.commands.setPageBreak()).toBe(true);
  expect(types()).toEqual(want);
  expect(editor.state.doc.textContent).toBe("ލިޔުން");
  expect(editor.state.selection.$from.parent.type.name).toBe("paragraph");
});

test("no page breaks inside tables or the header", () => {
  editor = createEditor("<p>ލިޔުން</p>");
  editor.commands.togglePageFrame("pageHeader");
  expect(editor.commands.setPageBreak()).toBe(false);
  editor.commands.togglePageFrame("pageHeader");
  editor.commands.insertTable({ rows: 2, cols: 2 });
  expect(editor.commands.setPageBreak()).toBe(false);
});

test("page breaks reach Word", async () => {
  editor = createEditor("<p>a</p><div data-page-break></div><p>b</p>");
  const zip = await JSZip.loadAsync(
    await Packer.toBuffer(toDocx(editor.getJSON())),
  );
  const body = await zip.file("word/document.xml")?.async("string");
  expect(body).toContain('<w:br w:type="page"/>');
});

const press = (key: string) => {
  const { view } = editor;
  const event = new KeyboardEvent("keydown", { key });
  return view.someProp("handleKeyDown", (f) => f(view, event)) ?? false;
};

test("Backspace on an empty new page removes it in one press", () => {
  editor = createEditor("<p>one</p>");
  editor.commands.setTextSelection(4);
  editor.commands.setPageBreak();
  expect(types()).toEqual(["paragraph", "pageBreak", "paragraph"]);
  expect(press("Backspace")).toBe(true);
  expect(types()).toEqual(["paragraph", "paragraph"]);
  expect(editor.state.selection.$from.parent.textContent).toBe("");
});

test("Backspace at the start of a page pulls its text back", () => {
  editor = createEditor("<p>one</p><div data-page-break></div><p>two</p>");
  editor.commands.setTextSelection(7);
  expect(editor.state.selection.$from.parent.textContent).toBe("two");
  expect(press("Backspace")).toBe(true);
  expect(types()).toEqual(["paragraph", "paragraph"]);
});

test("Delete at the end of the page before removes the break", () => {
  editor = createEditor("<p>one</p><div data-page-break></div><p>two</p>");
  editor.commands.setTextSelection(4);
  expect(press("Delete")).toBe(true);
  expect(types()).toEqual(["paragraph", "paragraph"]);
});

test("Backspace inside text is left alone", () => {
  editor = createEditor("<p>one</p><div data-page-break></div><p>two</p>");
  editor.commands.setTextSelection(8);
  expect(press("Backspace")).toBe(false);
  expect(types()).toEqual(["paragraph", "pageBreak", "paragraph"]);
});
