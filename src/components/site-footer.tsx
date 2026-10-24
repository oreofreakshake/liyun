import Link from "next/link";

const columns: { title: string; links: [string, string][] }[] = [
  {
    title: "Product",
    links: [
      ["Editor", "/write"],
      ["Templates", "/docs/templates"],
    ],
  },
  {
    title: "Docs",
    links: [
      ["Getting started", "/docs"],
      ["Writing mixed text", "/docs/writing"],
      ["Thaana keyboard", "/docs/keyboard"],
      ["Export", "/docs/export"],
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto grid max-w-[1180px] gap-10 border-x border-border px-6 py-16 sm:grid-cols-[1fr_auto_auto] sm:gap-20 md:px-8">
        <div>
          <p className="text-[20px] font-semibold tracking-[-0.03em]">Liyun</p>
        </div>
        {columns.map((c) => (
          <div key={c.title}>
            <p className="text-[14px] font-medium">{c.title}</p>
            <ul className="mt-3 space-y-2 text-[14px] text-body">
              {c.links.map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="hover:text-foreground">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </footer>
  );
}
