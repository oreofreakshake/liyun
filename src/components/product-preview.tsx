import {
  ArrowDown01Icon,
  HighlighterIcon,
  KeyboardIcon,
  Layout3RowIcon,
  RedoIcon,
  RightToLeftListBulletIcon,
  RightToLeftListNumberIcon,
  TableIcon,
  TextAlignRightIcon,
  TextBoldIcon,
  TextItalicIcon,
  TextUnderlineIcon,
  UndoIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import type { ReactNode } from "react";

type Segment = string | { run: string };

type Line = {
  parts: Segment[];
  align?: "center" | "end";
  arabic?: boolean;
  phone?: boolean;
};

const lines: Line[] = [
  {
    parts: ["بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ"],
    align: "center",
    arabic: true,
    phone: true,
  },
  { parts: ["ނޫފަރުގެ"], align: "end" },
  { parts: ["މ. ދިއްގަރު"], align: "end" },
  {
    parts: [{ run: "Blue Lagoon Resorts" }, " ގެ ހިއުމަން ރިސޯސަސް މެނޭޖަރަށް،"],
    phone: true,
  },
  { parts: ["ވެދުން ސަލާމަށް ފަހު ދަންނަވަމެވެ."], phone: true },
  {
    parts: [
      "ތިޔަ ކުންފުނިން ",
      { run: "12" },
      " އޮކްޓޫބަރު ",
      { run: "2026" },
      " ގައި ޝާއިޢުކުރެއްވި ",
      { run: "(Ref: HR-2026/118)" },
      " އިޢުލާނާ ގުޅިގެން، ފްރަންޓް އޮފީސް އެސިސްޓަންޓުގެ މަޤާމަށް އަޅުގަނޑު ހުށަހަޅަމެވެ.",
    ],
  },
  {
    parts: [
      "އަޅުގަނޑާ ގުޅުއްވާނީ ",
      { run: "+960 777 1234" },
      " އަށް، ނުވަތަ ",
      { run: "hello@example.mv" },
      " އަށް ސިޓީ ފޮނުއްވައިގެންނެވެ.",
    ],
    phone: true,
  },
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

function Divider() {
  return <span className="mx-1 h-4 w-px shrink-0 bg-border" />;
}

function Menu({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex h-7 shrink-0 items-center gap-1 rounded-full px-2 text-[12px] text-body">
      {children}
      <Icon icon={ArrowDown01Icon} className="size-3 text-muted-foreground" />
    </span>
  );
}

export function ProductPreview() {
  return (
    <figure
      aria-label="The Liyun editor: a Dhivehi letter where English words and numbers are highlighted as protected."
      className="overflow-hidden rounded-2xl border border-border bg-canvas"
    >
      <div aria-hidden="true" className="flex justify-center px-3 pt-3 sm:pt-5">
        <div className="flex max-w-full items-center gap-0.5 overflow-hidden rounded-full border border-border bg-card p-1">
          <span className="hidden sm:contents">
            <Pill>
              <Icon icon={UndoIcon} />
            </Pill>
            <Pill>
              <Icon icon={RedoIcon} className="size-4 text-muted-foreground" />
            </Pill>
            <Divider />
            <Menu>Normal</Menu>
            <Menu>AK Rasmee</Menu>
            <Menu>17</Menu>
            <Divider />
          </span>
          <Pill>
            <Icon icon={TextBoldIcon} />
          </Pill>
          <Pill>
            <Icon icon={TextItalicIcon} />
          </Pill>
          <Pill>
            <Icon icon={TextUnderlineIcon} />
          </Pill>
          <Divider />
          <Menu>
            <Icon icon={TextAlignRightIcon} />
          </Menu>
          <span className="hidden sm:contents">
            <Pill>
              <Icon icon={RightToLeftListBulletIcon} />
            </Pill>
            <Pill>
              <Icon icon={RightToLeftListNumberIcon} />
            </Pill>
            <Divider />
            <Menu>
              <Icon icon={TableIcon} />
            </Menu>
            <Menu>
              <Icon icon={Layout3RowIcon} />
            </Menu>
          </span>
          <Menu>Auto</Menu>
          <span className="hidden md:contents">
            <Menu>
              <Icon icon={KeyboardIcon} />
              Thaana
            </Menu>
          </span>
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
          {lines.map((l, i) => {
            let run = 0;
            return (
              <p
                // biome-ignore lint/suspicious/noArrayIndexKey: static lines
                key={i}
                dir="rtl"
                lang={l.arabic ? "ar" : undefined}
                className={`${l.phone ? "" : "hidden sm:block"} ${
                  l.align === "center"
                    ? "mb-4 text-center text-[19px] leading-[1.6] sm:mb-6 sm:text-[26px]"
                    : "text-[15px] leading-[1.9] sm:text-[18px]"
                } ${l.align === "end" ? "text-end" : ""} ${
                  i > 0 && !l.align ? "mt-2 sm:mt-3" : ""
                } ${i === 2 ? "mb-4 sm:mb-6" : ""}`}
              >
                {l.parts.map((part, k) =>
                  typeof part === "string" ? (
                    part
                  ) : (
                    <bdi
                      // biome-ignore lint/suspicious/noArrayIndexKey: static parts
                      key={k}
                      dir="ltr"
                      style={{
                        animationDelay: `${300 + (i * 3 + run++) * 90}ms`,
                      }}
                      className="protected whitespace-nowrap"
                    >
                      {part.run}
                    </bdi>
                  ),
                )}
              </p>
            );
          })}
        </div>
      </div>
    </figure>
  );
}
