import type { Request, Response, Speller } from "./speller";

export const LEXICON_URLS = ["/spellcheck/dv.txt"];

export function createSpeller(urls = LEXICON_URLS): Speller | null {
  if (typeof Worker === "undefined") return null;
  const worker = new Worker(new URL("./worker.ts", import.meta.url), {
    type: "module",
  });
  const pending = new Map<number, (result: string[]) => void>();
  let next = 0;
  let failed = false;
  let loaded: (ok: boolean) => void = () => {};
  const ready = new Promise<boolean>((resolve) => {
    loaded = resolve;
  });
  worker.onmessage = (event: MessageEvent<Response>) => {
    const data = event.data;
    if ("ready" in data) return loaded(data.ready);
    pending.get(data.id)?.(data.result);
    pending.delete(data.id);
  };
  worker.onerror = () => {
    failed = true;
    loaded(false);
    for (const resolve of pending.values()) resolve([]);
    pending.clear();
  };
  const ask = (
    message:
      | { type: "check"; words: string[] }
      | { type: "suggest"; word: string },
  ) =>
    new Promise<string[]>((resolve) => {
      if (failed) return resolve([]);
      const id = next++;
      pending.set(id, resolve);
      worker.postMessage({ ...message, id });
    });
  worker.postMessage({ type: "load", urls } satisfies Request);
  return {
    check: (words) => ask({ type: "check", words }),
    suggest: (word) => ask({ type: "suggest", word }),
    ready,
  };
}
