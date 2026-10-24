import { type Extensions, generateJSON, type JSONContent } from "@tiptap/core";
import TextAlign from "@tiptap/extension-text-align";
import StarterKit from "@tiptap/starter-kit";
import { BidiParagraphs, LtrIsolate } from "./bidi";
import type { LayoutId } from "./layouts";
import { ThaanaKeyboard } from "./thaana-keyboard";

export function editorExtensions({
  keyboard = "phonetic",
}: {
  keyboard?: LayoutId | null;
} = {}): Extensions {
  return [
    StarterKit,
    TextAlign.configure({
      types: ["heading", "paragraph"],
      alignments: ["start", "center", "end", "justify"],
      defaultAlignment: null,
    }),
    LtrIsolate,
    BidiParagraphs,
    ThaanaKeyboard.configure({ defaultLayout: keyboard }),
  ];
}

export const coreExtensionOptions = { textDirection: false } as const;

export function htmlToContent(html: string): JSONContent {
  return generateJSON(html, editorExtensions({ keyboard: null }));
}
