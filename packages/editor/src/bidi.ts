import {
  combineTransactionSteps,
  Extension,
  getChangedRanges,
  Mark,
} from "@tiptap/core";
import type { Node as PMNode } from "@tiptap/pm/model";
import { Plugin, PluginKey, type Transaction } from "@tiptap/pm/state";
import { type Direction, ltrRuns, paragraphDirection } from "thaana-bidi";

const directedBlocks = ["paragraph", "heading"];
const directedContainers = ["orderedList", "bulletList", "blockquote"];

export const LtrIsolate = Mark.create({
  name: "ltrIsolate",
  priority: 1000,
  inclusive: false,
  parseHTML: () => [{ tag: 'bdi[dir="ltr"]' }],
  renderHTML: () => ["bdi", { dir: "ltr" }, 0],
});

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    bidiParagraphs: {
      setParagraphDirection: (direction: Direction | "auto") => ReturnType;
    };
  }
}

export type BidiParagraphsOptions = {
  defaultDirection: Direction;
};

export const BidiParagraphs = Extension.create<BidiParagraphsOptions>({
  name: "bidiParagraphs",

  addOptions: () => ({ defaultDirection: "rtl" }),

  addGlobalAttributes() {
    return [
      {
        types: directedContainers,
        attributes: {
          dir: {
            default: null,
            parseHTML: (el) => el.getAttribute("dir"),
            renderHTML: (attrs) => (attrs.dir ? { dir: attrs.dir } : {}),
          },
        },
      },
      {
        types: directedBlocks,
        attributes: {
          dir: {
            default: null,
            parseHTML: (el) => el.getAttribute("dir"),
            renderHTML: (attrs) => (attrs.dir ? { dir: attrs.dir } : {}),
          },
          dirLocked: {
            default: false,
            parseHTML: (el) => el.hasAttribute("data-dir-locked"),
            renderHTML: (attrs) =>
              attrs.dirLocked ? { "data-dir-locked": "" } : {},
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setParagraphDirection:
        (direction) =>
        ({ tr, state, dispatch }) => {
          const { from, to } = state.selection;
          state.doc.nodesBetween(from, to, (node, pos) => {
            if (!directedBlocks.includes(node.type.name)) return;
            tr.setNodeMarkup(pos, undefined, {
              ...node.attrs,
              dir: direction === "auto" ? null : direction,
              dirLocked: direction !== "auto",
            });
          });
          if (dispatch) normalize(tr, this.options.defaultDirection);
          return true;
        },
    };
  },

  addProseMirrorPlugins() {
    const { defaultDirection } = this.options;
    return [
      new Plugin({
        key: new PluginKey("bidiParagraphs"),
        appendTransaction(transactions, oldState, newState) {
          if (!transactions.some((t) => t.docChanged)) return null;
          const tr = newState.tr;
          const changes = combineTransactionSteps(oldState.doc, [
            ...transactions,
          ]);
          for (const { newRange } of getChangedRanges(changes)) {
            normalize(tr, defaultDirection, newRange.from, newRange.to);
          }
          return tr.docChanged ? tr : null;
        },
        view(view) {
          const tr = view.state.tr;
          normalize(tr, defaultDirection);
          if (tr.docChanged) view.dispatch(tr.setMeta("addToHistory", false));
          return {};
        },
      }),
    ];
  },
});

function normalize(
  tr: Transaction,
  defaultDirection: Direction,
  from = 0,
  to = tr.doc.content.size,
) {
  tr.doc.nodesBetween(from, to, (node, pos) => {
    if (directedContainers.includes(node.type.name)) {
      let first: PMNode | undefined;
      node.descendants((child) => {
        if (first) return false;
        if (directedBlocks.includes(child.type.name)) first = child;
        return !first;
      });
      const dir = first ? blockDirection(first, defaultDirection) : null;
      if (node.attrs.dir !== dir) tr.setNodeAttribute(pos, "dir", dir);
      return true;
    }
    if (!directedBlocks.includes(node.type.name)) return true;
    normalizeBlock(tr, node, pos, defaultDirection);
    return false;
  });
}

function blockText(node: PMNode) {
  return node.textBetween(0, node.content.size, undefined, " ");
}

function blockDirection(node: PMNode, defaultDirection: Direction): Direction {
  return node.attrs.dirLocked
    ? node.attrs.dir
    : paragraphDirection(blockText(node), defaultDirection);
}

function normalizeBlock(
  tr: Transaction,
  node: PMNode,
  pos: number,
  defaultDirection: Direction,
) {
  const isolate = tr.doc.type.schema.marks.ltrIsolate;
  const text = blockText(node);
  const dir = blockDirection(node, defaultDirection);

  if (node.attrs.dir !== dir) {
    tr.setNodeAttribute(pos, "dir", dir);
  }

  const wanted = dir === "rtl" ? ltrRuns(text) : [];
  const current: { start: number; end: number }[] = [];
  node.forEach((child, offset) => {
    if (!isolate.isInSet(child.marks)) return;
    const last = current.at(-1);
    if (last && last.end === offset) last.end = offset + child.nodeSize;
    else current.push({ start: offset, end: offset + child.nodeSize });
  });

  if (JSON.stringify(current) === JSON.stringify(wanted)) return;
  const start = pos + 1;
  tr.removeMark(start, start + node.content.size, isolate);
  for (const run of wanted) {
    tr.addMark(start + run.start, start + run.end, isolate.create());
  }
}
