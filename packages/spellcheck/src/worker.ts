/// <reference lib="webworker" />
import { SpellChecker } from "./checker";
import type { Request, Response } from "./speller";

declare const self: DedicatedWorkerGlobalScope;

const checker = new SpellChecker();
let ready: Promise<boolean> = Promise.resolve(false);

async function load(urls: string[]) {
  try {
    for (const url of urls) {
      const res = await fetch(url);
      if (!res.ok) return false;
      checker.load(await res.text());
    }
    return checker.size > 0;
  } catch {
    return false;
  }
}

self.onmessage = async (event: MessageEvent<Request>) => {
  const message = event.data;
  if (message.type === "load") {
    ready = load(message.urls);
    self.postMessage({ ready: await ready } satisfies Response);
    return;
  }
  const loaded = await ready;
  const result = !loaded
    ? []
    : message.type === "check"
      ? message.words.filter((w) => !checker.isCorrect(w))
      : checker.suggest(message.word);
  self.postMessage({ id: message.id, result } satisfies Response);
};
