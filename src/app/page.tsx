import {
  Doc01Icon,
  FloppyDiskIcon,
  LicenseDraftIcon,
  PrinterIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Comparison } from "@/components/comparison";
import { SiteFooter } from "@/components/site-footer";
import { pillDark, pillLight, SiteNav } from "@/components/site-nav";

const display = "font-light tracking-[-0.02em]";

function Band({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className="border-t border-border">
      <div className={`mx-auto max-w-295 border-x border-border ${className}`}>
        {children}
      </div>
    </section>
  );
}

function SectionHead({
  label,
  title,
  text,
  action,
}: {
  label: string;
  title: ReactNode;
  text: string;
  action?: ReactNode;
}) {
  return (
    <div className="grid gap-6 px-6 pt-20 pb-10 md:grid-cols-2 md:px-8">
      <div>
        <p className="text-[15px] text-muted-foreground">{label}</p>
        <h2
          className={`mt-2 text-[clamp(1.875rem,3.4vw,2.25rem)] leading-[1.17] ${display}`}
        >
          {title}
        </h2>
        {action && <div className="mt-6">{action}</div>}
      </div>
      <p className="text-[17px] leading-[1.6] md:pt-8">{text}</p>
    </div>
  );
}

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
      className={`flex flex-col justify-between gap-10 rounded-2xl p-5 min-h-[20rem] md:min-h-[26rem] ${className}`}
    >
      {children}
      <div>
        <p className="text-[15px] text-muted-foreground">{label}</p>
        <p className="mt-1 text-[16px] leading-[1.45]">{text}</p>
      </div>
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
    <div className="row-span-3 mb-2 grid grid-rows-subgrid rounded-2xl bg-panel p-5">
      <IconTile icon={icon} />
      <p className="self-end text-[15px] text-muted-foreground">{label}</p>
      <p className="max-w-[30ch] text-[16px] leading-[1.45]">{text}</p>
    </div>
  );
}

function IconTile({ icon }: { icon: IconSvgElement }) {
  return (
    <span className="flex size-10 items-center justify-center rounded-xl border border-border bg-card">
      <HugeiconsIcon
        icon={icon}
        strokeWidth={1.6}
        className="size-5"
        aria-hidden="true"
      />
    </span>
  );
}

export default function Home() {
  return (
    <>
      <SiteNav />
      <main>
        <div className="mx-auto max-w-295">
          <section className="grid gap-8 px-6 pt-20 pb-16 md:grid-cols-2 md:px-8 md:pt-28">
            <div>
              <h1
                className={`text-[clamp(3rem,6vw,4rem)] leading-[1.05] ${display}`}
              >
                Liyun
                <span className="block text-muted-foreground">
                  Dhivehi, in order.
                </span>
              </h1>
              <div className="mt-8 flex gap-2">
                <Link href="/write" className={pillDark}>
                  Start writing
                </Link>
                <Link href="/docs" className={pillLight}>
                  Read the docs
                </Link>
              </div>
            </div>
          </section>
          <div className="px-3 pb-24 md:px-8">
            <div className="rounded-[20px] bg-panel bg-[radial-gradient(110%_90%_at_12%_8%,var(--orb-mint),transparent_60%),radial-gradient(90%_80%_at_95%_95%,var(--orb-sky),transparent_60%)] p-3 sm:p-10 md:p-16">
              <Image
                src="/images/editor.jpg"
                alt="The Liyun editor with a Dhivehi document; English words and numbers are highlighted as protected runs."
                width={2360}
                height={1440}
                priority
                className="h-auto w-full rounded-xl shadow-soft"
              />
            </div>
          </div>
        </div>

        <Band>
          <SectionHead
            label="Mixed text"
            title={
              <>
                Text that stays
                <br />
                in order
              </>
            }
            text="Most editors move brackets, numbers and symbols around English inside Dhivehi. Liyun protects them."
          />
          <div className="px-3 pb-20 md:px-8">
            <Comparison />
          </div>
        </Band>

        <Band>
          <SectionHead
            label="Features"
            title={
              <>
                Made for writing
                <br />
                in Dhivehi
              </>
            }
            text="A Thaana keyboard, templates for Maldivian documents and exports that keep everything right to left."
            action={
              <Link href="/write" className={pillDark}>
                Open the editor
              </Link>
            }
          />
          <div className="grid gap-3 px-3 pb-20 md:grid-cols-2 md:px-8">
            <Card
              label="Thaana keyboard"
              text="Phonetic or typewriter layout on any computer."
              className="bg-panel bg-[radial-gradient(100%_90%_at_10%_0%,var(--orb-peach),transparent_65%),radial-gradient(90%_80%_at_100%_100%,var(--orb-rose),transparent_60%)]"
            >
              <div className="mx-auto mt-10 w-full max-w-sm rounded-2xl bg-card p-6 shadow-soft">
                <p className="text-[14px] text-muted-foreground">You type</p>
                <p className="mt-1 font-mono text-[22px]">divehi</p>
                <p className="mt-5 text-[14px] text-muted-foreground">
                  You get
                </p>
                <p
                  lang="dv"
                  dir="rtl"
                  className="mt-1 text-right text-[34px] leading-[1.4]"
                >
                  ދިވެހި
                </p>
              </div>
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
          <div className="grid gap-x-3 gap-y-1 px-3 pb-18 [grid-auto-rows:minmax(5.5rem,auto)_auto_auto] sm:grid-cols-2 md:px-8 xl:grid-cols-4 xl:[grid-auto-rows:minmax(8rem,auto)_auto_auto]">
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
        </Band>

        <Band className="px-6 py-28 text-center">
          <h2
            className={`text-[clamp(2rem,4vw,3rem)] leading-[1.1] ${display}`}
          >
            Start writing in Dhivehi
          </h2>
          <p className="mt-4 text-[17px] text-body">Free and open source.</p>
          <div className="mt-8 flex justify-center gap-2">
            <Link href="/write" className={pillDark}>
              Open the editor
            </Link>
            <Link href="/docs" className={pillLight}>
              Read the docs
            </Link>
          </div>
        </Band>
      </main>
      <SiteFooter />
    </>
  );
}
