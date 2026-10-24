import { Kbd, KbdGroup } from "editor/ui/kbd";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Documentation | Liyun" };

export default function GettingStarted() {
  return (
    <>
      <h1>Getting started</h1>
      <p className="lead">
        Liyun is a free editor for Dhivehi documents that also contain English,
        numbers and symbols. It runs in your browser, with nothing to install.
      </p>

      <h2>Where your documents are</h2>
      <p>
        Documents are saved in this browser as you type. There is no account and
        nothing is sent to a server. Clearing your browser data deletes them, so
        save a backup now and then: <strong>File, Save backup</strong>.
      </p>

      <h2>Thaana and English</h2>
      <p>
        The keyboard starts in Thaana. Switch with the keyboard menu in the
        toolbar or press{" "}
        <KbdGroup>
          <Kbd>Alt</Kbd>
          <span>+</span>
          <Kbd>Shift</Kbd>
        </KbdGroup>
      </p>

      <h2>Next</h2>
      <ul>
        <li>
          <Link href="/docs/writing">Writing mixed text</Link>: how Liyun keeps
          English and numbers in place.
        </li>
        <li>
          <Link href="/docs/keyboard">Thaana keyboard</Link>: the full key map.
        </li>
      </ul>
    </>
  );
}
