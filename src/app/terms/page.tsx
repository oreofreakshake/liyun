import type { Metadata } from "next";
import { githubUrl } from "@/components/github";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = { title: "Terms | Liyun" };

export default function Terms() {
  return (
    <LegalPage title="Terms" updated="2 November 2026">
      <h2>Free to use</h2>
      <p>
        Liyun is free and open source under the{" "}
        <a href={`${githubUrl}/blob/main/LICENSE`}>GNU AGPL 3.0 licence</a>. You
        may use it for personal and commercial work. The name Liyun and its logo
        are trademarks and are not covered by the licence.
      </p>

      <h2>Your content</h2>
      <p>
        What you write is yours. You are responsible for its content and for
        keeping backups.
      </p>

      <h2>No warranty</h2>
      <p>
        Liyun is provided as is. We are not liable for lost documents or other
        damage from using it.
      </p>
    </LegalPage>
  );
}
