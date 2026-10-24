import { Extension } from "@tiptap/core";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    indent: {
      indent: () => ReturnType;
      outdent: () => ReturnType;
    };
  }
}

const types = ["paragraph", "heading"];
const max = 8;

export const Indent = Extension.create({
  name: "indent",

  addGlobalAttributes() {
    return [
      {
        types,
        attributes: {
          indent: {
            default: 0,
            parseHTML: (el) => Number(el.getAttribute("data-indent")) || 0,
            renderHTML: (attrs) =>
              attrs.indent
                ? {
                    "data-indent": attrs.indent,
                    style: `margin-inline-start: ${attrs.indent * 2}em`,
                  }
                : {},
          },
        },
      },
    ];
  },

  addCommands() {
    const shift =
      (by: number) =>
      () =>
      ({ tr, state, dispatch }: import("@tiptap/core").CommandProps) => {
        let changed = false;
        state.doc.nodesBetween(
          state.selection.from,
          state.selection.to,
          (node, pos) => {
            if (!types.includes(node.type.name)) return;
            const indent = Math.min(
              max,
              Math.max(0, (node.attrs.indent ?? 0) + by),
            );
            if (indent === node.attrs.indent) return;
            tr.setNodeAttribute(pos, "indent", indent);
            changed = true;
          },
        );
        if (changed && dispatch) dispatch(tr);
        return changed;
      };
    return { indent: shift(1), outdent: shift(-1) };
  },

  addKeyboardShortcuts() {
    return {
      Tab: () =>
        !this.editor.isActive("table") &&
        (this.editor.isActive("listItem")
          ? this.editor.commands.sinkListItem("listItem")
          : this.editor.commands.indent()),
      "Shift-Tab": () =>
        !this.editor.isActive("table") &&
        (this.editor.isActive("listItem")
          ? this.editor.commands.liftListItem("listItem")
          : this.editor.commands.outdent()),
    };
  },
});
