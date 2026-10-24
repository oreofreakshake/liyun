import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = { title: "Documentation | Liyun" };

const Run = ({ children }: { children: ReactNode }) => (
  <bdi dir="ltr" className="run-mark">
    {children}
  </bdi>
);

export default function Writing() {
  return (
    <>
      <h1>Writing mixed text</h1>
      <p className="lead">
        Liyun keeps Dhivehi, English and numbers in order on its own.
      </p>

      <h2>Own direction</h2>
      <p>A Dhivehi line stays right to left, even when it starts in English.</p>
      <p className="example" lang="dv" dir="rtl">
        iPhone 17 ވިއްކަން ފަށައިފި
      </p>
      <p className="hint">
        To set it yourself, pick <strong>RTL</strong> or <strong>LTR</strong> in
        the toolbar.
      </p>

      <h2>English and numbers stay put</h2>
      <p>Brackets and symbols stay with the words they belong to.</p>
      <p className="example" lang="dv" dir="rtl">
        ގުޅުއްވާނީ <Run>+960 333 4444</Run> އަށް
      </p>
      <p className="hint">
        Turn on the highlighter in the toolbar to see these parts.
      </p>

      <h2>Type it the way it reads</h2>
      <p>
        Write <code>50%</code>, not <code>%50</code>. The Word workaround shows
        up backwards in Liyun.
      </p>
    </>
  );
}
