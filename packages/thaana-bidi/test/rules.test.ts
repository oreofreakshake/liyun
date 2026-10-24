import { describe, expect, test } from "bun:test";
import { ltrRuns, paragraphDirection } from "../src";

const runText = (text: string) =>
  ltrRuns(text).map(({ start, end }) => text.slice(start, end));

describe("paragraphDirection", () => {
  test("uses the fallback when there are no letters", () => {
    expect(paragraphDirection("2026 - 10")).toBe("rtl");
    expect(paragraphDirection("", "ltr")).toBe("ltr");
  });

  test("English sentence ending in a Dhivehi word is RTL (known limit, use the toggle)", () => {
    expect(paragraphDirection("The capital is މާލެ")).toBe("rtl");
  });
});

describe("ltrRuns", () => {
  test("keeps attached symbols inside the run", () => {
    expect(runText("އަގަކީ $150 އެވެ")).toEqual(["$150"]);
    expect(runText("ބޮޑުވީ 50% އިން")).toEqual(["50%"]);
  });

  test("joins Latin words and numbers across spaces into one run", () => {
    expect(runText("ގުޅުއްވާނީ +960 333 4444 އަށް")).toEqual(["+960 333 4444"]);
  });

  test("leaves the Dhivehi sentence's final full stop outside", () => {
    expect(runText("ސޮފްޓްވެއާ: Microsoft Word, Google Docs.")).toEqual([
      "Microsoft Word, Google Docs",
    ]);
  });

  test("a Thaana word splits runs", () => {
    expect(runText("HRCM އިން MMA އަށް")).toEqual(["HRCM", "MMA"]);
  });
});
