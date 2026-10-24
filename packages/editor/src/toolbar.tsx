"use client";

import {
  ArrowDown01Icon,
  HighlighterIcon,
  KeyboardIcon,
  Layout3RowIcon,
  LayoutBottomIcon,
  LayoutTopIcon,
  LeftToRightListBulletIcon,
  LeftToRightListNumberIcon,
  RedoIcon,
  RightToLeftListBulletIcon,
  RightToLeftListNumberIcon,
  TableIcon,
  TextAlignCenterIcon,
  TextAlignJustifyCenterIcon,
  TextAlignLeftIcon,
  TextAlignRightIcon,
  TextBoldIcon,
  TextIndentLessIcon,
  TextIndentMoreIcon,
  TextItalicIcon,
  TextUnderlineIcon,
  UndoIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import type { Editor } from "@tiptap/core";
import type { ReactNode } from "react";
import { familyOf, fontSizes, fontStack, thaanaFonts } from "./fonts";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Kbd, KbdGroup } from "./ui/kbd";

type DirectionMode = "auto" | "rtl" | "ltr";
type Alignment = "start" | "center" | "end" | "justify";

const styles = [
  { value: "0", label: "Normal", className: "text-[15px]" },
  { value: "1", label: "Heading 1", className: "text-[22px]" },
  { value: "2", label: "Heading 2", className: "text-[19px]" },
  { value: "3", label: "Heading 3", className: "text-[17px]" },
];

const alignments: { value: Alignment; label: string }[] = [
  { value: "start", label: "Align start" },
  { value: "center", label: "Center" },
  { value: "end", label: "Align end" },
  { value: "justify", label: "Justify" },
];

const directions: { value: DirectionMode; label: string; hint: string }[] = [
  { value: "auto", label: "Auto", hint: "From the text" },
  { value: "rtl", label: "RTL", hint: "Right to left" },
  { value: "ltr", label: "LTR", hint: "Left to right" },
];

export function Toolbar({
  editor,
  showIsolation,
  onShowIsolation,
}: {
  editor: Editor;
  showIsolation: boolean;
  onShowIsolation: (on: boolean) => void;
}) {
  const chain = () => editor.chain().focus();
  const block = editor.state.selection.$from.parent;
  const rtl = block.attrs.dir !== "ltr";
  const mode = (
    block.attrs.dirLocked ? block.attrs.dir : "auto"
  ) as DirectionMode;
  const level = editor.isActive("heading")
    ? String(editor.getAttributes("heading").level)
    : "0";
  const align = (block.attrs.textAlign ?? "start") as Alignment;
  const textStyle = editor.getAttributes("textStyle");
  const family = familyOf(textStyle.fontFamily);
  const font = thaanaFonts.find((f) => f.family === family) ?? thaanaFonts[0];
  const size = textStyle.fontSize
    ? Number.parseInt(textStyle.fontSize, 10)
    : null;
  const layout = editor.storage.thaanaKeyboard.layout;
  const inList = editor.isActive("listItem");
  const inTable = editor.isActive("table");
  const { doc } = editor.state;
  const hasHeader = doc.firstChild?.type.name === "pageHeader";
  const hasFooter = doc.lastChild?.type.name === "pageFooter";

  const alignIcon = (a: Alignment): IconSvgElement =>
    a === "center"
      ? TextAlignCenterIcon
      : a === "justify"
        ? TextAlignJustifyCenterIcon
        : (a === "start") === rtl
          ? TextAlignRightIcon
          : TextAlignLeftIcon;

  return (
    <div className="no-scrollbar flex max-w-full items-center gap-0.5 overflow-x-auto rounded-full border border-border bg-card p-1 shadow-soft">
      <ToolButton
        label="Undo"
        disabled={!editor.can().undo()}
        onClick={() => chain().undo().run()}
      >
        <Icon icon={UndoIcon} />
      </ToolButton>
      <ToolButton
        label="Redo"
        disabled={!editor.can().redo()}
        onClick={() => chain().redo().run()}
      >
        <Icon icon={RedoIcon} />
      </ToolButton>

      <Divider />

      <Menu
        label="Text style"
        trigger={styles.find((s) => s.value === level)?.label}
        width="w-48"
      >
        <DropdownMenuRadioGroup
          value={level}
          onValueChange={(v) =>
            v === "0"
              ? chain().setParagraph().run()
              : chain()
                  .setHeading({ level: Number(v) as 1 | 2 | 3 })
                  .run()
          }
        >
          {styles.map((s) => (
            <DropdownMenuRadioItem
              key={s.value}
              value={s.value}
              className={s.className}
            >
              {s.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </Menu>

      <Menu label="Font" trigger={font.label} width="w-60">
        <DropdownMenuRadioGroup
          value={font.label}
          onValueChange={(v) => {
            const next = thaanaFonts.find((f) => f.label === v);
            if (!next?.family) chain().unsetFontFamily().run();
            else chain().setFontFamily(fontStack(next.family)).run();
          }}
        >
          {thaanaFonts.map((f) => (
            <DropdownMenuRadioItem key={f.label} value={f.label}>
              {f.label}
              <span
                lang="dv"
                className="ms-auto text-[17px] text-muted-foreground"
                style={{
                  fontFamily: f.family ? fontStack(f.family) : undefined,
                }}
              >
                ލިޔުން
              </span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </Menu>

      <Menu label="Font size" trigger={size ?? 17} width="w-28">
        <DropdownMenuRadioGroup
          value={size ? String(size) : "default"}
          onValueChange={(v) =>
            v === "default"
              ? chain().unsetFontSize().run()
              : chain().setFontSize(`${v}px`).run()
          }
        >
          <DropdownMenuRadioItem value="default">17</DropdownMenuRadioItem>
          {fontSizes.map((s) => (
            <DropdownMenuRadioItem key={s} value={String(s)}>
              {s}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </Menu>

      <Divider />

      <ToolButton
        label="Bold"
        pressed={editor.isActive("bold")}
        onClick={() => chain().toggleBold().run()}
      >
        <Icon icon={TextBoldIcon} />
      </ToolButton>
      <ToolButton
        label="Italic"
        pressed={editor.isActive("italic")}
        onClick={() => chain().toggleItalic().run()}
      >
        <Icon icon={TextItalicIcon} />
      </ToolButton>
      <ToolButton
        label="Underline"
        pressed={editor.isActive("underline")}
        onClick={() => chain().toggleUnderline().run()}
      >
        <Icon icon={TextUnderlineIcon} />
      </ToolButton>

      <Divider />

      <Menu
        label="Alignment"
        trigger={<Icon icon={alignIcon(align)} />}
        width="w-44"
      >
        <DropdownMenuRadioGroup
          value={align}
          onValueChange={(v) =>
            v === "start"
              ? chain().unsetTextAlign().run()
              : chain().setTextAlign(v).run()
          }
        >
          {alignments.map((a) => (
            <DropdownMenuRadioItem key={a.value} value={a.value}>
              <Icon icon={alignIcon(a.value)} />
              {a.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </Menu>
      <ToolButton
        label="Bulleted list"
        pressed={editor.isActive("bulletList")}
        onClick={() => chain().toggleBulletList().run()}
      >
        <Icon
          icon={rtl ? RightToLeftListBulletIcon : LeftToRightListBulletIcon}
        />
      </ToolButton>
      <ToolButton
        label="Numbered list"
        pressed={editor.isActive("orderedList")}
        onClick={() => chain().toggleOrderedList().run()}
      >
        <Icon
          icon={rtl ? RightToLeftListNumberIcon : LeftToRightListNumberIcon}
        />
      </ToolButton>
      <ToolButton
        label="Decrease indent"
        onClick={() =>
          inList
            ? chain().liftListItem("listItem").run()
            : chain().outdent().run()
        }
      >
        <Icon icon={TextIndentLessIcon} />
      </ToolButton>
      <ToolButton
        label="Increase indent"
        onClick={() =>
          inList
            ? chain().sinkListItem("listItem").run()
            : chain().indent().run()
        }
      >
        <Icon icon={TextIndentMoreIcon} />
      </ToolButton>

      <Divider />

      <Menu
        label="Table"
        trigger={<Icon icon={TableIcon} />}
        pressed={inTable}
        width="w-52"
      >
        {inTable ? (
          <>
            <DropdownMenuItem onSelect={() => chain().addRowBefore().run()}>
              Add row above
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => chain().addRowAfter().run()}>
              Add row below
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() =>
                rtl
                  ? chain().addColumnAfter().run()
                  : chain().addColumnBefore().run()
              }
            >
              Add column {rtl ? "right" : "left"}
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() =>
                rtl
                  ? chain().addColumnBefore().run()
                  : chain().addColumnAfter().run()
              }
            >
              Add column {rtl ? "left" : "right"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => chain().toggleHeaderRow().run()}>
              Header row
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => chain().mergeOrSplit().run()}>
              Merge or split cells
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onSelect={() => chain().deleteRow().run()}
            >
              Delete row
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onSelect={() => chain().deleteColumn().run()}
            >
              Delete column
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onSelect={() => chain().deleteTable().run()}
            >
              Delete table
            </DropdownMenuItem>
          </>
        ) : (
          <TablePicker
            onPick={(rows, cols) =>
              chain().insertTable({ rows, cols, withHeaderRow: false }).run()
            }
          />
        )}
      </Menu>

      <Menu
        label="Header and footer"
        trigger={<Icon icon={Layout3RowIcon} />}
        pressed={hasHeader || hasFooter}
        width="w-52"
      >
        <DropdownMenuLabel>Every page</DropdownMenuLabel>
        <DropdownMenuCheckboxItem
          checked={hasHeader}
          onSelect={() => chain().togglePageFrame("pageHeader").run()}
        >
          <Icon icon={LayoutTopIcon} />
          Header
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={hasFooter}
          onSelect={() => chain().togglePageFrame("pageFooter").run()}
        >
          <Icon icon={LayoutBottomIcon} />
          Footer
        </DropdownMenuCheckboxItem>
      </Menu>

      <Menu
        label="Paragraph direction"
        trigger={mode === "auto" ? "Auto" : mode.toUpperCase()}
        width="w-48"
      >
        <DropdownMenuLabel>Direction</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={mode}
          onValueChange={(m) =>
            chain()
              .setParagraphDirection(m as DirectionMode)
              .run()
          }
        >
          {directions.map((d) => (
            <DropdownMenuRadioItem key={d.value} value={d.value}>
              {d.label}
              <span className="ms-auto text-[12px] text-muted-foreground">
                {d.hint}
              </span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </Menu>

      <Menu
        label={`Keyboard: ${layout ? "Thaana" : "English"}`}
        trigger={
          <>
            <Icon icon={KeyboardIcon} />
            <span className="hidden sm:inline">
              {layout ? "Thaana" : "English"}
            </span>
          </>
        }
        width="w-56"
      >
        <DropdownMenuLabel>Keyboard</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={layout ? "thaana" : "english"}
          onValueChange={(v) =>
            chain()
              .setKeyboardLayout(v === "thaana" ? "phonetic" : null)
              .run()
          }
        >
          <DropdownMenuRadioItem value="thaana">Thaana</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="english">English</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <p className="flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] text-muted-foreground">
          <KbdGroup>
            <Kbd>Alt</Kbd>
            <span>+</span>
            <Kbd>Shift</Kbd>
          </KbdGroup>
          to switch
        </p>
      </Menu>

      <ToolButton
        label="Highlight protected text (English and numbers Liyun keeps in place)"
        pressed={showIsolation}
        onClick={() => onShowIsolation(!showIsolation)}
      >
        <Icon icon={HighlighterIcon} />
      </ToolButton>
    </div>
  );
}

function TablePicker({
  onPick,
}: {
  onPick: (rows: number, cols: number) => void;
}) {
  const sizes = [
    [2, 2],
    [3, 2],
    [3, 3],
    [4, 3],
    [5, 4],
  ];
  return (
    <>
      <DropdownMenuLabel>Insert table</DropdownMenuLabel>
      {sizes.map(([rows, cols]) => (
        <DropdownMenuItem
          key={`${rows}x${cols}`}
          onSelect={() => onPick(rows, cols)}
        >
          {cols} columns, {rows} rows
        </DropdownMenuItem>
      ))}
    </>
  );
}

export function Icon({
  icon,
  className = "size-[18px]",
}: {
  icon: IconSvgElement;
  className?: string;
}) {
  return (
    <HugeiconsIcon
      icon={icon}
      strokeWidth={1.6}
      className={className}
      aria-hidden="true"
    />
  );
}

function Menu({
  label,
  trigger,
  pressed,
  width,
  children,
}: {
  label: string;
  trigger: ReactNode;
  pressed?: boolean;
  width: string;
  children: ReactNode;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        title={label}
        aria-label={label}
        data-pressed={pressed || undefined}
        className="inline-flex h-8 shrink-0 items-center gap-1 rounded-full px-2 text-[13px] whitespace-nowrap text-body outline-none transition-colors hover:bg-panel focus-visible:ring-2 focus-visible:ring-ring data-[state=open]:bg-panel data-pressed:bg-panel"
      >
        {trigger}
        <Icon icon={ArrowDown01Icon} className="size-3 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className={width}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function Divider() {
  return <span aria-hidden className="mx-1 h-5 w-px shrink-0 bg-border" />;
}

function ToolButton({
  label,
  pressed,
  disabled,
  onClick,
  children,
}: {
  label: string;
  pressed?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={pressed}
      disabled={disabled}
      onClick={onClick}
      className="inline-flex size-8 shrink-0 items-center justify-center rounded-full text-body transition-colors hover:bg-panel disabled:opacity-35 disabled:hover:bg-transparent aria-pressed:bg-primary aria-pressed:text-primary-foreground"
    >
      {children}
    </button>
  );
}
