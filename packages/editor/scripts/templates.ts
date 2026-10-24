
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { GlobalRegistrator } from "@happy-dom/global-registrator";
import { Editor } from "@tiptap/core";
import { DOCUMENT_VERSION, type Template } from "../src/document";
import { coreExtensionOptions, editorExtensions } from "../src/extensions";

if (!GlobalRegistrator.isRegistered) GlobalRegistrator.register();

export const templatesDir = join(import.meta.dir, "../../../templates");

type Entry = Pick<Template, "id" | "title">;

export function templateEntries(): Entry[] {
  return JSON.parse(
    readFileSync(join(templatesDir, "source/templates.json"), "utf8"),
  );
}

export function buildTemplate({ id, title }: Entry): Template {
  const html = readFileSync(join(templatesDir, `source/${id}.html`), "utf8");
  const editor = new Editor({
    element: document.createElement("div"),
    extensions: editorExtensions({ keyboard: null }),
    enableCoreExtensions: coreExtensionOptions,
    content: html,
  });
  const content = editor.getJSON();
  editor.destroy();
  return {
    version: DOCUMENT_VERSION,
    id,
    title,
    license: "Apache-2.0",
    content,
  };
}

export function serialize(template: Template) {
  return `${JSON.stringify(template, null, 2)}\n`;
}

if (import.meta.main) {
  for (const entry of templateEntries()) {
    writeFileSync(
      join(templatesDir, `${entry.id}.json`),
      serialize(buildTemplate(entry)),
    );
    console.log(`templates/${entry.id}.json`);
  }
}
