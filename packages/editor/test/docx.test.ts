import "./dom";
import { afterEach, describe, expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { Editor } from "@tiptap/core";
import { Packer } from "docx";
import JSZip from "jszip";
import { visualAtoms } from "../../thaana-bidi/test/visual";
import { buildTemplate, templateEntries } from "../scripts/templates";
import { toDocx } from "../src/export/docx";
import { createEditor } from "./editor";

const LRM = String.fromCodePoint(0x200e);

async function documentXml(editor: Editor) {
  const buffer = await Packer.toBuffer(toDocx(editor.getJSON()));
  const zip = await JSZip.loadAsync(buffer);
  return (await zip.file("word/document.xml")?.async("string")) ?? "";
}

function decode(s: string) {
  return s
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&apos;", "'")
    .replaceAll("&amp;", "&");
}

function paragraphs(xml: string) {
  return [...xml.matchAll(/<w:p>([\s\S]*?)<\/w:p>/g)].map(([, p]) => ({
    rtl: p.includes("<w:bidi/>"),
    text: [...p.matchAll(/<w:t(?: [^>]*)?>([^<]*)<\/w:t>/g)]
      .map(([, t]) => decode(t))
      .join(""),
    xml: p,
  }));
}

type Fixture = {
  id: string;
  text: string;
  direction: "ltr" | "rtl";
  expected: string[];
};
const dir = join(import.meta.dir, "../../thaana-bidi/fixtures");
const fixtures = readdirSync(dir)
  .filter((name) => name.endsWith(".json"))
  .flatMap((name) =>
    (JSON.parse(readFileSync(join(dir, name), "utf8")) as Fixture[]).map(
      (f) => ({ ...f, file: name }),
    ),
  );

let editor: Editor;
afterEach(() => editor?.destroy());

describe("fixtures survive DOCX export", () => {
  test.each(fixtures)("$file: $id", async (f) => {
    editor = createEditor();
    editor.commands.insertContent({ type: "text", text: f.text });
    const [p] = paragraphs(await documentXml(editor));
    expect(p.rtl).toBe(f.direction === "rtl");
    const atoms = visualAtoms(p.text, f.direction).atoms.filter(
      (a) => a !== LRM,
    );
    expect({ screen: atoms.join(""), atoms }).toEqual({
      screen: f.expected.join(""),
      atoms: f.expected,
    });
  });
});

test("Thaana runs are RTL in the Thaana font; isolated runs are not RTL", async () => {
  editor = createEditor("<p>ބޮޑުވީ 50% އިން</p>");
  const [p] = paragraphs(await documentXml(editor));
  const runs = [...p.xml.matchAll(/<w:r>([\s\S]*?)<\/w:r>/g)].map(([, r]) => r);
  expect(runs).toHaveLength(3);
  expect(runs[0]).toContain("<w:rtl/>");
  expect(runs[0]).toContain('w:cs="Faruma"');
  expect(runs[0]).toContain('w:bidi="dv-MV"');
  expect(runs[1]).not.toContain("<w:rtl/>");
  expect(runs[1]).toContain(`>${LRM}50%${LRM}<`);
});

test("bold Thaana is bold in Word's complex-script properties too", async () => {
  editor = createEditor("<p><strong>ދިވެހި</strong></p>");
  const [p] = paragraphs(await documentXml(editor));
  expect(p.xml).toContain("<w:bCs/>");
});

test.each(
  templateEntries(),
)("template $id exports with every paragraph RTL", async (entry) => {
  editor = createEditor(buildTemplate(entry).content);
  const ps = paragraphs(await documentXml(editor)).filter((p) => p.text);
  expect(ps.length).toBeGreaterThan(3);
  expect(ps.every((p) => p.rtl)).toBe(true);
});
