import type { ReactNode } from "react";
import { DocsNav, DocsPager } from "@/components/docs-nav";
import { SiteFooter } from "@/components/site-footer";
import { SiteNav } from "@/components/site-nav";

export default function DocsLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteNav />
      <div className="border-t border-border">
        <div className="mx-auto grid max-w-[1180px] grid-cols-[minmax(0,1fr)] gap-x-12 px-6 pb-24 md:grid-cols-[12rem_minmax(0,1fr)] md:border-x md:border-border md:px-8 md:pt-14">
          <DocsNav />
          <main className="docs min-w-0 pt-8 md:pt-0">
            <article className="mx-auto max-w-[680px]">
              {children}
              <DocsPager />
            </article>
          </main>
        </div>
      </div>
      <SiteFooter />
    </>
  );
}
