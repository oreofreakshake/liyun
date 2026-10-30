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
  isTauri,
  type JSONContent,
  type OpenSource,
  onOpenedFiles,
  readDocument,
  setDocumentTitle,
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
import {
  type DocumentMeta,
  type DocumentPatch,
  displayName,
  type StoredDocument,
} from "store";
import { LogoMark } from "@/components/logo";
import { documentStore, fallBackToMemory, isPersistent } from "@/store";
import { templates } from "@/templates";

type SaveState = "saved" | "saving" | "error";

const AUTOSAVE_MS = 600;

function NameField({
  name,
  placeholder,
  onRename,
}: {
  name: string;
  placeholder: string;
  onRename: (name: string) => void;
}) {
  const [draft, setDraft] = useState(name);
  const commit = () => {
    const next = draft.trim();
    setDraft(next);
    if (next !== name) onRename(next);
  };
  return (
    <input
      aria-label="Document name"
      dir="auto"
      value={draft}
      placeholder={placeholder}
      size={Math.max(1, (draft || placeholder).length)}
      spellCheck={false}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") e.currentTarget.blur();
        if (e.key === "Escape") {
          setDraft(name);
          requestAnimationFrame(() => e.currentTarget?.blur());
        }
      }}
      className="h-9 min-w-0 max-w-[min(28rem,100%)] truncate rounded-full bg-transparent px-3 text-[15px] outline-none field-sizing-content placeholder:text-foreground transition-colors hover:bg-panel focus:bg-panel focus-visible:ring-2 focus-visible:ring-ring"
    />
  );
}

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
      const title = titleOf(edit.content);
      await documentStore().save({
        id: edit.id,
        title,
        file: { version: DOCUMENT_VERSION, content: edit.content },
      });
      setCurrent((doc) => (doc?.id === edit.id ? { ...doc, title } : doc));
      setSaveState("saved");
      await refreshList();
    } catch {
      setSaveState("error");
    }
  }, [refreshList]);

  const create = useCallback(
    async (content: JSONContent, source?: OpenSource) => {
      await flush();
      const store = documentStore();
      const linked = source?.path
        ? (await store.list()).find((d) => d.path === source.path)
        : undefined;
      if (linked) {
        setCurrent(await store.open(linked.id));
        return;
      }
      const file = { version: DOCUMENT_VERSION, content } as const;
      let meta = await store.save({ title: titleOf(content), file });
      if (source) {
        await store.update(meta.id, source);
        meta = { ...meta, name: source.name, path: source.path };
      }
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

  useEffect(
    () =>
      onOpenedFiles(async ({ fileName, data, path }) => {
        try {
          const { content, source } = await readDocument(fileName, data, path);
          await create(content, source);
        } catch (error) {
          window.alert((error as Error).message);
        }
      }),
    [create],
  );

  const update = async (patch: DocumentPatch) => {
    if (!current) return;
    const id = current.id;
    try {
      await documentStore().update(id, patch);
    } catch {
      setSaveState("error");
      return;
    }
    setCurrent((doc) =>
      doc?.id === id
        ? {
            ...doc,
            ...Object.fromEntries(
              Object.entries(patch).map(([k, v]) => [k, v || undefined]),
            ),
          }
        : doc,
    );
    await refreshList();
  };

  const name = current ? displayName(current) : "";
  useEffect(() => {
    if (name) setDocumentTitle(name).catch(() => {});
  }, [name]);

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
      ? "Not saved here. Save a copy from the File menu"
      : saveState === "saving"
        ? "Saving"
        : "Saved";

  const documentControls = (
    <>
      {isTauri() ? (
        <span className="shrink-0 px-1">
          <LogoMark className="h-7 w-auto" />
        </span>
      ) : (
        <Link href="/" aria-label="Liyun home" className="shrink-0 px-1">
          <LogoMark className="h-7 w-auto" />
        </Link>
      )}
      <span
        aria-hidden
        className="hidden h-5 w-px shrink-0 bg-border sm:block"
      />
      <NameField
        key={`${current.id}:${current.name}`}
        name={current.name ?? ""}
        placeholder={current.title || "Untitled"}
        onRename={(name) => update({ name })}
      />
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label="Your documents"
          className="-ms-1 inline-flex size-8 shrink-0 items-center justify-center rounded-full outline-none transition-colors hover:bg-panel focus-visible:ring-2 focus-visible:ring-ring data-[state=open]:bg-panel"
        >
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
                  {displayName(d)}
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
      fileName={name}
      filePath={current.path}
      onSaved={update}
    />
  );
}
