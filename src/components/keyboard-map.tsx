"use client";

import { layouts } from "editor/layouts";
import { Kbd } from "editor/ui/kbd";
import { ToggleGroup, ToggleGroupItem } from "editor/ui/toggle-group";
import { useState } from "react";

const rows = ["qwertyuiop", "asdfghjkl", "zxcvbnm"];
const keyWidth = "calc((100% - 3.375rem) / 10)";
const rowOffset = ["0", `calc(${keyWidth} * 0.5)`, `calc(${keyWidth} * 1.1)`];

const shown = (char: string) =>
  /[\u07A6-\u07B0]/.test(char) ? `\u25CC${char}` : char;

export function KeyboardMap() {
  const keys = layouts.phonetic.keys;
  const [layer, setLayer] = useState<"keys" | "shift">("keys");
  const shift = layer === "shift";
  const [edges, setEdges] = useState({ start: false, end: true });
  const fade = (on: boolean) => (on ? "transparent" : "black");
  const mask = `linear-gradient(to right, ${fade(edges.start)}, black 2.5rem, black calc(100% - 2.5rem), ${fade(edges.end)})`;

  return (
    <figure className="keyboard" aria-label="Thaana keyboard map">
      <ToggleGroup
        type="single"
        variant="outline"
        size="sm"
        value={layer}
        onValueChange={(v) => v && setLayer(v as "keys" | "shift")}
        className="mb-3"
      >
        <ToggleGroupItem value="keys">Keys</ToggleGroupItem>
        <ToggleGroupItem value="shift">With Shift</ToggleGroupItem>
      </ToggleGroup>
      <div
        onScroll={(e) => {
          const el = e.currentTarget;
          setEdges({
            start: el.scrollLeft > 4,
            end: el.scrollLeft + el.clientWidth < el.scrollWidth - 4,
          });
        }}
        style={{ maskImage: mask }}
        className="no-scrollbar -mx-3 overflow-x-auto px-3 sm:mx-0 sm:overflow-visible sm:px-0 sm:[mask-image:none]!"
      >
        <div className="min-w-[36rem] space-y-1.5">
          {rows.map((row, i) => (
            <div key={row} className="flex gap-1.5">
              {[...row].map((key, k) => {
                const latin = shift ? key.toUpperCase() : key;
                const thaana = keys[latin];
                return (
                  <div
                    key={key}
                    className="relative flex aspect-[5/6] flex-none items-center justify-center rounded-[10px] border border-border bg-card shadow-[inset_0_-2px_0_var(--border)]"
                    style={{
                      width: keyWidth,
                      marginInlineStart: k === 0 ? rowOffset[i] : "0",
                    }}
                  >
                    <span className="absolute top-1.5 left-2 text-[11px] leading-none text-muted-foreground">
                      {latin.toUpperCase()}
                    </span>
                    <span lang="dv" className="mt-1.5 text-[24px] leading-none">
                      {thaana ? shown(thaana) : ""}
                    </span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <figcaption className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-4 text-[13px] text-muted-foreground">
        <span>Punctuation</span>
        {[",", ";", "?"].map((key) => (
          <span key={key} className="inline-flex items-center gap-1.5">
            <Kbd>{key}</Kbd>
            <span lang="dv" className="text-[17px] text-foreground">
              {keys[key]}
            </span>
          </span>
        ))}
      </figcaption>
    </figure>
  );
}
