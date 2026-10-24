import Link from "next/link";
import type { ReactNode } from "react";
import { Comparison } from "@/components/comparison";
import { Features } from "@/components/features";
import { GithubMark, githubUrl } from "@/components/github";
import { pillDark, pillLight } from "@/components/pill";
import { ProductPreview } from "@/components/product-preview";
import { SiteFooter } from "@/components/site-footer";
import { SiteNav } from "@/components/site-nav";

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

export default function Home() {
  return (
    <>
      <SiteNav heroActions />
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
              <div id="hero-actions" className="mt-8 flex gap-2">
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
            <div className="rounded-[20px] bg-panel bg-[radial-gradient(110%_90%_at_12%_8%,var(--orb-mint),transparent_60%),radial-gradient(90%_80%_at_95%_95%,var(--orb-sky),transparent_60%)] px-3 pt-6 sm:px-10 sm:pt-12 md:px-16 md:pt-16">
              <ProductPreview />
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
          <Features />
        </Band>

        <Band className="px-6 py-28 text-center">
          <h2
            className={`text-[clamp(2rem,4vw,3rem)] leading-[1.1] ${display}`}
          >
            Start writing in Dhivehi
          </h2>
          <p className="mt-4 text-[17px] text-body">Free and open source.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            <Link href="/write" className={pillDark}>
              Open the editor
            </Link>
            <a href={githubUrl} className={`${pillLight} gap-2`}>
              <GithubMark className="size-4" />
              View on GitHub
            </a>
          </div>
        </Band>
      </main>
      <SiteFooter />
    </>
  );
}
