"use client";

import {
  Alert02Icon,
  ArrowDown01Icon,
  CloudSavingDoneIcon,
  Loading03Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  DOCUMENT_VERSION,
  Editor,
  htmlToContent,
  type JSONContent,
  titleOf,
} from "editor";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "editor/ui/dropdown-menu";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { DocumentMeta, StoredDocument } from "store";
import { LogoMark } from "@/components/logo";
import { documentStore, fallBackToMemory, isPersistent } from "@/store";
import { templates } from "@/templates";

type SaveState = "saved" | "saving" | "error";

const AUTOSAVE_MS = 600;

export function Workspace({ demoHtml }: { demoHtml: string }) {
  const [docs, setDocs] = useState<DocumentMeta[]>([]);
  const [current, setCurrent] = useState<StoredDocument | null>(null);
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const pending = useRef<{ id: string; content: JSONContent } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const started = useRef(false);

  const refreshList = useCallback(async () => {
    setDocs(await documentStore().list());
  }, []);

  const flush = useCallback(async () => {
    clearTimeout(timer.current);
    const edit = pending.current;
    if (!edit) return;
    pending.current = null;
    setSaveState("saving");
    try {
      await documentStore().save({
        id: edit.id,
        title: titleOf(edit.content),
        file: { version: DOCUMENT_VERSION, content: edit.content },
      });
      setSaveState("saved");
      await refreshList();
    } catch {
      setSaveState("error");
    }
  }, [refreshList]);

  const create = useCallback(
    async (content: JSONContent) => {
      await flush();
      const file = { version: DOCUMENT_VERSION, content } as const;
      const meta = await documentStore().save({
        title: titleOf(content),
        file,
      });
      await refreshList();
      setCurrent({ ...meta, file });
    },
    [flush, refreshList],
  );

  const open = useCallback(
    async (id: string) => {
      await flush();
      setCurrent(await documentStore().open(id));
    },
    [flush],
  );

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    (async () => {
      navigator.storage?.persist?.();
      let list: DocumentMeta[];
      try {
        list = await documentStore().list();
      } catch {
        fallBackToMemory();
        list = [];
      }
      setDocs(list);
      if (list[0]) setCurrent(await documentStore().open(list[0].id));
      else await create(htmlToContent(demoHtml));
    })();
  }, [create, demoHtml]);

  useEffect(() => {
    const save = () => void flush();
    window.addEventListener("pagehide", save);
    document.addEventListener("visibilitychange", save);
    return () => {
      window.removeEventListener("pagehide", save);
      document.removeEventListener("visibilitychange", save);
    };
  }, [flush]);

  const onChange = (content: JSONContent) => {
    if (!current) return;
    pending.current = { id: current.id, content };
    setSaveState("saving");
    clearTimeout(timer.current);
    timer.current = setTimeout(flush, AUTOSAVE_MS);
  };

  const remove = async () => {
    if (!current) return;
    if (!window.confirm("Delete this document? This cannot be undone.")) return;
    pending.current = null;
    clearTimeout(timer.current);
    await documentStore().remove(current.id);
    const list = await documentStore().list();
    setDocs(list);
    if (list[0]) setCurrent(await documentStore().open(list[0].id));
    else await create({ type: "doc", content: [] });
  };

  if (!current) return null;

  const statusText = !isPersistent()
    ? "Not saved: this browser blocks storage"
    : saveState === "error"
      ? "Not saved. Use File, Save backup"
      : saveState === "saving"
        ? "Saving"
        : "Saved";

  const documentControls = (
    <>
      <Link href="/" aria-label="Liyun home" className="shrink-0 px-1">
        <LogoMark className="h-7 w-auto" />
      </Link>
      <span
        aria-hidden
        className="hidden h-5 w-px shrink-0 bg-border sm:block"
      />
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label="Open document"
          className="inline-flex h-9 min-w-0 items-center gap-1.5 rounded-full px-3 text-[15px] outline-none transition-colors hover:bg-panel focus-visible:ring-2 focus-visible:ring-ring data-[state=open]:bg-panel"
        >
          <span dir="auto" className="truncate">
            {current.title || "Untitled"}
          </span>
          <HugeiconsIcon
            icon={ArrowDown01Icon}
            strokeWidth={1.6}
            className="size-3.5 shrink-0 text-muted-foreground"
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-72">
          <DropdownMenuLabel>Your documents</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={current.id} onValueChange={open}>
            {docs.map((d) => (
              <DropdownMenuRadioItem key={d.id} value={d.id}>
                <span dir="auto" className="truncate">
                  {d.title || "Untitled"}
                </span>
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );

  const failed = saveState === "error" || !isPersistent();
  const status = (
    <span
      title={statusText}
      className="flex size-9 items-center justify-center text-muted-foreground"
    >
      <HugeiconsIcon
        aria-hidden="true"
        icon={
          failed
            ? Alert02Icon
            : saveState === "saving"
              ? Loading03Icon
              : CloudSavingDoneIcon
        }
        strokeWidth={1.6}
        className={`size-[18px] ${failed ? "text-destructive" : ""} ${
          saveState === "saving"
            ? "animate-spin motion-reduce:animate-none"
            : ""
        }`}
      />
      <span className="sr-only" aria-live="polite">
        {statusText}
      </span>
    </span>
  );

  return (
    <Editor
      key={current.id}
      content={current.file.content}
      templates={templates}
      onChange={onChange}
      onOpenContent={create}
      onNew={() => create({ type: "doc", content: [] })}
      onDelete={remove}
      documentControls={documentControls}
      status={status}
    />
  );
}
