import type { JSONContent } from "@tiptap/core";
import {
  AlignmentType,
  Document,
  Footer,
  Header,
  HeadingLevel,
  LevelFormat,
  Packer,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";
import { familyOf } from "../fonts";

export type DocxOptions = {
  thaanaFont: string;
};

export const defaultDocxOptions: DocxOptions = { thaanaFont: "Faruma" };

const frameParts = ["pageHeader", "pageFooter"];

const LRM = String.fromCodePoint(0x200e);

const bodySize = 24;
const headingSize: Record<number, number> = { 1: 48, 2: 36, 3: 30 };
const headingLevel = {
  1: HeadingLevel.HEADING_1,
  2: HeadingLevel.HEADING_2,
  3: HeadingLevel.HEADING_3,
} as const;

const alignment = {
  center: AlignmentType.CENTER,
  end: AlignmentType.END,
  justify: AlignmentType.BOTH,
} as const;

type Context = {
  options: DocxOptions;
  list?: { reference: "ordered" | "bullet"; instance: number; level: number };
  nextListInstance: () => number;
};

export function toDocx(content: JSONContent, options = defaultDocxOptions) {
  let instance = 0;
  const ctx: Context = { options, nextListInstance: () => ++instance };
  const nodes = content.content ?? [];
  const body = nodes.filter((n) => !frameParts.includes(n.type ?? ""));
  const frame = (part: string) => {
    const node = nodes.find((n) => n.type === part);
    return node && (node.content ?? []).flatMap((n) => blocks(n, ctx));
  };

  return new Document({
    styles: {
      default: {
        document: {
          run: { size: bodySize, font: { cs: options.thaanaFont } },
        },
      },
    },
    numbering: {
      config: [
        {
          reference: "ordered",
          levels: [0, 1, 2].map((level) => ({
            level,
            format: LevelFormat.DECIMAL,
            text: `%${level + 1}.`,
            alignment: AlignmentType.START,
          })),
        },
        {
          reference: "bullet",
          levels: [0, 1, 2].map((level) => ({
            level,
            format: LevelFormat.BULLET,
            text: "•",
            alignment: AlignmentType.START,
          })),
        },
      ],
    },
    sections: [
      {
        headers: frame("pageHeader") && {
          default: new Header({ children: frame("pageHeader") ?? [] }),
        },
        footers: frame("pageFooter") && {
          default: new Footer({ children: frame("pageFooter") ?? [] }),
        },
        children: body.flatMap((n) => blocks(n, ctx)),
      },
    ],
  });
}

export function toDocxBlob(content: JSONContent, options?: DocxOptions) {
  return Packer.toBlob(toDocx(content, options));
}

type Block = Paragraph | Table;

function blocks(node: JSONContent, ctx: Context): Block[] {
  switch (node.type) {
    case "paragraph":
    case "heading":
      return [paragraph(node, ctx)];
    case "orderedList":
    case "bulletList": {
      const level = ctx.list ? ctx.list.level + 1 : 0;
      const list = {
        reference: node.type === "orderedList" ? "ordered" : "bullet",
        instance: ctx.nextListInstance(),
        level,
      } as const;
      return (node.content ?? []).flatMap((item) =>
        (item.content ?? []).flatMap((child, i) =>
          blocks(child, { ...ctx, list: i === 0 ? list : undefined }),
        ),
      );
    }
    case "blockquote":
      return (node.content ?? []).flatMap((n) => blocks(n, ctx));
    case "table":
      return [table(node, ctx)];
    default:
      return node.content
        ? [paragraph({ type: "paragraph", content: node.content }, ctx)]
        : [];
  }
}

function table(node: JSONContent, ctx: Context) {
  return new Table({
    visuallyRightToLeft: node.attrs?.dir === "rtl",
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: (node.content ?? []).map((row) => {
      const cells = row.content ?? [];
      return new TableRow({
        tableHeader: cells.every((c) => c.type === "tableHeader") || undefined,
        children: cells.map(
          (cell) =>
            new TableCell({
              columnSpan: cell.attrs?.colspan ?? 1,
              rowSpan: cell.attrs?.rowspan ?? 1,
              shading:
                cell.type === "tableHeader"
                  ? { type: ShadingType.CLEAR, fill: "F5F3F1", color: "auto" }
                  : undefined,
              margins: { top: 60, bottom: 60, left: 120, right: 120 },
              children: (() => {
                const inner = (cell.content ?? []).flatMap((n) =>
                  blocks(n, { ...ctx, list: undefined }),
                );
                return inner.length ? inner : [new Paragraph({})];
              })(),
            }),
        ),
      });
    }),
  });
}

function paragraph(node: JSONContent, ctx: Context) {
  const rtl = node.attrs?.dir === "rtl";
  const level = node.type === "heading" ? (node.attrs?.level as number) : 0;
  const align = node.attrs?.textAlign as keyof typeof alignment | undefined;

  return new Paragraph({
    bidirectional: rtl,
    heading: headingLevel[level as keyof typeof headingLevel],
    alignment: align ? alignment[align] : undefined,
    indent: node.attrs?.indent
      ? { start: 720 * (node.attrs.indent as number) }
      : undefined,
    numbering: ctx.list
      ? {
          reference: ctx.list.reference,
          instance: ctx.list.instance,
          level: ctx.list.level,
        }
      : undefined,
    children: runs(node.content ?? [], rtl, level, ctx.options),
  });
}

function runs(
  inline: JSONContent[],
  rtl: boolean,
  headingLevel: number,
  options: DocxOptions,
) {
  const isolated = inline.map(
    (n) => n.marks?.some((m) => m.type === "ltrIsolate") ?? false,
  );

  return inline.map((node, i) => {
    if (node.type === "hardBreak") return new TextRun({ break: 1 });

    let text = (node as { text?: string }).text ?? "";
    if (isolated[i] && !isolated[i - 1]) text = LRM + text;
    if (isolated[i] && !isolated[i + 1]) text += LRM;

    const marks = new Set(node.marks?.map((m) => m.type));
    const style = node.marks?.find((m) => m.type === "textStyle")?.attrs;
    const px = Number.parseFloat(style?.fontSize ?? "");
    const rightToLeft = rtl && !isolated[i];
    return new TextRun({
      text,
      bold: marks.has("bold") || headingLevel > 0 || undefined,
      italics: marks.has("italic") || undefined,
      underline: marks.has("underline") ? {} : undefined,
      size: px ? Math.round(px * 1.5) : headingSize[headingLevel],
      rightToLeft,
      font: { cs: familyOf(style?.fontFamily) ?? options.thaanaFont },
      language: rightToLeft ? { bidirectional: "dv-MV" } : undefined,
    });
  });
}
