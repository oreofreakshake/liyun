"use client";

import dynamic from "next/dynamic";

const Workspace = dynamic(
  () => import("./workspace").then((m) => m.Workspace),
  { ssr: false },
);

export function WorkspaceLoader({ demoHtml }: { demoHtml: string }) {
  return <Workspace demoHtml={demoHtml} />;
}
