import {
  Alert02Icon,
  Doc01Icon,
  FloppyDiskIcon,
  PrinterIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Documentation | Liyun" };

const formats: {
  icon: IconSvgElement;
  name: string;
  text: string;
  menu: string;
}[] = [
  {
    icon: Doc01Icon,
    name: "Word",
    text: "Opens right to left in Word.",
    menu: "Export to Word",
  },
  {
    icon: PrinterIcon,
    name: "PDF",
    text: "Same as on screen.",
    menu: "Save as PDF",
  },
  {
    icon: FloppyDiskIcon,
    name: "Backup",
    text: "Opens in any browser.",
    menu: "Save backup",
  },
];

export default function ExportDocs() {
  return (
    <>
      <h1>Export and backup</h1>
      <p className="lead">Everything is in the File menu of the editor.</p>

      <ul className="mt-10 list-none space-y-2 ps-0">
        {formats.map((f) => (
          <li
            key={f.name}
            className="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-2xl bg-panel p-4"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border bg-card">
              <HugeiconsIcon
                icon={f.icon}
                strokeWidth={1.6}
                className="size-5"
                aria-hidden="true"
              />
            </span>
            <span className="min-w-0 grow basis-[calc(100%-3.5rem)] sm:basis-0">
              <span className="block text-[16px]">{f.name}</span>
              <span className="block text-[14px] text-muted-foreground">
                {f.text}
              </span>
            </span>
            <span className="ms-14 rounded-full border border-border bg-card px-3 py-1 text-[13px] sm:ms-0">
              {f.menu}
            </span>
          </li>
        ))}
      </ul>

      <p className="mt-6 flex items-start gap-2 text-[14px] text-muted-foreground">
        <HugeiconsIcon
          icon={Alert02Icon}
          strokeWidth={1.6}
          className="mt-[5px] size-4 shrink-0"
          aria-hidden="true"
        />
        Documents live only in this browser. Keep backups.
      </p>
    </>
  );
}
