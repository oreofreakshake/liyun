import type { Metadata } from "next";

export const metadata: Metadata = { title: "Documentation | Liyun" };

export default function ExportDocs() {
  return (
    <>
      <h1>Export and backup</h1>
      <p className="lead">Everything is in the editor&apos;s File menu.</p>

      <h2>Word</h2>
      <p>
        <strong>Export to Word</strong> downloads a <code>.docx</code> that
        opens right to left. Formatting, tables, the header, the footer and page
        breaks come with it.
      </p>
      <p className="hint">
        Word shows Thaana fonts only if they are installed.
      </p>

      <h2>PDF</h2>
      <ol>
        <li>
          Choose <strong>Save as PDF</strong>.
        </li>
        <li>
          Set the printer to <strong>Save as PDF</strong>.
        </li>
        <li>
          Turn off <strong>Headers and footers</strong>, then save.
        </li>
      </ol>

      <h2>Backup</h2>
      <p>
        <strong>Save backup</strong> downloads a <code>.json</code> copy.{" "}
        <strong>Open backup</strong> opens it as a new document, on any
        computer.
      </p>

      <h2>Keep backups</h2>
      <p>
        Documents live only in this browser. Clearing browser data deletes them.
      </p>
    </>
  );
}
