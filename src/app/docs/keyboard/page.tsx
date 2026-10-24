import { type LayoutId, layouts } from "editor/layouts";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Documentation | Liyun" };

const rows = ["qwertyuiop", "asdfghjkl", "zxcvbnm"];

const shown = (char: string) =>
  /[\u07A6-\u07B0]/.test(char) ? `\u25CC${char}` : char;

const keyWidth = "calc((100% - 3.375rem) / 10)";
const rowOffset = ["0", `calc(${keyWidth} * 0.5)`, `calc(${keyWidth} * 1.1)`];

function Key({
  latin,
  main,
  shift,
  offset,
}: {
  latin: string;
  main?: string;
  shift?: string;
  offset: string;
}) {
  return (
    <div
      className="relative flex aspect-[5/6] flex-none items-center justify-center rounded-[10px] border border-border bg-card shadow-[inset_0_-2px_0_var(--border),0_1px_2px_rgba(0,0,0,0.04)]"
      style={{ width: keyWidth, marginInlineStart: offset }}
    >
      <span className="absolute bottom-1 left-1.5 text-[10px] leading-none text-muted-foreground sm:bottom-1.5 sm:left-2 sm:text-[11px]">
        {latin}
      </span>
      {shift && (
        <span
          lang="dv"
          className="absolute top-1 right-1.5 text-[11px] leading-none text-muted-foreground sm:top-1.5 sm:right-2 sm:text-[13px]"
        >
          {shown(shift)}
        </span>
      )}
      <span lang="dv" className="text-[clamp(15px,3.2vw,24px)] leading-none">
        {main ? shown(main) : ""}
      </span>
    </div>
  );
}

function Keyboard({ id }: { id: LayoutId }) {
  const keys = layouts[id].keys;
  return (
    <figure className="keyboard" aria-label={`${layouts[id].name} key map`}>
      {rows.map((row, i) => (
        <div key={row} className="flex gap-1.5">
          {[...row].map((key, k) => (
            <Key
              key={key}
              latin={key.toUpperCase()}
              main={keys[key]}
              shift={keys[key.toUpperCase()]}
              offset={k === 0 ? rowOffset[i] : "0"}
            />
          ))}
        </div>
      ))}
      <figcaption className="pt-2 text-[13px] text-muted-foreground">
        Large: the key on its own. Top right: with Shift.
      </figcaption>
    </figure>
  );
}

export default function KeyboardDocs() {
  return (
    <>
      <h1>Thaana keyboard</h1>
      <p className="lead">
        Type Thaana on any keyboard. Liyun turns each key into a Thaana letter
        as you type.
      </p>

      <h2>Switching</h2>
      <p>
        Pick a layout from the keyboard menu in the toolbar, or press{" "}
        <kbd>Ctrl</kbd> <kbd>Shift</kbd> <kbd>Space</kbd>, or <kbd>Cmd</kbd>{" "}
        <kbd>Shift</kbd> <kbd>Space</kbd> on a Mac, to switch between Thaana and
        English. If your computer already has a Dhivehi keyboard, choose{" "}
        <strong>English keyboard</strong> in Liyun and use yours.
      </p>

      <h2>Phonetic</h2>
      <p>
        The most common layout: keys follow the sound, so <kbd>d</kbd> is{" "}
        <span lang="dv">ދ</span> and <kbd>i</kbd> is <span lang="dv">◌ި</span>.
      </p>
      <Keyboard id="phonetic" />

      <h2>Typewriter</h2>
      <p>The standard layout of Thaana typewriters.</p>
      <Keyboard id="typewriter" />

      <p className="note">
        There is also a phonetic variant by Hassan Hameed in the keyboard menu.
        Layouts come from JTK by Jawish Hameed (MIT licence).
      </p>
    </>
  );
}
