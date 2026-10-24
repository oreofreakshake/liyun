"use client";

import {
  Add01Icon,
  ArrowDown01Icon,
  Delete02Icon,
  Doc01Icon,
  Download01Icon,
  FolderOpenIcon,
  HighlighterIcon,
  KeyboardIcon,
  LicenseDraftIcon,
  PrinterIcon,
  TextBoldIcon,
  TextItalicIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import type { Content, JSONContent } from "@tiptap/core";
import { EditorContent, useEditor } from "@tiptap/react";
import { type ReactNode, useEffect, useReducer, useRef, useState } from "react";
import type { Template } from "./document";
import { download, parseDocumentFile, toDocumentFile } from "./export/file";
import { coreExtensionOptions, editorExtensions } from "./extensions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Kbd, KbdGroup } from "./ui/kbd";
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group";

type DirectionMode = "auto" | "rtl" | "ltr";

const pageClass = [
  "min-h-[calc(1123px-12rem)] text-[17px] leading-[1.85] tracking-normal outline-none",
  "[&_h1]:text-[36px] [&_h1]:leading-[1.25] [&_h1]:mb-6",
  "[&_h2]:text-[28px] [&_h2]:leading-[1.3] [&_h2]:mb-4",
  "[&_h3]:text-[22px] [&_h3]:leading-[1.4] [&_h3]:mt-6 [&_h3]:mb-2",
  "[&_p+p]:mt-3 [&_ol]:list-decimal [&_ol]:ps-6 [&_ul]:list-disc [&_ul]:ps-6 [&_li+li]:mt-1",
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

  if (!editor) return null;

  const block = editor.state.selection.$from.parent;
  const mode = (
    block.attrs.dirLocked ? block.attrs.dir : "auto"
  ) as DirectionMode;
  const resolved = block.attrs.dir as string | null;
  const layout = editor.storage.thaanaKeyboard.layout;

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
              <DropdownMenuTrigger className={triggerClass(true)}>
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
                  Print or save as PDF
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
            {onNew && (
              <button
                type="button"
                onClick={onNew}
                className="inline-flex h-9 items-center gap-1.5 rounded-full bg-primary ps-3 pe-4 text-[14px] text-primary-foreground transition-colors hover:bg-primary-active"
              >
                <Icon icon={Add01Icon} className="size-4" />
                New
              </button>
            )}
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
        <div className="no-scrollbar flex max-w-full items-center gap-1 overflow-x-auto rounded-full border border-border bg-card p-1 shadow-soft">
          <ToolButton
            label="Bold"
            pressed={editor.isActive("bold")}
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <Icon icon={TextBoldIcon} />
          </ToolButton>
          <ToolButton
            label="Italic"
            pressed={editor.isActive("italic")}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <Icon icon={TextItalicIcon} />
          </ToolButton>

          <Divider />

          <ToggleGroup
            type="single"
            aria-label="Paragraph direction"
            value={mode}
            onValueChange={(m) => {
              if (m)
                editor
                  .chain()
                  .focus()
                  .setParagraphDirection(m as DirectionMode)
                  .run();
            }}
          >
            {(["auto", "rtl", "ltr"] as const).map((m) => (
              <ToggleGroupItem
                key={m}
                className="px-2 sm:px-3"
                value={m}
                title={
                  m === "auto"
                    ? "Direction from content"
                    : `Always ${m.toUpperCase()}`
                }
              >
                {m === "auto"
                  ? `Auto · ${resolved?.toUpperCase() ?? "–"}`
                  : m.toUpperCase()}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>

          <Divider />

          <DropdownMenu>
            <DropdownMenuTrigger
              className={triggerClass(false)}
              aria-label={`Keyboard: ${layout ? "Thaana" : "English"}`}
            >
              <Icon icon={KeyboardIcon} />
              <span className="hidden sm:inline">
                {layout ? "Thaana" : "English"}
              </span>
              <Icon
                icon={ArrowDown01Icon}
                className="hidden size-3.5 text-muted-foreground sm:block"
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-56">
              <DropdownMenuLabel>Keyboard</DropdownMenuLabel>
              <DropdownMenuRadioGroup
                value={layout ? "thaana" : "english"}
                onValueChange={(v) =>
                  editor
                    .chain()
                    .focus()
                    .setKeyboardLayout(v === "thaana" ? "phonetic" : null)
                    .run()
                }
              >
                <DropdownMenuRadioItem value="thaana">
                  Thaana
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="english">
                  English
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
              <DropdownMenuSeparator />
              <p className="flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] text-muted-foreground">
                <KbdGroup>
                  <Kbd>Alt</Kbd>
                  <span>+</span>
                  <Kbd>Shift</Kbd>
                </KbdGroup>
                to switch
              </p>
            </DropdownMenuContent>
          </DropdownMenu>

          {templates.length > 0 && (
            <>
              <Divider />
              <DropdownMenu>
                <DropdownMenuTrigger className={triggerClass(false)}>
                  <Icon icon={LicenseDraftIcon} />
                  <span className="hidden sm:inline">Templates</span>
                  <Icon
                    icon={ArrowDown01Icon}
                    className="hidden size-3.5 text-muted-foreground sm:block"
                  />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-64">
                  <DropdownMenuLabel>New from template</DropdownMenuLabel>
                  {templates.map((t) => (
                    <DropdownMenuItem
                      key={t.id}
                      onSelect={() => openContent(t.content)}
                    >
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
            </>
          )}

          <Divider />

          <ToolButton
            label="Highlight protected text (English and numbers Liyun keeps in place)"
            pressed={showIsolation}
            onClick={() => setShowIsolation(!showIsolation)}
          >
            <Icon icon={HighlighterIcon} />
          </ToolButton>
        </div>
      </div>

      <main className="px-4 pt-6 pb-24 print:p-0">
        <article
          className={`mx-auto w-full max-w-[794px] rounded-xl border border-border bg-card px-6 py-10 shadow-soft sm:px-16 sm:py-16 md:px-24 md:py-20 print:max-w-none print:rounded-none print:border-0 print:p-0 print:shadow-none ${
            showIsolation
              ? "[&_bdi]:rounded-md [&_bdi]:bg-orb-sky/40 [&_bdi]:px-0.5 [&_bdi]:[box-decoration-break:clone]"
              : ""
          }`}
        >
          <EditorContent editor={editor} />
        </article>
      </main>
    </div>
  );
}

function Icon({
  icon,
  className = "size-[18px]",
}: {
  icon: IconSvgElement;
  className?: string;
}) {
  return (
    <HugeiconsIcon
      icon={icon}
      strokeWidth={1.6}
      className={className}
      aria-hidden="true"
    />
  );
}

const triggerClass = (outlined: boolean) =>
  `inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3 text-[14px] whitespace-nowrap transition-colors outline-none hover:bg-panel focus-visible:ring-2 focus-visible:ring-ring data-[state=open]:bg-panel ${
    outlined
      ? "border border-border bg-card shadow-soft"
      : "h-8 px-2 text-[13px] text-body sm:px-3"
  }`;

function Divider() {
  return (
    <span
      aria-hidden
      className="mx-1 hidden h-5 w-px shrink-0 bg-border sm:block"
    />
  );
}

function ToolButton({
  label,
  pressed,
  onClick,
  wide,
  children,
}: {
  label: string;
  pressed: boolean;
  onClick: () => void;
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={pressed}
      onClick={onClick}
      className={`inline-flex h-8 shrink-0 items-center justify-center rounded-full text-[13px] whitespace-nowrap text-body transition-colors hover:bg-panel aria-pressed:bg-primary aria-pressed:text-primary-foreground ${
        wide ? "px-3" : "w-8"
      }`}
    >
      {children}
    </button>
  );
}
