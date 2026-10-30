import type { Metadata } from "next";

export const metadata: Metadata = { title: "Documentation | Liyun" };

export default function Spelling() {
  return (
    <>
      <h1>Spell check</h1>
      <p className="lead">
        Liyun underlines Dhivehi words it does not know and suggests fixes.
      </p>

      <h2>Fix a word</h2>
      <p>Words with a mistake get a red line once you finish typing them.</p>
      <p className="example" lang="dv" dir="rtl">
        އަހަރެން <span className="spelling-error">ދިވެހް</span> ބަހުން ލިޔަމެވެ
      </p>
      <p className="hint">
        Right-click the word, or long-press it on a phone, and pick a
        suggestion. Here, ދިވެހި.
      </p>

      <h2>Words it does not know</h2>
      <p>
        Names and rare words can be underlined even when they are right. From
        the same menu:
      </p>
      <ul>
        <li>
          <strong>Add to dictionary</strong> accepts the word from now on, in
          this browser.
        </li>
        <li>
          <strong>Ignore</strong> skips it until you reload the page.
        </li>
      </ul>

      <h2>What it checks</h2>
      <p>
        Only Thaana. English words and numbers are left alone. To turn it off,
        open the keyboard menu in the toolbar and untick{" "}
        <strong>Check spelling</strong>.
      </p>
    </>
  );
}
