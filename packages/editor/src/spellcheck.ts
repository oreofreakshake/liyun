import { Extension } from "@tiptap/core";
import type { Node } from "@tiptap/pm/model";
import { Plugin, PluginKey, type Transaction } from "@tiptap/pm/state";
import { Decoration, DecorationSet, type EditorView } from "@tiptap/pm/view";
import { normalize, type Speller, tokenize } from "spellcheck";

export type SpellcheckStorage = {
  available: boolean;
  enabled: boolean;
  ignored: Set<string>;
  personal: Set<string>;
  refresh: () => void;
};

export type SpellcheckOptions = {
  speller: Speller | null;
  personal?: { load(): string[]; save(words: string[]): void };
};

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    spellcheck: {
      setSpellcheck: (enabled: boolean) => ReturnType;
      ignoreWord: (word: string) => ReturnType;
      addToDictionary: (word: string) => ReturnType;
    };
  }
  interface Storage {
    spellcheck: SpellcheckStorage;
  }
}

export const spellcheckKey = new PluginKey<DecorationSet>("spellcheck");

const DELAY = 400;

type Found = { from: number; to: number; word: string };

function words(doc: Node) {
  const found: Found[] = [];
  doc.descendants((node, pos) => {
    if (!node.isTextblock) return true;
    if (node.type.spec.code) return false;
    const text = node.textBetween(0, node.content.size, undefined, "￼");
    for (const t of tokenize(text)) {
      found.push({
        from: pos + 1 + t.start,
        to: pos + 1 + t.end,
        word: normalize(t.word),
      });
    }
    return false;
  });
  return found;
}

function mapThrough(set: DecorationSet, tr: Transaction) {
  let next = set.map(tr.mapping, tr.doc);
  tr.mapping.maps.forEach((map, i) => {
    const rest = tr.mapping.slice(i + 1);
    map.forEach((_from, _to, start, end) => {
      const from = rest.map(start, -1);
      const to = rest.map(end, 1);
      next = next.remove(next.find(from, to));
    });
  });
  return next;
}

export const Spellcheck = Extension.create<
  SpellcheckOptions,
  SpellcheckStorage
>({
  name: "spellcheck",

  addOptions: () => ({ speller: null }),

  addStorage() {
    return {
      available: false,
      enabled: true,
      ignored: new Set<string>(),
      personal: new Set(this.options.personal?.load() ?? []),
      refresh: () => {},
    };
  },

  addCommands() {
    const refresh = () => {
      this.storage.refresh();
      return true;
    };
    return {
      setSpellcheck: (enabled) => () => {
        this.storage.enabled = enabled;
        return refresh();
      },
      ignoreWord: (word) => () => {
        this.storage.ignored.add(normalize(word));
        return refresh();
      },
      addToDictionary: (word) => () => {
        this.storage.personal.add(normalize(word));
        this.options.personal?.save([...this.storage.personal]);
        return refresh();
      },
    };
  },

  addProseMirrorPlugins() {
    const { speller } = this.options;
    const storage = this.storage;
    if (!speller) return [];
    const unknown = new Set<string>();
    const known = new Set<string>();

    const run = async (view: EditorView) => {
      const { doc } = view.state;
      const found = storage.enabled ? words(doc) : [];
      const missing = [
        ...new Set(
          found
            .map((f) => f.word)
            .filter((w) => !unknown.has(w) && !known.has(w)),
        ),
      ];
      if (missing.length > 0) {
        const wrong = new Set(await speller.check(missing));
        for (const w of missing) (wrong.has(w) ? unknown : known).add(w);
        if (view.isDestroyed || view.state.doc !== doc) return;
      }
      const { empty, head } = view.state.selection;
      const decorations = found
        .filter(
          (f) =>
            unknown.has(f.word) &&
            !storage.ignored.has(f.word) &&
            !storage.personal.has(f.word) &&
            !(empty && head >= f.from && head <= f.to),
        )
        .map((f) =>
          Decoration.inline(
            f.from,
            f.to,
            { class: "spelling-error" },
            { word: f.word },
          ),
        );
      view.dispatch(
        view.state.tr
          .setMeta(spellcheckKey, DecorationSet.create(doc, decorations))
          .setMeta("addToHistory", false),
      );
    };

    return [
      new Plugin<DecorationSet>({
        key: spellcheckKey,
        state: {
          init: () => DecorationSet.empty,
          apply: (tr, set) =>
            tr.getMeta(spellcheckKey) ??
            (tr.docChanged ? mapThrough(set, tr) : set),
        },
        props: {
          decorations: (state) => spellcheckKey.getState(state),
        },
        view(view) {
          let timer: ReturnType<typeof setTimeout> | undefined;
          const schedule = (delay = DELAY) => {
            clearTimeout(timer);
            timer = setTimeout(() => run(view), delay);
          };
          storage.refresh = () => schedule(0);
          speller.ready.then((ok) => {
            storage.available = ok;
            if (!view.isDestroyed) schedule(0);
          });
          return {
            update(view, previous) {
              if (
                view.state.doc !== previous.doc ||
                !view.state.selection.eq(previous.selection)
              ) {
                schedule();
              }
            },
            destroy() {
              clearTimeout(timer);
              storage.refresh = () => {};
            },
          };
        },
      }),
    ];
  },
});

export function misspellingAt(
  state: Parameters<typeof spellcheckKey.getState>[0],
  pos: number,
) {
  const found = spellcheckKey.getState(state)?.find(pos, pos)[0];
  if (!found) return null;
  return { from: found.from, to: found.to, word: found.spec.word as string };
}
