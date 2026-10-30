import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HEADER = "liyun-lexicon 1";
const root = join(dirname(fileURLToPath(import.meta.url)), "../../..");
const target = join(root, "public/spellcheck/dv.txt");
const url = process.env.LIYUN_LEXICON_URL;
const token = process.env.LIYUN_LEXICON_TOKEN;

if (existsSync(target)) {
  console.log("spellcheck: using the local word list");
} else if (!url) {
  console.warn(
    "spellcheck: LIYUN_LEXICON_URL is not set; building without spell checking",
  );
} else {
  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  const text = res.ok ? await res.text() : "";
  if (!text.startsWith(HEADER)) {
    console.error(
      `spellcheck: could not download the word list (HTTP ${res.status})`,
    );
    process.exit(1);
  }
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, text);
  console.log(
    `spellcheck: downloaded the word list (${(Buffer.byteLength(text) / 1024 / 1024).toFixed(1)} MB)`,
  );
}
