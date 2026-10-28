import type { Metadata } from "next";

export const metadata: Metadata = { title: "Documentation | Liyun" };

export default function ExportDocs() {
  return (
    <>
      <h1>Files and export</h1>
      <p className="lead">Everything is in the editor&apos;s File menu.</p>

      <h2>Liyun files</h2>
      <p>
        A <code>.liyun</code> file keeps everything exactly as you wrote it.{" "}
        <strong>Download</strong> saves one. In the desktop app,{" "}
        <strong>Save</strong> writes back to the file you opened and{" "}
        <strong>Save As</strong> picks a new one.
      </p>
      <p>
        <strong>Open</strong> opens a <code>.liyun</code> file, a Word file, or
        a <code>.json</code> backup from an older version as a new document. The
        desktop app also opens them with a double-click.
      </p>

      <h2>Opening Word files</h2>
      <p>
        Text, headings, bold, italics, lists and tables come across. Fonts,
        alignment, the header and the footer do not.
      </p>

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

      <h2>Keep copies</h2>
      <p>
        Documents live only in this browser or app. Clearing browser data
        deletes them, so download a <code>.liyun</code> copy of anything you
        want to keep.
      </p>
    </>
  );
}
