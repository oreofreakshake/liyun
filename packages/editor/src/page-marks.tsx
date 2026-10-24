"use client";

import type { Editor } from "@tiptap/core";
import { type RefObject, useEffect, useState } from "react";

const mm = 96 / 25.4;
const printableHeight = (297 - 40) * mm;
const frameGap = 8 * mm;
const framePadding = 12;

type Mark = { top: number; page: number };

export function PageMarks({
  editor,
  page,
}: {
  editor: Editor;
  page: RefObject<HTMLElement | null>;
}) {
  const [marks, setMarks] = useState<Mark[]>([]);

  useEffect(() => {
    let frame = 0;
    const measure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const article = page.current;
        if (!article || !window.matchMedia("(min-width: 768px)").matches) {
          setMarks([]);
          return;
        }
        const origin = article.getBoundingClientRect().top;
        const blocks = [...editor.view.dom.children] as HTMLElement[];
        const frameHeight = (attr: string) => {
          const el = blocks.find((b) => b.hasAttribute(attr));
          return el ? el.offsetHeight - framePadding + frameGap : 0;
        };
        const height =
          printableHeight -
          frameHeight("data-page-header") -
          frameHeight("data-page-footer");
        const body = blocks.filter(
          (b) =>
            !b.hasAttribute("data-page-header") &&
            !b.hasAttribute("data-page-footer"),
        );

        const next: Mark[] = [];
        let pageNumber = 1;
        let start: number | null = null;
        const close = (end: number) => {
          if (start === null) return;
          for (let y = start + height; y < end; y += height) {
            next.push({ top: y, page: ++pageNumber });
          }
        };
        for (const block of body) {
          const rect = block.getBoundingClientRect();
          if (block.hasAttribute("data-page-break")) {
            close(rect.top - origin);
            start = null;
            pageNumber++;
            continue;
          }
          start ??= rect.top - origin;
        }
        const last = body.at(-1)?.getBoundingClientRect().bottom ?? origin;
        close(last - origin);
        setMarks((prev) =>
          JSON.stringify(prev) === JSON.stringify(next) ? prev : next,
        );
      });
    };

    measure();
    editor.on("update", measure);
    window.addEventListener("resize", measure);
    document.fonts?.ready.then(measure);
    return () => {
      cancelAnimationFrame(frame);
      editor.off("update", measure);
      window.removeEventListener("resize", measure);
    };
  }, [editor, page]);

  return marks.map((mark) => (
    <div
      key={mark.page}
      aria-hidden
      className="pointer-events-none absolute inset-x-0 border-t border-dashed border-border-strong print:hidden"
      style={{ top: mark.top }}
    >
      <span className="absolute -top-2.5 end-3 bg-card px-1.5 text-[11px] leading-5 text-muted-foreground">
        Page {mark.page}
      </span>
    </div>
  ));
}
