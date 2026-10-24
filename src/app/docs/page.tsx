import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Documentation | Liyun" };

export default function GettingStarted() {
  return (
    <>
      <h1>Getting started</h1>
      <p className="lead">
        Liyun is a writing app for Dhivehi documents that also contain English,
        numbers and symbols.
      </p>

      <h2>Write your first document</h2>
      <ol>
        <li>
          Open the <Link href="/write">editor</Link>. Your first visit opens a
          short sample document.
        </li>
        <li>
          Press <strong>New</strong> for a blank page, or pick one from{" "}
          <strong>Templates</strong>.
        </li>
        <li>
          Type. The Thaana keyboard is on, so <kbd>divehi</kbd> types{" "}
          <span lang="dv">ދިވެހި</span>. Press <kbd>Ctrl</kbd> <kbd>Shift</kbd>{" "}
          <kbd>Space</kbd> (<kbd>Cmd</kbd> on a Mac) to type English.
        </li>
      </ol>

      <h2>Where your documents are</h2>
      <p>
        Documents are saved in this browser as you type. There is no account and
        nothing is sent to a server. That also means clearing your browser data
        deletes them, so save a backup now and then:{" "}
        <strong>File, Save backup</strong>.
      </p>

      <h2>Next</h2>
      <ul>
        <li>
          <Link href="/docs/writing">Writing mixed text</Link>: how Liyun keeps
          English and numbers in place.
        </li>
        <li>
          <Link href="/docs/keyboard">Thaana keyboard</Link>: layouts and keys.
        </li>
      </ul>
    </>
  );
}
