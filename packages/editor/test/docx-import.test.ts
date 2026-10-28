import "./dom";
import { expect, test } from "bun:test";
import { Packer } from "docx";
import { toDocx } from "../src/export/docx";
import { htmlToContent } from "../src/extensions";
import { docxToContent } from "../src/import/docx";

const text = (node: { text?: string; content?: unknown[] }): string =>
  node.text ?? (node.content ?? []).map((n) => text(n as typeof node)).join("");

test("a Word file round-trips headings, text, lists and tables", async () => {
  const source = htmlToContent(
    [
      "<h1>ބައްދަލުވުން (Meeting 2026)</h1>",
      "<p>ތަރައްގީ 50% <strong>bold</strong></p>",
      "<ul><li><p>one</p></li><li><p>two</p></li></ul>",
      "<table><tr><td><p>a</p></td><td><p>b</p></td></tr></table>",
    ].join(""),
  );
  const buffer = await Packer.toBuffer(toDocx(source));
  const data = buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength,
  ) as ArrayBuffer;
  const content = await docxToContent(data);
  const types = content.content?.map((n) => n.type);
  expect(types).toEqual(["heading", "paragraph", "bulletList", "table"]);
  expect(text(content.content?.[0] ?? {})).toBe("ބައްދަލުވުން (Meeting 2026)");
  expect(text(content.content?.[1] ?? {})).toBe("ތަރައްގީ 50% bold");
  expect(JSON.stringify(content)).toContain('"type":"bold"');
});
