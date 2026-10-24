import type { Metadata } from "next";

export const metadata: Metadata = { title: "Documentation | Liyun" };

export default function ExportDocs() {
  return (
    <>
      <h1>Export and backup</h1>
      <p className="lead">Everything is in the File menu of the editor.</p>

      <h2>Word (.docx)</h2>
      <p>
        Paragraphs keep their direction and Thaana is marked as Dhivehi, so Word
        lays it out right to left. Word uses the <strong>Faruma</strong> font
        for Thaana; if it is not installed, Word picks its own Thaana font.
      </p>

      <h2>PDF</h2>
      <p>
        Choose <strong>Print or save as PDF</strong>, then{" "}
        <strong>Save as PDF</strong> in your browser&apos;s print window. The
        PDF looks exactly like the page in the editor.
      </p>

      <h2>Backup (.json)</h2>
      <p>
        <strong>Save backup</strong> downloads the document as a file.{" "}
        <strong>Open backup</strong> brings it back as a new document, in any
        browser. Your documents only live in this browser, so keep backups of
        anything that matters.
      </p>
    </>
  );
}
