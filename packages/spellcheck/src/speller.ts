export type Speller = {
  check(words: string[]): Promise<string[]>;
  suggest(word: string): Promise<string[]>;
  ready: Promise<boolean>;
};

export type Request =
  | { type: "load"; urls: string[] }
  | { type: "check"; id: number; words: string[] }
  | { type: "suggest"; id: number; word: string };

export type Response = { id: number; result: string[] } | { ready: boolean };
