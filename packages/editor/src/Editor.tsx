"use client";

import {
  Add01Icon,
  ArrowDown01Icon,
  Delete02Icon,
  Doc01Icon,
  Download01Icon,
  FolderOpenIcon,
  LicenseDraftIcon,
  PrinterIcon,
} from "@hugeicons/core-free-icons";
import type { Content, JSONContent } from "@tiptap/core";
import { EditorContent, useEditor } from "@tiptap/react";
import { type ReactNode, useEffect, useReducer, useRef, useState } from "react";
import type { Template } from "./document";
import { download, parseDocumentFile, toDocumentFile } from "./export/file";
import { coreExtensionOptions, editorExtensions } from "./extensions";
import { PageMarks } from "./page-marks";
import { Icon, Toolbar } from "./toolbar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

const pageClass = [
  "min-h-[calc(1123px-12rem)] text-[17px] leading-[1.85] tracking-normal outline-none",
  "[&_h1]:text-[36px] [&_h1]:leading-[1.25] [&_h1]:mb-6",
  "[&_h2]:text-[28px] [&_h2]:leading-[1.3] [&_h2]:mb-4",
  "[&_h3]:text-[22px] [&_h3]:leading-[1.4] [&_h3]:mt-6 [&_h3]:mb-2",
  "[&_p+p]:mt-3 [&_ol]:list-decimal [&_ol]:ps-6 [&_ul]:list-disc [&_ul]:ps-6 [&_li+li]:mt-1",
  "[&_table]:my-4 [&_table]:w-full [&_table]:border-collapse [&_table]:table-fixed",
  "[&_td]:border [&_td]:border-border-strong [&_td]:px-3 [&_td]:py-1.5 [&_td]:align-top",
  "[&_th]:border [&_th]:border-border-strong [&_th]:bg-panel [&_th]:px-3 [&_th]:py-1.5 [&_th]:text-start [&_th]:align-top [&_th]:font-medium",
  "[&_td_p+p]:mt-0 [&_.selectedCell]:bg-orb-sky/30",
  "print:min-h-0",
].join(" ");

export function Editor({
  content,
  templates = [],
  onChange,
  onOpenContent,
  onNew,
  onDelete,
  documentControls,
  status,
}: {
  content?: Content;
  templates?: Template[];
  onChange?: (content: JSONContent) => void;
  onOpenContent?: (content: JSONContent) => void;
  onNew?: () => void;
  onDelete?: () => void;
  documentControls?: ReactNode;
  status?: ReactNode;
}) {
  const [showIsolation, setShowIsolation] = useState(false);
  const importInput = useRef<HTMLInputElement>(null);
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  });
  const editor = useEditor({
    extensions: editorExtensions(),
    enableCoreExtensions: coreExtensionOptions,
    content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => onChangeRef.current?.(editor.getJSON()),
    editorProps: { attributes: { class: pageClass } },
  });

  const [, rerender] = useReducer((n: number) => n + 1, 0);
  useEffect(() => {
    if (!editor) return;
    editor.on("transaction", rerender);
    return () => {
      editor.off("transaction", rerender);
    };
  }, [editor]);

  const pageRef = useRef<HTMLElement>(null);
  const printHeader = useRef<HTMLTableCellElement>(null);
  const printBody = useRef<HTMLTableCellElement>(null);
  const printFooter = useRef<HTMLTableCellElement>(null);
  useEffect(() => {
    if (!editor) return;
    const fill = () => {
      const fill = (cell: HTMLElement | null, nodes: Element[]) =>
        cell?.replaceChildren(...nodes.map((n) => n.cloneNode(true)));
      const parts = [...editor.view.dom.children];
      const frame = (attr: string) => [
        ...(parts.find((n) => n.hasAttribute(attr))?.children ?? []),
      ];
      fill(printHeader.current, frame("data-page-header"));
      fill(printFooter.current, frame("data-page-footer"));
      fill(
        printBody.current,
        parts.filter(
          (n) =>
            !n.hasAttribute("data-page-header") &&
            !n.hasAttribute("data-page-footer"),
        ),
      );
    };
    window.addEventListener("beforeprint", fill);
    return () => window.removeEventListener("beforeprint", fill);
  }, [editor]);

  if (!editor) return null;

  const openContent = (next: JSONContent) => {
    if (onOpenContent) {
      onOpenContent(next);
      return;
    }
    if (
      !editor.isEmpty &&
      !window.confirm("Replace the current document? It is not saved.")
    ) {
      return;
    }
    editor.chain().focus().setContent(next).run();
  };

  const fileAction = async (action: string) => {
    const stamp = new Date().toISOString().slice(0, 10);
    const json = editor.getJSON();
    if (action === "export-json") {
      const file = JSON.stringify(toDocumentFile(json), null, 2);
      download(
        new Blob([file], { type: "application/json" }),
        `document-${stamp}.json`,
      );
    } else if (action === "export-docx") {
      const { toDocxBlob } = await import("./export/docx");
      download(await toDocxBlob(json), `document-${stamp}.docx`);
    } else if (action === "print") {
      window.print();
    } else if (action === "import-json") {
      importInput.current?.click();
    } else if (action === "delete") {
      onDelete?.();
    }
  };

  const importFile = async (file: File | undefined) => {
    if (!file) return;
    try {
      openContent(parseDocumentFile(await file.text()).content);
    } catch (error) {
      window.alert((error as Error).message);
    }
  };

  return (
    <div className="min-h-screen bg-canvas print:bg-white">
      <header className="sticky top-0 z-20 border-b border-border bg-canvas/85 backdrop-blur-md print:hidden">
        <div className="mx-auto flex h-14 max-w-[1100px] items-center gap-2 px-4">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            {documentControls}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {status}
            <DropdownMenu>
              <DropdownMenuTrigger className={triggerClass}>
                File
                <Icon
                  icon={ArrowDown01Icon}
                  className="size-3.5 text-muted-foreground"
                />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60">
                <DropdownMenuItem onSelect={() => fileAction("import-json")}>
                  <Icon icon={FolderOpenIcon} />
                  Open backup
                  <DropdownMenuShortcut>.json</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => fileAction("export-json")}>
                  <Icon icon={Download01Icon} />
                  Save backup
                  <DropdownMenuShortcut>.json</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => fileAction("export-docx")}>
                  <Icon icon={Doc01Icon} />
                  Export to Word
                  <DropdownMenuShortcut>.docx</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => fileAction("print")}>
                  <Icon icon={PrinterIcon} />
                  Save as PDF
                </DropdownMenuItem>
                {onDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      variant="destructive"
                      onSelect={() => fileAction("delete")}
                    >
                      <Icon icon={Delete02Icon} />
                      Delete document
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            {onNew &&
              (templates.length > 0 ? (
                <DropdownMenu>
                  <DropdownMenuTrigger className={newClass}>
                    <Icon icon={Add01Icon} className="size-4" />
                    New
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64">
                    <DropdownMenuItem onSelect={onNew}>
                      <Icon icon={Doc01Icon} />
                      Blank document
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>From a template</DropdownMenuLabel>
                    {templates.map((t) => (
                      <DropdownMenuItem
                        key={t.id}
                        onSelect={() => openContent(t.content)}
                      >
                        <Icon icon={LicenseDraftIcon} />
                        {t.title.en}
                        <span
                          lang="dv"
                          className="ms-auto text-[15px] text-muted-foreground"
                        >
                          {t.title.dv}
                        </span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <button type="button" onClick={onNew} className={newClass}>
                  <Icon icon={Add01Icon} className="size-4" />
                  New
                </button>
              ))}
            <input
              ref={importInput}
              type="file"
              accept=".json,application/json"
              hidden
              onChange={(e) => {
                importFile(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
          </div>
        </div>
      </header>

      <div className="sticky top-14 z-10 flex justify-center px-2 pt-4 sm:px-4 print:hidden">
        <Toolbar
          editor={editor}
          showIsolation={showIsolation}
          onShowIsolation={setShowIsolation}
        />
      </div>

      <main className="px-4 pt-6 pb-24 print:p-0">
        <article
          ref={pageRef}
          className={`relative mx-auto w-full max-w-[794px] rounded-xl border border-border bg-card px-(--page-x) py-(--page-y) shadow-soft [--page-x:1.5rem] [--page-y:2.5rem] sm:[--page-x:4rem] sm:[--page-y:4rem] md:[--page-x:76px] md:[--page-y:76px] print:max-w-none print:rounded-none print:border-0 print:p-0 print:shadow-none ${
            showIsolation ? "show-runs" : ""
          }`}
        >
          <EditorContent editor={editor} className="print:hidden" />
          <PageMarks editor={editor} page={pageRef} />
          <table className="hidden w-full border-collapse print:table">
            <thead>
              <tr>
                <td ref={printHeader} className={printFrameClass("pb-[8mm]")} />
              </tr>
            </thead>
            <tfoot>
              <tr>
                <td ref={printFooter} className={printFrameClass("pt-[8mm]")} />
              </tr>
            </tfoot>
            <tbody>
              <tr>
                <td ref={printBody} className={`p-0 ${pageClass}`} />
              </tr>
            </tbody>
          </table>
        </article>
      </main>
    </div>
  );
}

const printFrameClass = (space: string) =>
  `p-0 align-top text-[14px] leading-[1.6] text-body empty:hidden ${space}`;

const newClass =
  "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-primary ps-3 pe-4 text-[14px] text-primary-foreground outline-none transition-colors hover:bg-primary-active focus-visible:ring-2 focus-visible:ring-ring data-[state=open]:bg-primary-active";

const triggerClass =
  "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-border bg-card px-3 text-[14px] whitespace-nowrap shadow-soft outline-none transition-colors hover:bg-panel focus-visible:ring-2 focus-visible:ring-ring data-[state=open]:bg-panel";
