import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { type LayoutId, layouts } from "./layouts";

export type ThaanaKeyboardStorage = {
  layout: LayoutId | null;
  lastLayout: LayoutId;
};

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    thaanaKeyboard: {
      setKeyboardLayout: (layout: LayoutId | null) => ReturnType;
      toggleThaanaKeyboard: () => ReturnType;
    };
  }
  interface Storage {
    thaanaKeyboard: ThaanaKeyboardStorage;
  }
}

export function translate(text: string, layout: LayoutId) {
  const keys = layouts[layout].keys;
  return [...text].map((char) => keys[char] ?? char).join("");
}

export const ThaanaKeyboard = Extension.create<
  { defaultLayout: LayoutId | null },
  ThaanaKeyboardStorage
>({
  name: "thaanaKeyboard",

  addOptions: () => ({ defaultLayout: "phonetic" }),

  addStorage() {
    return {
      layout: this.options.defaultLayout,
      lastLayout: this.options.defaultLayout ?? "phonetic",
    };
  },

  addCommands() {
    return {
      setKeyboardLayout:
        (layout) =>
        ({ tr }) => {
          this.storage.layout = layout;
          if (layout) this.storage.lastLayout = layout;
          tr.setMeta("thaanaKeyboard", layout);
          return true;
        },
      toggleThaanaKeyboard:
        () =>
        ({ commands }) =>
          commands.setKeyboardLayout(
            this.storage.layout ? null : this.storage.lastLayout,
          ),
    };
  },

  addKeyboardShortcuts() {
    return {
      "Mod-Shift-Space": () => this.editor.commands.toggleThaanaKeyboard(),
    };
  },

  addProseMirrorPlugins() {
    const storage = this.storage;
    return [
      new Plugin({
        key: new PluginKey("thaanaKeyboard"),
        props: {
          handleKeyDown(view, event) {
            if (!storage.layout) return false;
            if (event.ctrlKey || event.metaKey || event.altKey) return false;
            if (event.isComposing) return false;
            const mapped = layouts[storage.layout].keys[event.key];
            if (!mapped) return false;
            view.dispatch(view.state.tr.insertText(mapped).scrollIntoView());
            return true;
          },
        },
      }),
    ];
  },
});
