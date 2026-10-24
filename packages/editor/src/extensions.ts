import { type Extensions, generateJSON, type JSONContent } from "@tiptap/core";
import { TableKit } from "@tiptap/extension-table";
import TextAlign from "@tiptap/extension-text-align";
import { FontFamily, FontSize, TextStyle } from "@tiptap/extension-text-style";
import StarterKit from "@tiptap/starter-kit";
import { BidiParagraphs, LtrIsolate } from "./bidi";
import { Indent } from "./indent";
import type { LayoutId } from "./layouts";
import { FramedDocument, PageFooter, PageHeader } from "./page-frame";
import { ThaanaKeyboard } from "./thaana-keyboard";

export function editorExtensions({
  keyboard = "phonetic",
}: {
  keyboard?: LayoutId | null;
} = {}): Extensions {
  return [
    StarterKit.configure({
      document: false,
      trailingNode: { notAfter: ["pageFooter"] },
    }),
    FramedDocument,
    PageHeader,
    PageFooter,
    TextAlign.configure({
      types: ["heading", "paragraph"],
      alignments: ["start", "center", "end", "justify"],
      defaultAlignment: null,
    }),
    TableKit.configure({ table: { resizable: false } }),
    TextStyle,
    FontFamily,
    FontSize,
    Indent,
    LtrIsolate,
    BidiParagraphs,
    ThaanaKeyboard.configure({ defaultLayout: keyboard }),
  ];
}

export const coreExtensionOptions = { textDirection: false } as const;

export function htmlToContent(html: string): JSONContent {
  return generateJSON(html, editorExtensions({ keyboard: null }));
}
