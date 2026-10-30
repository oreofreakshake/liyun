import { PAGE_GAP, PAGE_HEIGHT } from "./pagination";

export function PageSheets({ pages }: { pages: number }) {
  return Array.from({ length: pages }, (_, i) => (
    <div
      // biome-ignore lint/suspicious/noArrayIndexKey: sheets are positional
      key={i}
      aria-hidden
      className="pointer-events-none absolute inset-x-0 -z-10 rounded-xl border border-border bg-card shadow-soft print:hidden"
      style={{ top: i * (PAGE_HEIGHT + PAGE_GAP), height: PAGE_HEIGHT }}
    />
  ));
}
