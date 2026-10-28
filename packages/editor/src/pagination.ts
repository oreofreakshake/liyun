import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet, type EditorView } from "@tiptap/pm/view";

// Lays the document out on A4 sheets like a word processor: where a page
// fills up, a spacer pushes the next block onto the next sheet and repeats the
// header and footer around the gap. Only on screens wide enough for a full
// page; narrower screens show one continuous page.

const mm = 96 / 25.4;
export const PAGE_HEIGHT = 297 * mm;
export const PAGE_GAP = 24;
const WIDE = "(min-width: 768px)";
// Matches `.ProseMirror > :has(+ [data-page-footer])` in the stylesheet.
const FOOTER_GAP = 32;

type Break = {
  /** Document position the spacer sits at. */
  pos: number;
  /** Empty space left at the bottom of the page. */
  fill: number;
  /** Ends the document (before the footer) rather than separating pages. */
  last?: boolean;
};

type Layout = {
  breaks: Break[];
  pages: number;
  padY: number;
  headerSpace: number;
  footerSpace: number;
  frames: string;
};

export type PaginationState = {
  active: boolean;
  pages: number;
  decorations: DecorationSet;
};

export const paginationKey = new PluginKey<PaginationState>("pagination");

const isFrame = (el: Element) =>
  el.hasAttribute("data-page-header") || el.hasAttribute("data-page-footer");
const isGap = (el: Element) => el.hasAttribute("data-page-gap");

function frameClone(view: EditorView, attr: string) {
  const el = view.dom.querySelector(`:scope > [${attr}]`);
  const clone = el?.cloneNode(true) as HTMLElement | undefined;
  clone?.setAttribute("data-page-repeat", "");
  return clone;
}

function spacer(view: EditorView, b: Break, layout: Layout) {
  const el = document.createElement("div");
  el.setAttribute("data-page-gap", "");
  el.contentEditable = "false";
  el.setAttribute("aria-hidden", "true");
  if (b.last) {
    el.style.height = `${b.fill + (layout.footerSpace ? FOOTER_GAP : 0)}px`;
    return el;
  }
  const area = (height: number, align?: "end") => {
    const part = document.createElement("div");
    part.style.height = `${height}px`;
    if (align) part.setAttribute("data-align", align);
    el.append(part);
    return part;
  };
  area(b.fill);
  const footer = frameClone(view, "data-page-footer");
  if (footer) area(layout.footerSpace, "end").append(footer);
  area(layout.padY * 2 + PAGE_GAP);
  const header = frameClone(view, "data-page-header");
  if (header) area(layout.headerSpace).append(header);
  return el;
}

function measure(view: EditorView): Layout | null {
  const article = view.dom.closest("article");
  if (!article || !window.matchMedia(WIDE).matches) return null;

  const padY = Number.parseFloat(getComputedStyle(article).paddingTop);
  const origin = view.dom.getBoundingClientRect().top;
  const children = [...view.dom.children] as HTMLElement[];
  const header = children.find((el) => el.hasAttribute("data-page-header"));
  const footer = children.find((el) => el.hasAttribute("data-page-footer"));
  const gaps = children.filter(isGap).map((el) => ({
    top: el.getBoundingClientRect().top,
    height: el.offsetHeight,
  }));

  // Positions as if no spacers were there, so they do not feed back.
  const blocks: {
    el: HTMLElement;
    pos: number;
    end: number;
    bottom: number;
    marginBottom: number;
  }[] = [];
  view.state.doc.forEach((node, pos) => {
    const el = view.nodeDOM(pos);
    if (!(el instanceof HTMLElement) || isFrame(el)) return;
    const rect = el.getBoundingClientRect();
    const shift = gaps
      .filter((g) => g.top < rect.top)
      .reduce((sum, g) => sum + g.height, 0);
    blocks.push({
      el,
      pos,
      end: pos + node.nodeSize,
      bottom: rect.bottom - origin - shift,
      marginBottom: Number.parseFloat(getComputedStyle(el).marginBottom),
    });
  });

  const headerSpace = header
    ? header.offsetHeight +
      Number.parseFloat(getComputedStyle(header).marginBottom)
    : 0;
  const footerSpace = footer ? footer.offsetHeight + FOOTER_GAP : 0;
  const body = PAGE_HEIGHT - padY * 2 - headerSpace - footerSpace;
  if (body < 100) return null;

  const breaks: Break[] = [];
  let pages = 1;
  let pageStart = headerSpace;
  let first = true;
  blocks.forEach((block, i) => {
    const prev = blocks[i - 1];
    if (!first && block.bottom - pageStart > body && prev) {
      const top = prev.bottom + prev.marginBottom;
      breaks.push({ pos: block.pos, fill: pageStart + body - top });
      pages++;
      pageStart = top;
    }
    first = false;
    // A block taller than a page runs on across the sheets below it.
    while (block.bottom - pageStart > body) {
      pages++;
      pageStart += PAGE_HEIGHT + PAGE_GAP;
    }
    if (block.el.hasAttribute("data-page-break") && blocks[i + 1]) {
      const top = block.bottom + block.marginBottom;
      breaks.push({ pos: block.end, fill: pageStart + body - top });
      pages++;
      pageStart = top;
      first = true;
    }
  });
  const lastBlock = blocks.at(-1);
  if (lastBlock) {
    const end = lastBlock.bottom + lastBlock.marginBottom;
    breaks.push({
      pos: lastBlock.end,
      fill: pageStart + body - end,
      last: true,
    });
  }
  for (const b of breaks) b.fill = Math.max(0, Math.round(b.fill));

  const frames = `${header?.innerHTML ?? ""}|${footer?.innerHTML ?? ""}`;
  return { breaks, pages, padY, headerSpace, footerSpace, frames };
}

function decorate(view: EditorView, layout: Layout) {
  const signature = [
    layout.padY,
    layout.headerSpace,
    layout.footerSpace,
    layout.frames.length,
    hash(layout.frames),
  ].join(":");
  return DecorationSet.create(
    view.state.doc,
    layout.breaks.map((b) =>
      Decoration.widget(b.pos, (v) => spacer(v, b, layout), {
        side: -1,
        ignoreSelection: true,
        key: `${b.last ? "end" : "gap"}:${Math.round(b.fill)}:${signature}`,
      }),
    ),
  );
}

function hash(text: string) {
  let h = 0;
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) | 0;
  return h;
}

const sameLayout = (a: Layout | null, b: Layout | null) =>
  JSON.stringify(a) === JSON.stringify(b);

export const Pagination = Extension.create({
  name: "pagination",

  addProseMirrorPlugins() {
    return [
      new Plugin<PaginationState>({
        key: paginationKey,
        state: {
          init: () => ({
            active: false,
            pages: 1,
            decorations: DecorationSet.empty,
          }),
          apply(tr, value) {
            const next = tr.getMeta(paginationKey) as
              | PaginationState
              | undefined;
            if (next) return next;
            return {
              ...value,
              decorations: value.decorations.map(tr.mapping, tr.doc),
            };
          },
        },
        props: {
          decorations: (state) => paginationKey.getState(state)?.decorations,
        },
        view(view) {
          let frame = 0;
          let last: Layout | null = null;
          // Spacers can shift margins slightly, so settle in a few passes.
          let passes = 0;
          const run = () => {
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(() => {
              if (view.isDestroyed) return;
              const layout = measure(view);
              if (sameLayout(layout, last)) return;
              last = layout;
              if (++passes > 4) return;
              view.dispatch(
                view.state.tr.setMeta(paginationKey, {
                  active: !!layout,
                  pages: layout?.pages ?? 1,
                  decorations: layout
                    ? decorate(view, layout)
                    : DecorationSet.empty,
                } satisfies PaginationState),
              );
              run();
            });
          };
          const restart = () => {
            passes = 0;
            run();
          };
          const media = window.matchMedia(WIDE);
          media.addEventListener("change", restart);
          window.addEventListener("resize", restart);
          document.fonts?.ready.then(restart);
          restart();
          return {
            update(view, prev) {
              if (view.state.doc !== prev.doc) restart();
            },
            destroy() {
              cancelAnimationFrame(frame);
              media.removeEventListener("change", restart);
              window.removeEventListener("resize", restart);
            },
          };
        },
      }),
    ];
  },
});
