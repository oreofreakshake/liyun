# Liyun

A free, open-source web editor for Dhivehi documents, where mixed Dhivehi and English text
stays in order. Comes with templates for common Maldivian documents.

## Why

Dhivehi is written right to left; English words and numbers run left to right. Most editors get
the characters around them wrong when the two mix: `C++` inside a Dhivehi sentence shows up as
`++C`, a phone number like `+960 333 4444` comes out as `4444 333 960+`, `50%` becomes `%50` and
`$150` becomes `150$`.

Liyun handles this in two ways:

1. **Each paragraph picks its own direction** from its content. A Dhivehi sentence that starts
   with an English word stays right to left, where `dir="auto"` would flip it. Any paragraph can
   also be set to RTL or LTR by hand.
2. **English and number runs are isolated** (`<bdi dir="ltr">`) automatically as you type,
   together with attached symbols such as `$`, `%`, `#`, `+`, `/` and `!`, so the surrounding
   text cannot move them.

Both are checked against a set of [bidi test cases](packages/thaana-bidi/fixtures): in the
editor, typed and pasted, and after export to Word.

## Features

- Per-paragraph direction and automatic LTR isolation
- Thaana keyboard: phonetic, Hassan Hameed phonetic and typewriter layouts
  (Ctrl/Cmd + Shift + Space to switch)
- Templates: official letter, memo, meeting minutes, invoice, news article
- Export to Word (.docx) and PDF (browser print); JSON backup and restore
- No account and no server: documents are saved in the browser (IndexedDB)

## Getting started

Requires [Bun](https://bun.sh).

```sh
bun install
bun dev              # http://localhost:3000, editor at /write
bun run test         # all tests
bun run build        # static site in out/
```

To rebuild `templates/*.json` after editing `templates/source/*.html`:

```sh
bun run templates
```

User documentation is on the site at `/docs`.

## Repository

| Path | Contents |
|---|---|
| `packages/thaana-bidi` | Paragraph direction and LTR run detection, with the bidi test cases |
| `packages/editor` | Tiptap editor, Thaana keyboard, DOCX export |
| `packages/store` | `DocumentStore` interface with IndexedDB and in-memory implementations |
| `templates/` | Document templates (`source/*.html` builds into `*.json`) |
| `src/app` | Next.js site: landing page, docs and the editor at `/write` |

## Fonts

The Thaana font used in development is not included in the repository. Without it, Thaana text
falls back to a system font.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Corrections to Dhivehi wording in templates and test
cases are especially welcome.

## Licence

[Apache License 2.0](LICENSE). The Thaana keyboard layouts are adapted from
[JTK](https://github.com/jawish/jtk) by Jawish Hameed (MIT).
