import type { ReactNode } from "react";
import { DocsNav } from "@/components/docs-nav";
import { SiteFooter } from "@/components/site-footer";
import { SiteNav } from "@/components/site-nav";

export default function DocsLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteNav />
      <div className="border-t border-border">
        <div className="mx-auto grid max-w-[1180px] gap-10 border-x border-border px-6 pt-10 pb-28 md:grid-cols-[13rem_1fr] md:gap-16 md:px-8 md:pt-16">
          <DocsNav />
          <main className="docs min-w-0 max-w-2xl">{children}</main>
        </div>
      </div>
      <SiteFooter />
    </>
  );
}
