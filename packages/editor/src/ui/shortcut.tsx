"use client";

import { Fragment, useSyncExternalStore } from "react";
import { Kbd, KbdGroup } from "./kbd";

type Key = "mod" | "alt" | "shift" | "enter" | (string & {});

// macOS writes modifiers as symbols in a fixed order, e.g. ⌥⇧⌘S.
const macSymbols: Record<string, string> = {
  alt: "⌥",
  shift: "⇧",
  mod: "⌘",
  enter: "↩",
};
const macOrder = ["alt", "shift", "mod"];
const words: Record<string, string> = {
  mod: "Ctrl",
  alt: "Alt",
  shift: "Shift",
  enter: "Enter",
};

export const isMacPlatform = () => /Mac|iPhone|iPad/.test(navigator.platform);

// Server renders and the first client render use the non-Mac labels.
export function useIsMac() {
  return useSyncExternalStore(
    () => () => {},
    isMacPlatform,
    () => false,
  );
}

function useKeys() {
  const mac = useIsMac();
  return (keys: Key[]) => {
    if (!mac) return keys.map((k) => words[k] ?? k);
    const rank = (k: Key) => {
      const i = macOrder.indexOf(k);
      return i === -1 ? macOrder.length : i;
    };
    return [...keys]
      .sort((a, b) => rank(a) - rank(b))
      .map((k) => macSymbols[k] ?? k);
  };
}

/** Shortcut text for menus: ⇧⌘S on macOS, Ctrl+Shift+S elsewhere. */
export function useShortcutText() {
  const mac = useIsMac();
  const labels = useKeys();
  return (keys: Key[]) => labels(keys).join(mac ? "" : "+");
}

// Flat, muted keys after shadcn's Kbd, lighter than the bordered key caps.
const flatKey =
  "h-5 min-w-5 border-0 bg-muted px-1 text-xs text-muted-foreground shadow-none";

/** Shortcut as keys: ⌥ ⇧ on macOS, Alt + Shift elsewhere. */
export function Shortcut({ keys }: { keys: Key[] }) {
  const mac = useIsMac();
  const labels = useKeys()(keys);
  return (
    <KbdGroup>
      {labels.map((label, i) => (
        <Fragment key={label}>
          {i > 0 && !mac && <span>+</span>}
          <Kbd className={flatKey}>{label}</Kbd>
        </Fragment>
      ))}
    </KbdGroup>
  );
}
