"use client";

import { useRef, useState } from "react";

const examples: { before: string; run: string; after: string }[] = [
  { before: "މި ޕްރޮގްރާމް ލިޔެފައިވަނީ ", run: "C++", after: " އިން" },
  { before: "ތަރައްގީ ", run: "50%", after: " އަށް އިތުރުވި" },
  { before: "ގުޅުއްވާނީ ", run: "+960 333 4444", after: " އަށް" },
  { before: "ޓިކެޓުގެ އަގަކީ ", run: "$150", after: " އެވެ." },
  {
    before: "ރައީސް ވިދާޅުވީ ",
    run: '"Welcome to Maldives!"',
    after: " މިހެންނެވެ.",
  },
];

const sides = ["In Liyun", "As typed"];

export function Comparison() {
  const scroller = useRef<HTMLDivElement>(null);
  const [side, setSide] = useState(0);

  const show = (index: number) => {
    const el = scroller.current;
    if (!el) return;
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches;
    el.scrollTo({
      left: index * el.clientWidth,
      behavior: smooth ? "smooth" : "auto",
    });
  };

  const cell = (i: number, extra = "") =>
    `px-5 py-4 text-[17px] leading-[1.8] md:px-6 md:text-[19px] ${i ? "border-t border-border" : ""} ${extra}`;

  return (
    <div className="rounded-[20px] bg-panel p-1.5">
      <div className="grid grid-cols-2 gap-1 md:hidden">
        {sides.map((label, i) => (
          <button
            key={label}
            type="button"
            aria-pressed={side === i}
            onClick={() => show(i)}
            className="h-10 rounded-xl text-[14px] text-muted-foreground transition-colors aria-pressed:bg-card aria-pressed:text-foreground aria-pressed:shadow-soft"
          >
            {label}
          </button>
        ))}
      </div>
      <div className="hidden grid-cols-2 text-right text-[14px] text-muted-foreground md:grid">
        {sides.map((label) => (
          <div key={label} className="px-5 py-3">
            {label}
          </div>
        ))}
      </div>

      <div
        ref={scroller}
        onScroll={(e) => {
          const el = e.currentTarget;
          setSide(el.scrollLeft > el.clientWidth / 2 ? 1 : 0);
        }}
        className="no-scrollbar mt-1.5 snap-x snap-mandatory overflow-x-auto rounded-2xl bg-card shadow-soft md:mt-0 md:overflow-visible"
      >
        <div className="grid auto-cols-[100%] grid-flow-col grid-rows-[repeat(5,auto)] md:auto-cols-[50%]">
          {examples.map((e, i) => (
            <p
              key={`liyun-${e.run}`}
              lang="dv"
              dir="rtl"
              className={cell(i, i === 0 ? "snap-start" : "")}
            >
              {e.before}
              <bdi dir="ltr" className="run-mark whitespace-nowrap">
                {e.run}
              </bdi>
              {e.after}
            </p>
          ))}
          {examples.map((e, i) => (
            <p
              key={`typed-${e.run}`}
              lang="dv"
              dir="rtl"
              className={cell(
                i,
                `text-muted-foreground md:border-s md:border-border ${i === 0 ? "snap-start" : ""}`,
              )}
            >
              {e.before}
              {e.run}
              {e.after}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
