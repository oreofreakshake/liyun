import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { encodeLexicon, isWellFormed, levelOf } from "../src";

const MIN_COUNT = 5;
const MIN_SITES = 3;

const root = join(import.meta.dir, "../../..");
const source = join(import.meta.dir, "../data/words.tsv");
const target = join(root, "public/spellcheck/dv.txt");

const file = Bun.file(source);
if (!(await file.exists())) {
  console.error(
    `Missing ${source}. The word counts are private; ask a maintainer.`,
  );
  process.exit(1);
}

const entries: [string, number][] = [];
let skipped = 0;
for (const line of (await file.text()).split("\n").slice(1)) {
  const [word, count, , sites] = line.split("\t");
  if (!word || Number(count) < MIN_COUNT || Number(sites) < MIN_SITES) continue;
  if (!isWellFormed(word)) {
    skipped++;
    continue;
  }
  entries.push([word, levelOf(Number(count))]);
}

await mkdir(join(root, "public/spellcheck"), { recursive: true });
const lexicon = encodeLexicon(entries);
await Bun.write(target, lexicon);
const bytes = new TextEncoder().encode(lexicon);
const mb = (n: number) => `${(n / 1024 / 1024).toFixed(1)} MB`;
console.log(
  `${entries.length.toLocaleString()} words (${skipped} malformed skipped) → ${target}`,
);
console.log(`${mb(bytes.length)}, ${mb(Bun.gzipSync(bytes).length)} gzipped`);
