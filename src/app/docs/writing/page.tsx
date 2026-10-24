import type { Metadata } from "next";

export const metadata: Metadata = { title: "Documentation | Liyun" };

export default function Writing() {
  return (
    <>
      <h1>Writing mixed text</h1>
      <p className="lead">
        Thaana runs right to left, English and numbers left to right. Liyun
        keeps both in order without you doing anything.
      </p>

      <h2>Each paragraph has its own direction</h2>
      <p>
        Liyun looks at what you write in a paragraph and sets its direction. A
        Dhivehi sentence that starts with an English word stays right to left:
      </p>
      <p className="example" lang="dv" dir="rtl">
        iPhone 17 ވިއްކަން ފަށައިފި
      </p>
      <p>
        The toolbar shows what it chose, for example <strong>Auto · RTL</strong>
        . Press <strong>RTL</strong> or <strong>LTR</strong> to set a paragraph
        yourself; <strong>Auto</strong> hands it back.
      </p>

      <h2>English and numbers are protected</h2>
      <p>
        Brackets, <code>%</code>, <code>$</code>, <code>+</code>, <code>#</code>{" "}
        and <code>/</code> next to English or numbers often jump to the wrong
        side. Liyun protects each run of English and numbers so they stay put:
      </p>
      <p className="example" lang="dv" dir="rtl">
        ގުޅުއްވާނީ <bdi dir="ltr">+960 333 4444</bdi> އަށް
      </p>
      <p>
        Press the highlighter button in the toolbar to see the protected parts.
      </p>

      <h2>Type it the way it reads</h2>
      <p>
        Write <code>50%</code>, not <code>%50</code>. In Word, people often type
        the percent sign first to make it show up right; Liyun shows text as
        typed, so the workaround shows up backwards here.
      </p>
    </>
  );
}
