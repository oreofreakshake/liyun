import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = { title: "Privacy | Liyun" };

export default function Privacy() {
  return (
    <LegalPage title="Privacy" updated="24 October 2026">
      <h2>Your documents</h2>
      <p>
        Documents are saved in your browser on your device. They are never sent
        to us or anyone else, and we cannot see them.
      </p>

      <h2>No tracking</h2>
      <p>
        Liyun has no accounts, no cookies, no analytics and no ads. Fonts are
        served from this site, not from third parties.
      </p>

      <h2>Hosting</h2>
      <p>
        Like any website, the host may keep standard request logs, such as IP
        addresses, for security and reliability.
      </p>
    </LegalPage>
  );
}
