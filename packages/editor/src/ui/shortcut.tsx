"use client";

import { Fragment, useSyncExternalStore } from "react";
import { Kbd, KbdGroup } from "./kbd";

type Key = "mod" | "alt" | "shift" | "enter" | (string & {});

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

export function useShortcutText() {
  const mac = useIsMac();
  const labels = useKeys();
  return (keys: Key[]) => labels(keys).join(mac ? "" : "+");
}

const flatKey =
  "h-5 min-w-5 border-0 bg-muted px-1 text-xs text-muted-foreground shadow-none";

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
