import Link from "next/link";
import { Wordmark } from "@/components/logo";

const links: [string, string][] = [
  ["Privacy", "/privacy"],
  ["Terms", "/terms"],
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-[1180px] items-center justify-between gap-6 px-6 py-10 md:border-x md:border-border md:px-8">
        <Link href="/" aria-label="Liyun home">
          <Wordmark />
        </Link>
        <nav className="flex gap-6 text-[14px] text-body">
          {links.map(([label, href]) => (
            <Link key={href} href={href} className="hover:text-foreground">
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
