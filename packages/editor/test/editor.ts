import { Editor, type JSONContent } from "@tiptap/core";
import { coreExtensionOptions, editorExtensions } from "../src/extensions";

const LRI = String.fromCodePoint(0x2066);
const PDI = String.fromCodePoint(0x2069);

export function createEditor(content: JSONContent | string = "") {
  return new Editor({
    element: document.createElement("div"),
    extensions: editorExtensions({ keyboard: null }),
    enableCoreExtensions: coreExtensionOptions,
    content,
  });
}

export function typeText(editor: Editor, text: string) {
  for (const char of text) {
    editor.commands.insertContent({ type: "text", text: char });
  }
}

export function pressKeys(editor: Editor, keys: string) {
  const { view } = editor;
  for (const key of keys) {
    const event = new KeyboardEvent("keydown", { key });
    const handled = view.someProp("handleKeyDown", (f) => f(view, event));
    if (!handled) {
      const { from, to } = view.state.selection;
      view.dispatch(view.state.tr.insertText(key, from, to));
    }
  }
}

export function firstParagraph(editor: Editor) {
  const paragraph = editor.getJSON().content?.[0];
  let text = "";
  let open = false;
  for (const node of paragraph?.content ?? []) {
    const isolated = node.marks?.some((m) => m.type === "ltrIsolate") ?? false;
    if (isolated && !open) text += LRI;
    if (!isolated && open) text += PDI;
    open = isolated;
    text += (node as { text?: string }).text ?? "";
  }
  if (open) text += PDI;
  return { text, dir: paragraph?.attrs?.dir as "ltr" | "rtl" };
}
