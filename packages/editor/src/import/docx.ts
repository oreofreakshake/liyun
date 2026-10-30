import type { JSONContent } from "@tiptap/core";
import { htmlToContent } from "../extensions";

const directionMarks = /\p{Bidi_Control}/gu;

export async function docxToContent(data: ArrayBuffer): Promise<JSONContent> {
  const { default: mammoth } = await import("mammoth");
  const input = { arrayBuffer: data, buffer: data } as {
    arrayBuffer: ArrayBuffer;
  };
  const { value } = await mammoth.convertToHtml(input, {
    ignoreEmptyParagraphs: false,
  });
  return htmlToContent(value.replace(directionMarks, ""));
}
