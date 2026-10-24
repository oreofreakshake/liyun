"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Wordmark } from "@/components/logo";
import { pillDark, pillLight } from "@/components/pill";

export function SiteNav({ heroActions = false }: { heroActions?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [heroInView, setHeroInView] = useState(heroActions);
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 4);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  useEffect(() => {
    const hero = heroActions && document.getElementById("hero-actions");
    if (!hero) return;
    const observer = new IntersectionObserver(
      ([entry]) => setHeroInView(entry.isIntersecting),
      { rootMargin: "-64px 0px 0px 0px" },
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, [heroActions]);

  const hideOnPhone = heroActions && heroInView;

  return (
    <header
      className={`sticky top-0 z-30 border-b transition-colors duration-200 ${
        scrolled
          ? "border-border bg-canvas/80 backdrop-blur-md"
          : "border-transparent bg-canvas"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-[1180px] items-center gap-3 px-4 sm:px-6">
        <Link href="/" className="me-auto flex items-center">
          <Wordmark />
        </Link>
        <div
          className={`flex items-center gap-2 transition-[opacity,translate,visibility] duration-300 ease-out motion-reduce:transition-none ${
            hideOnPhone
              ? "max-sm:invisible max-sm:translate-y-1.5 max-sm:opacity-0"
              : ""
          }`}
        >
          <Link href="/docs" className={pillLight}>
            Read the docs
          </Link>
          <Link href="/write" className={pillDark}>
            Start writing
          </Link>
        </div>
      </nav>
    </header>
  );
}
