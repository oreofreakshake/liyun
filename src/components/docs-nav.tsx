"use client";

import { ArrowDown01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "editor/ui/dropdown-menu";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const docsPages: [string, string][] = [
  ["/docs", "Getting started"],
  ["/docs/writing", "Writing mixed text"],
  ["/docs/keyboard", "Thaana keyboard"],
  ["/docs/templates", "Templates"],
  ["/docs/export", "Files and export"],
];

export function useDocsPath() {
  return (usePathname() ?? "/docs").replace(/(\.html)?\/?$/, "") || "/docs";
}

export function DocsNav() {
  const path = useDocsPath();
  const current = docsPages.find(([href]) => href === path) ?? docsPages[0];

  return (
    <>
      <div className="sticky top-16 z-20 -mx-6 border-b border-border bg-canvas/85 px-6 py-2.5 backdrop-blur-md md:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex h-10 w-full items-center justify-between rounded-xl border border-border bg-card px-4 text-[15px] outline-none data-[state=open]:bg-panel">
            {current[1]}
            <HugeiconsIcon
              icon={ArrowDown01Icon}
              strokeWidth={1.6}
              className="size-4 text-muted-foreground"
              aria-hidden="true"
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="w-[var(--radix-dropdown-menu-trigger-width)]"
          >
            {docsPages.map(([href, label]) => (
              <DropdownMenuItem key={href} asChild>
                <Link
                  href={href}
                  aria-current={href === path ? "page" : undefined}
                  className="aria-[current=page]:font-medium"
                >
                  {label}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <nav
        aria-label="Documentation"
        className="hidden md:sticky md:top-24 md:block md:self-start"
      >
        <p className="px-3 text-[13px] text-muted-foreground">Documentation</p>
        <ul className="mt-2 space-y-0.5">
          {docsPages.map(([href, label]) => (
            <li key={href}>
              <Link
                href={href}
                aria-current={href === path ? "page" : undefined}
                className="block rounded-lg px-3 py-1.5 text-[14px] text-body transition-colors hover:bg-panel hover:text-foreground aria-[current=page]:bg-panel aria-[current=page]:font-medium aria-[current=page]:text-foreground"
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}

export function DocsPager() {
  const path = useDocsPath();
  const index = docsPages.findIndex(([href]) => href === path);
  const prev = docsPages[index - 1];
  const next = docsPages[index + 1];

  return (
    <nav
      aria-label="More documentation"
      className="mt-16 grid gap-3 border-t border-border pt-8 sm:grid-cols-2"
    >
      {prev ? (
        <Link
          href={prev[0]}
          className="rounded-2xl bg-panel px-5 py-4 transition-colors hover:bg-panel-strong"
        >
          <span className="block text-[13px] text-muted-foreground">
            Previous
          </span>
          <span className="mt-0.5 block text-[16px]">{prev[1]}</span>
        </Link>
      ) : (
        <span className="hidden sm:block" />
      )}
      {next && (
        <Link
          href={next[0]}
          className="rounded-2xl bg-panel px-5 py-4 text-right transition-colors hover:bg-panel-strong"
        >
          <span className="block text-[13px] text-muted-foreground">Next</span>
          <span className="mt-0.5 block text-[16px]">{next[1]}</span>
        </Link>
      )}
    </nav>
  );
}
