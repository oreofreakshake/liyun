import type { Metadata } from "next";
import { KeyboardMap } from "@/components/keyboard-map";

export const metadata: Metadata = { title: "Documentation | Liyun" };

export default function KeyboardDocs() {
  return (
    <>
      <h1>Thaana keyboard</h1>
      <p className="lead">
        Type Thaana on any keyboard. Liyun turns each key into a Thaana letter
        as you type.
      </p>

      <h2>The layout</h2>

      <KeyboardMap />
    </>
  );
}
