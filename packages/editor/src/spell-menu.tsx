"use client";

import { BookOpen01Icon, ViewOffSlashIcon } from "@hugeicons/core-free-icons";
import type { Editor } from "@tiptap/core";
import { useEffect, useState } from "react";
import type { Speller } from "spellcheck";
import { misspellingAt } from "./spellcheck";
import { Icon } from "./toolbar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

type Menu = {
  from: number;
  to: number;
  word: string;
  x: number;
  y: number;
  suggestions: string[] | null;
};

export function SpellMenu({
  editor,
  speller,
}: {
  editor: Editor;
  speller: Speller;
}) {
  const [menu, setMenu] = useState<Menu | null>(null);

  useEffect(() => {
    const dom = editor.view.dom;
    const onContextMenu = (event: MouseEvent) => {
      if (!(event.target as HTMLElement).closest(".spelling-error")) return;
      const at = editor.view.posAtCoords({
        left: event.clientX,
        top: event.clientY,
      });
      const found = at && misspellingAt(editor.state, at.pos);
      if (!found) return;
      event.preventDefault();
      setMenu({
        ...found,
        x: event.clientX,
        y: event.clientY,
        suggestions: null,
      });
      speller
        .suggest(found.word)
        .then((suggestions) =>
          setMenu((m) => (m?.from === found.from ? { ...m, suggestions } : m)),
        );
    };
    dom.addEventListener("contextmenu", onContextMenu);
    return () => dom.removeEventListener("contextmenu", onContextMenu);
  }, [editor, speller]);

  const replace = (text: string) => {
    if (!menu) return;
    const { view } = editor;
    view.dispatch(view.state.tr.insertText(text, menu.from, menu.to));
    view.focus();
  };

  return (
    <DropdownMenu
      open={menu !== null}
      onOpenChange={(open) => !open && setMenu(null)}
    >
      <DropdownMenuTrigger
        aria-hidden
        tabIndex={-1}
        className="pointer-events-none fixed size-0"
        style={{ left: menu?.x, top: menu?.y }}
      />
      <DropdownMenuContent align="start" className="w-56">
        {menu?.suggestions === null && (
          <DropdownMenuLabel>Finding suggestions…</DropdownMenuLabel>
        )}
        {menu?.suggestions?.length === 0 && (
          <DropdownMenuLabel>No suggestions</DropdownMenuLabel>
        )}
        {menu?.suggestions?.map((s) => (
          <DropdownMenuItem
            key={s}
            lang="dv"
            dir="rtl"
            className="text-[16px]"
            onSelect={() => replace(s)}
          >
            {s}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => menu && editor.commands.addToDictionary(menu.word)}
        >
          <Icon icon={BookOpen01Icon} />
          Add to dictionary
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => menu && editor.commands.ignoreWord(menu.word)}
        >
          <Icon icon={ViewOffSlashIcon} />
          Ignore
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
