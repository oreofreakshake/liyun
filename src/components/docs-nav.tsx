"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export const docsPages: [string, string][] = [
  ["/docs", "Getting started"],
  ["/docs/writing", "Writing mixed text"],
  ["/docs/keyboard", "Thaana keyboard"],
  ["/docs/templates", "Templates"],
  ["/docs/export", "Export and backup"],
];

export function DocsNav() {
  const path = usePathname().replace(/\/$/, "");
  return (
    <nav aria-label="Docs" className="md:sticky md:top-24 md:self-start">
      <ul className="flex gap-1 overflow-x-auto md:flex-col">
        {docsPages.map(([href, label]) => (
          <li key={href} className="shrink-0">
            <Link
              href={href}
              aria-current={path === href ? "page" : undefined}
              className="block rounded-full px-3 py-1.5 text-[14px] text-body transition-colors hover:text-foreground aria-[current=page]:bg-card aria-[current=page]:text-foreground aria-[current=page]:shadow-soft"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
