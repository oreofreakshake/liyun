"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export const pillClass =
  "inline-flex h-9 items-center rounded-full px-4 text-[14px] whitespace-nowrap transition-colors sm:h-10 sm:text-[15px]";
export const pillDark = `${pillClass} bg-primary text-primary-foreground hover:bg-primary-active`;
export const pillLight = `${pillClass} border border-border bg-card shadow-soft hover:bg-panel`;

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 4);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <header
      className={`sticky top-0 z-30 border-b transition-colors duration-200 ${
        scrolled
          ? "border-border bg-canvas/80 backdrop-blur-md"
          : "border-transparent bg-canvas"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-[1180px] items-center gap-3 px-4 sm:px-6">
        <Link
          href="/"
          className="me-auto text-[20px] font-semibold tracking-[-0.03em]"
        >
          Liyun
        </Link>
        <Link href="/docs" className={pillLight}>
          Read the docs
        </Link>
        <Link href="/write" className={pillDark}>
          Start writing
        </Link>
      </nav>
    </header>
  );
}
