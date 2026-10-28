import type { JSONContent } from "@tiptap/core";
import { htmlToContent } from "../extensions";

// Direction marks Word files carry (ours add LRM around Latin runs). The
// editor works out direction itself, so they would only be stray characters.
const directionMarks = /\p{Bidi_Control}/gu;

export async function docxToContent(data: ArrayBuffer): Promise<JSONContent> {
  const { default: mammoth } = await import("mammoth");
  // The browser build reads arrayBuffer, the Node build (tests) reads buffer.
  const input = { arrayBuffer: data, buffer: data } as {
    arrayBuffer: ArrayBuffer;
  };
  const { value } = await mammoth.convertToHtml(input, {
    ignoreEmptyParagraphs: false,
  });
  return htmlToContent(value.replace(directionMarks, ""));
}
