import { Node } from "@tiptap/core";
import Document from "@tiptap/extension-document";
import { TextSelection } from "@tiptap/pm/state";

export type FramePart = "pageHeader" | "pageFooter";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    pageFrame: {
      togglePageFrame: (part: FramePart) => ReturnType;
    };
    pageBreak: {
      setPageBreak: () => ReturnType;
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

export const PageBreak = Node.create({
  name: "pageBreak",
  group: "block",
  atom: true,
  selectable: true,
  parseHTML: () => [{ tag: "div[data-page-break]" }],
  renderHTML: () => ["div", { "data-page-break": "" }],

  addCommands() {
    return {
      setPageBreak:
        () =>
        ({ state, tr, dispatch }) => {
          const { $from } = state.selection;
          if ($from.depth !== 1 || !$from.parent.isTextblock) return false;
          if (!dispatch) return true;
          const { schema } = state;
          const at = $from.parentOffset;
          const end = $from.parent.content.size;
          let pos: number;
          if (at === 0 && end > 0) pos = $from.before();
          else if (at === end) pos = $from.after();
          else {
            tr.split($from.pos);
            pos = $from.pos + 1;
          }
          tr.insert(pos, schema.nodes.pageBreak.create());
          const after = pos + 1;
          if (!tr.doc.nodeAt(after)?.isTextblock) {
            tr.insert(after, schema.nodes.paragraph.create());
          }
          tr.setSelection(TextSelection.create(tr.doc, after + 1));
          dispatch(tr.scrollIntoView());
          return true;
        },
    };
  },

  addKeyboardShortcuts() {
    // Backspace at the start of a page, or Delete at the end of the one
    // before, removes the break in one key press, as in a word processor.
    const removeBreak = (backward: boolean) => () => {
      const { state, view } = this.editor;
      const { selection } = state;
      const { $from } = selection;
      if (!selection.empty || $from.depth !== 1) return false;
      const atEdge = backward
        ? $from.parentOffset === 0
        : $from.parentOffset === $from.parent.content.size;
      if (!atEdge) return false;
      const pos = backward ? $from.before() : $from.after();
      const node = backward
        ? state.doc.resolve(pos).nodeBefore
        : state.doc.resolve(pos).nodeAfter;
      if (node?.type !== this.type) return false;
      const from = backward ? pos - node.nodeSize : pos;
      view.dispatch(
        state.tr.delete(from, from + node.nodeSize).scrollIntoView(),
      );
      return true;
    };
    return {
      "Mod-Enter": () => this.editor.commands.setPageBreak(),
      Backspace: removeBreak(true),
      Delete: removeBreak(false),
    };
  },
});
