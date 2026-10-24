import type { Metadata } from "next";
import { templates } from "@/templates";

export const metadata: Metadata = { title: "Documentation | Liyun" };

export default function TemplatesDocs() {
  return (
    <>
      <h1>Templates</h1>
      <p className="lead">
        Start from a Maldivian document layout instead of a blank page.
      </p>

      <h2>Using a template</h2>
      <p>
        In the editor, open <strong>Templates</strong> and pick one. It opens as
        a new document, so nothing you have written is replaced. Replace the
        parts in brackets, like <span lang="dv">[ނަން]</span>, with your own text.
      </p>

      <h2>Available templates</h2>
      <ul className="list-none! ps-0!">
        {templates.map((t) => (
          <li
            key={t.id}
            className="flex items-baseline justify-between gap-4 border-b border-border py-3"
          >
            <span>{t.title.en}</span>
            <span lang="dv" className="text-[18px] text-body">
              {t.title.dv}
            </span>
          </li>
        ))}
      </ul>

      <h2>Add a template</h2>
      <p>
        Templates are plain HTML files in the project. The steps are in{" "}
        <code>CONTRIBUTING.md</code>. Please use placeholders, not real names or
        reference numbers.
      </p>
    </>
  );
}
