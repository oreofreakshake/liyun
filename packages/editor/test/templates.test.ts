import "./dom";
import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  buildTemplate,
  serialize,
  templateEntries,
  templatesDir,
} from "../scripts/templates";

test.each(
  templateEntries(),
)("template $id: JSON is up to date with its source (run: bun run templates)", (entry) => {
  const committed = readFileSync(
    join(templatesDir, `${entry.id}.json`),
    "utf8",
  );
  expect(committed).toBe(serialize(buildTemplate(entry)));
});
