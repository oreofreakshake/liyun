import {
  Doc01Icon,
  FloppyDiskIcon,
  LicenseDraftIcon,
  PrinterIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import { layouts } from "editor/layouts";
import type { ReactNode } from "react";

function Card({
  label,
  text,
  children,
  className = "bg-panel",
}: {
  label: string;
  text: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex min-h-[20rem] flex-col justify-between gap-10 rounded-2xl p-5 md:min-h-[26rem] ${className}`}
    >
      {children}
      <div>
        <p className="text-[15px] text-muted-foreground">{label}</p>
        <p className="mt-1 text-[16px] leading-[1.45]">{text}</p>
      </div>
    </div>
  );
}

const shown = (char: string) => (/[ަ-ް]/.test(char) ? `◌${char}` : char);

function KeyboardDemo() {
  const keys = layouts.phonetic.keys;
  return (
    <div className="mx-auto mt-10 w-full max-w-sm rounded-2xl bg-card px-5 pt-6 pb-4 shadow-soft">
      <div dir="rtl" className="flex justify-center gap-1.5" aria-hidden="true">
        {[..."divehi"].map((key, i) => (
          <span
            // biome-ignore lint/suspicious/noArrayIndexKey: letters repeat
            key={i}
            className="relative flex aspect-[5/6] w-11 items-center justify-center rounded-[10px] border border-border shadow-[inset_0_-2px_0_var(--border)]"
          >
            <span className="absolute top-1 left-1.5 text-[10px] leading-none text-muted-foreground">
              {key.toUpperCase()}
            </span>
            <span lang="dv" className="mt-1.5 text-[20px] leading-none">
              {shown(keys[key])}
            </span>
          </span>
        ))}
      </div>
      <p className="sr-only">Typing divehi gives</p>
      <p
        lang="dv"
        dir="rtl"
        className="mt-3 text-center text-[36px] leading-[1.6]"
      >
        ދިވެހި
      </p>
    </div>
  );
}

function SmallCard({
  label,
  text,
  icon,
}: {
  label: string;
  text: string;
  icon: IconSvgElement;
}) {
  return (
    <div className="row-span-3 mb-2 grid grid-rows-subgrid rounded-2xl bg-panel p-2 pb-5">
      <span className="flex items-center justify-center rounded-xl bg-card shadow-soft">
        <HugeiconsIcon
          icon={icon}
          strokeWidth={1.4}
          className="size-8 text-body"
          aria-hidden="true"
        />
      </span>
      <p className="self-end px-3 pt-3 text-[15px] text-muted-foreground">
        {label}
      </p>
      <p className="max-w-[30ch] px-3 text-[16px] leading-[1.45]">{text}</p>
    </div>
  );
}

export function Features() {
  return (
    <>
      <div className="grid gap-3 px-3 pb-20 md:grid-cols-2 md:px-8">
        <Card
          label="Thaana keyboard"
          text="Phonetic Thaana on any computer, one tap from English."
          className="bg-panel bg-[radial-gradient(100%_90%_at_10%_0%,var(--orb-peach),transparent_65%),radial-gradient(90%_80%_at_100%_100%,var(--orb-rose),transparent_60%)]"
        >
          <KeyboardDemo />
        </Card>
        <Card
          label="Direction per paragraph"
          text="Each paragraph reads its own text and turns to fit."
        >
          <div className="mx-auto mt-10 w-full max-w-sm space-y-2">
            {(
              [
                ["RTL", "rtl", "iPhone 17 ވިއްކަން ފަށައިފި"],
                ["LTR", "ltr", "The word ރާއްޖެ means Maldives."],
              ] as const
            ).map(([badge, dir, text]) => (
              <div
                key={badge}
                className="flex items-center gap-3 rounded-2xl bg-card p-4 shadow-soft"
              >
                <span className="rounded-full bg-panel px-2 py-0.5 text-[12px] text-body">
                  {badge}
                </span>
                <p dir={dir} className="flex-1 text-[17px]">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <div className="grid gap-x-3 gap-y-1 px-3 pb-18 [grid-auto-rows:minmax(8rem,auto)_auto_auto] sm:grid-cols-2 md:px-8 xl:grid-cols-4 xl:[grid-auto-rows:minmax(10rem,auto)_auto_auto]">
        <SmallCard
          icon={LicenseDraftIcon}
          label="Templates"
          text="Letters, memos, minutes, invoices and news articles."
        />
        <SmallCard
          icon={Doc01Icon}
          label="Word"
          text="Exports keep right-to-left text and Thaana intact."
        />
        <SmallCard
          icon={PrinterIcon}
          label="PDF"
          text="Print or save a PDF that looks exactly like the page."
        />
        <SmallCard
          icon={FloppyDiskIcon}
          label="Saved locally"
          text="Stays in your browser. No account, backups anytime."
        />
      </div>
    </>
  );
}
