import type { ReactNode } from "react";
import { SiteFooter } from "@/components/site-footer";
import { SiteNav } from "@/components/site-nav";

export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <>
      <SiteNav />
      <div className="border-t border-border">
        <main className="docs mx-auto max-w-[1180px] px-6 pt-10 pb-24 md:border-x md:border-border md:px-8 md:pt-16">
          <article className="mx-auto max-w-[680px]">
            <h1>{title}</h1>
            <p className="lead">Last updated {updated}.</p>
            {children}
          </article>
        </main>
      </div>
      <SiteFooter />
    </>
  );
}
