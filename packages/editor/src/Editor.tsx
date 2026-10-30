"use client";

import {
  Add01Icon,
  ArrowDown01Icon,
  Delete02Icon,
  Doc01Icon,
  FloppyDiskIcon,
  FolderOpenIcon,
  LicenseDraftIcon,
  PrinterIcon,
} from "@hugeicons/core-free-icons";
import type { Content, JSONContent } from "@tiptap/core";
import { EditorContent, useEditor } from "@tiptap/react";
import { type ReactNode, useEffect, useReducer, useRef, useState } from "react";
import { createSpeller } from "spellcheck/client";
import type { Template } from "./document";
import { download, safeFileName, toDocumentFile } from "./export/file";
import { coreExtensionOptions, editorExtensions } from "./extensions";
import {
  DOCUMENT_EXTENSION,
  type OpenSource,
  openAccept,
  openFilters,
  readDocument,
  splitFileName,
} from "./import/file";
import {
  baseName,
  isTauri,
  openNative,
  print,
  saveNative,
  writePath,
} from "./native";
import { PageSheets } from "./page-sheets";
import { PAGE_GAP, PAGE_HEIGHT, Pagination, paginationKey } from "./pagination";
import { SpellMenu } from "./spell-menu";
import { Spellcheck } from "./spellcheck";
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
import { isMacPlatform, useShortcutText } from "./ui/shortcut";

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

let speller: ReturnType<typeof createSpeller> | undefined;
const getSpeller = () => {
  speller ??= createSpeller();
  return speller;
};

const DICTIONARY_KEY = "liyun:dictionary";
const personalDictionary = {
  load(): string[] {
    try {
      return JSON.parse(localStorage.getItem(DICTIONARY_KEY) ?? "[]");
    } catch {
      return [];
    }
  },
  save(words: string[]) {
    try {
      localStorage.setItem(DICTIONARY_KEY, JSON.stringify(words));
    } catch {}
  },
};

export function Editor({
  content,
  templates = [],
  onChange,
  onOpenContent,
  onNew,
  onDelete,
  documentControls,
  status,
  fileName,
  filePath,
  onSaved,
}: {
  content?: Content;
  templates?: Template[];
  onChange?: (content: JSONContent) => void;
  onOpenContent?: (content: JSONContent, source?: OpenSource) => void;
  onNew?: () => void;
  onDelete?: () => void;
  documentControls?: ReactNode;
  status?: ReactNode;
  fileName?: string;
  filePath?: string;
  onSaved?: (source: OpenSource) => void;
}) {
  const [showIsolation, setShowIsolation] = useState(false);
  const shortcut = useShortcutText();
  const runRef = useRef<(action: string) => void>(() => {});
  useEffect(() => {
    const actions: Record<string, string> = {
      KeyO: "open",
      KeyS: "save",
      KeyP: "print",
    };
    const onKeyDown = (e: KeyboardEvent) => {
      const mod = isMacPlatform() ? e.metaKey : e.ctrlKey;
      const action = actions[e.code];
      if (!mod || e.altKey || !action) return;
      e.preventDefault();
      runRef.current(action === "save" && e.shiftKey ? "save-as" : action);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
  const importInput = useRef<HTMLInputElement>(null);
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  });
  const editor = useEditor({
    extensions: [
      ...editorExtensions(),
      Pagination,
      Spellcheck.configure({
        speller: getSpeller(),
        personal: personalDictionary,
      }),
    ],
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

  const printHeader = useRef<HTMLTableCellElement>(null);
  const printBody = useRef<HTMLTableCellElement>(null);
  const printFooter = useRef<HTMLTableCellElement>(null);
  useEffect(() => {
    if (!editor) return;
    const fill = () => {
      const fill = (cell: HTMLElement | null, nodes: Element[]) =>
        cell?.replaceChildren(...nodes.map((n) => n.cloneNode(true)));
      const parts = [...editor.view.dom.children].filter(
        (n) => !n.hasAttribute("data-page-gap"),
      );
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

  const pagination = paginationKey.getState(editor.state);
  const paged = pagination?.active ?? false;
  const pages = pagination?.pages ?? 1;

  const openContent = (next: JSONContent, source?: OpenSource) => {
    if (onOpenContent) {
      onOpenContent(next, source);
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

  const openFile = async (
    fileName: string,
    data: ArrayBuffer,
    path?: string,
  ) => {
    try {
      const { content, source } = await readDocument(fileName, data, path);
      openContent(content, source);
    } catch (error) {
      window.alert((error as Error).message);
    }
  };

  const fileAction = async (action: string) => {
    const stamp = new Date().toISOString().slice(0, 10);
    const base = safeFileName(fileName ?? "") || `document-${stamp}`;
    const json = editor.getJSON();
    const liyunFile = () =>
      new Blob([JSON.stringify(toDocumentFile(json), null, 2)], {
        type: "application/json",
      });
    if (action === "open") {
      if (!isTauri()) return importInput.current?.click();
      const file = await openNative(openFilters);
      if (file) await openFile(file.fileName, file.data, file.path);
    } else if (action === "save" && isTauri() && filePath) {
      await writePath(filePath, liyunFile());
    } else if (action === "save" || action === "save-as") {
      const name = `${base}.${DOCUMENT_EXTENSION}`;
      if (!isTauri()) return download(liyunFile(), name);
      const path = await saveNative(liyunFile(), name);
      if (path) {
        onSaved?.({ name: splitFileName(baseName(path)).stem, path });
      }
    } else if (action === "export-docx") {
      const { toDocxBlob } = await import("./export/docx");
      await download(await toDocxBlob(json), `${base}.docx`);
    } else if (action === "print") {
      await print();
    } else if (action === "delete") {
      onDelete?.();
    }
  };

  const run = (action: string) =>
    fileAction(action).catch((error) =>
      window.alert(
        `Something went wrong: ${(error as Error).message ?? error}`,
      ),
    );
  runRef.current = run;

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
                <DropdownMenuItem onSelect={() => run("open")}>
                  <Icon icon={FolderOpenIcon} />
                  Open…
                  <DropdownMenuShortcut>
                    {shortcut(["mod", "O"])}
                  </DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => run("save")}>
                  <Icon icon={FloppyDiskIcon} />
                  {isTauri() ? "Save" : "Download"}
                  <DropdownMenuShortcut>
                    {shortcut(["mod", "S"])}
                  </DropdownMenuShortcut>
                </DropdownMenuItem>
                {isTauri() && (
                  <DropdownMenuItem onSelect={() => run("save-as")}>
                    <Icon icon={FloppyDiskIcon} />
                    Save As…
                    <DropdownMenuShortcut>
                      {shortcut(["mod", "shift", "S"])}
                    </DropdownMenuShortcut>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => run("export-docx")}>
                  <Icon icon={Doc01Icon} />
                  Export to Word
                  <DropdownMenuShortcut>.docx</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => run("print")}>
                  <Icon icon={PrinterIcon} />
                  Save as PDF
                  <DropdownMenuShortcut>
                    {shortcut(["mod", "P"])}
                  </DropdownMenuShortcut>
                </DropdownMenuItem>
                {onDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      variant="destructive"
                      onSelect={() => run("delete")}
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
              accept={openAccept}
              hidden
              onChange={async (e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (file) await openFile(file.name, await file.arrayBuffer());
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
          style={
            paged
              ? { minHeight: pages * (PAGE_HEIGHT + PAGE_GAP) - PAGE_GAP }
              : undefined
          }
          className={`relative isolate mx-auto w-full max-w-[794px] rounded-xl px-(--page-x) py-(--page-y) [--page-x:1.5rem] [--page-y:2.5rem] sm:[--page-x:4rem] sm:[--page-y:4rem] md:[--page-x:76px] md:[--page-y:76px] print:max-w-none print:rounded-none print:border-0 print:p-0 print:shadow-none ${
            paged ? "" : "border border-border bg-card shadow-soft"
          } ${showIsolation ? "show-runs" : ""}`}
        >
          <EditorContent editor={editor} className="print:hidden" />
          {speller && <SpellMenu editor={editor} speller={speller} />}
          {paged && <PageSheets pages={pages} />}
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
