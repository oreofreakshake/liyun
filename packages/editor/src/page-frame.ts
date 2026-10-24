import { Node } from "@tiptap/core";
import Document from "@tiptap/extension-document";
import { TextSelection } from "@tiptap/pm/state";

export type FramePart = "pageHeader" | "pageFooter";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    pageFrame: {
      togglePageFrame: (part: FramePart) => ReturnType;
    };
  }
}

export const FramedDocument = Document.extend({
  content: "pageHeader? block+ pageFooter?",
});

const frame = (name: FramePart, attr: string) =>
  Node.create({
    name,
    content: "paragraph+",
    isolating: true,
    defining: true,
    parseHTML: () => [{ tag: `div[${attr}]` }],
    renderHTML: () => ["div", { [attr]: "" }, 0],
  });

export const PageHeader = frame("pageHeader", "data-page-header");
export const PageFooter = frame("pageFooter", "data-page-footer").extend({
  addCommands() {
    return {
      togglePageFrame:
        (part) =>
        ({ state, tr, dispatch }) => {
          const { doc, schema } = state;
          const header = part === "pageHeader";
          const existing = header ? doc.firstChild : doc.lastChild;
          if (!dispatch) return true;
          if (existing?.type.name === part) {
            const from = header ? 0 : doc.content.size - existing.nodeSize;
            tr.delete(from, from + existing.nodeSize);
          } else {
            const node = schema.nodes[part].create(
              null,
              schema.nodes.paragraph.create(),
            );
            const pos = header ? 0 : doc.content.size;
            tr.insert(pos, node);
            tr.setSelection(TextSelection.create(tr.doc, pos + 2));
          }
          dispatch(tr.scrollIntoView());
          return true;
        },
    };
  },
});
