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
