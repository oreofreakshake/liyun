import {
  ArrowDown01Icon,
  CloudSavingDoneIcon,
  HighlighterIcon,
  KeyboardIcon,
  TextBoldIcon,
  TextItalicIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import type { ReactNode } from "react";
import { LogoMark } from "@/components/logo";

type Line = {
  before: string;
  run: string;
  after: string;
  heading?: boolean;
  phone?: boolean;
};

const lines: Line[] = [
  {
    before: "ބައްދަލުވުން ",
    run: "(Meeting 2026)",
    after: " ހުޅުވާލި",
    heading: true,
    phone: true,
  },
  { before: "", run: "iPhone 17", after: " ވިއްކަން ފަށައިފި", phone: true },
  { before: "ތަރައްގީ ", run: "50%", after: " އަށް އިތުރުވި", phone: true },
  { before: "ގުޅުއްވާނީ ", run: "+960 333 4444", after: " އަށް" },
  { before: "ޓިކެޓުގެ އަގަކީ ", run: "$150", after: " އެވެ." },
];

function Icon({
  icon,
  className = "size-4",
}: {
  icon: IconSvgElement;
  className?: string;
}) {
  return (
    <HugeiconsIcon
      icon={icon}
      strokeWidth={1.6}
      className={className}
      aria-hidden="true"
    />
  );
}

function Pill({
  children,
  dark,
  wide,
}: {
  children: ReactNode;
  dark?: boolean;
  wide?: boolean;
}) {
  return (
    <span
      className={`inline-flex h-7 shrink-0 items-center justify-center gap-1.5 rounded-full text-[12px] ${
        wide ? "px-2.5" : "w-7"
      } ${dark ? "bg-primary text-primary-foreground" : "text-body"}`}
    >
      {children}
    </span>
  );
}

export function ProductPreview() {
  return (
    <figure
      aria-label="The Liyun editor: a Dhivehi document where English words and numbers are highlighted as protected."
      className="overflow-hidden rounded-2xl border border-border bg-canvas"
    >
      <div
        aria-hidden="true"
        className="flex h-11 items-center gap-2 border-b border-border px-4 sm:h-12"
      >
        <LogoMark className="h-5 w-auto" />
        <span className="mx-1 h-4 w-px bg-border" />
        <span lang="dv" dir="rtl" className="truncate text-[13px]">
          ބައްދަލުވުން (Meeting 2026)
        </span>
        <span className="ms-auto flex items-center gap-2">
          <Icon
            icon={CloudSavingDoneIcon}
            className="size-4 text-muted-foreground"
          />
          <span className="hidden h-7 items-center rounded-full border border-border bg-card px-3 text-[12px] sm:inline-flex">
            File
          </span>
          <span className="inline-flex h-7 items-center rounded-full bg-primary px-3 text-[12px] text-primary-foreground">
            New
          </span>
        </span>
      </div>

      <div aria-hidden="true" className="flex justify-center px-3 pt-3 sm:pt-4">
        <div className="flex max-w-full items-center gap-0.5 overflow-hidden rounded-full border border-border bg-card p-1">
          <Pill>
            <Icon icon={TextBoldIcon} />
          </Pill>
          <Pill>
            <Icon icon={TextItalicIcon} />
          </Pill>
          <span className="mx-1 h-4 w-px bg-border" />
          <Pill dark wide>
            Auto · RTL
          </Pill>
          <span className="hidden sm:contents">
            <Pill wide>RTL</Pill>
            <Pill wide>LTR</Pill>
            <span className="mx-1 h-4 w-px bg-border" />
            <Pill wide>
              <Icon icon={KeyboardIcon} />
              Thaana
              <Icon
                icon={ArrowDown01Icon}
                className="size-3 text-muted-foreground"
              />
            </Pill>
          </span>
          <span className="mx-1 h-4 w-px bg-border" />
          <Pill dark>
            <Icon icon={HighlighterIcon} />
          </Pill>
        </div>
      </div>

      <div className="px-1.5 pt-3 sm:px-10 sm:pt-5">
        <div
          lang="dv"
          className="mx-auto max-w-2xl rounded-t-xl border border-b-0 border-border bg-card px-3.5 pt-7 pb-6 sm:px-14 sm:pt-12 sm:pb-10"
        >
          {lines.map((l, i) => (
            <p
              key={l.run}
              dir="rtl"
              className={`${l.phone ? "" : "hidden sm:block"} ${
                l.heading
                  ? "mb-3 text-[18px] leading-[1.4] sm:mb-5 sm:text-[30px]"
                  : "mt-2 text-[16px] leading-[1.8] sm:text-[19px]"
              }`}
            >
              {l.before}
              <bdi
                dir="ltr"
                style={{ animationDelay: `${300 + i * 120}ms` }}
                className="protected rounded-md px-0.5 whitespace-nowrap"
              >
                {l.run}
              </bdi>
              {l.after}
            </p>
          ))}
        </div>
      </div>
    </figure>
  );
}
