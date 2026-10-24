# Contributing to Liyun

Thanks for helping. Dhivehi corrections are as valuable as code: if a template phrase, a
placeholder or an interface label reads wrong, please open an issue or a pull request.

## Setup

```sh
bun install
bun dev        # http://localhost:3000/write
bun run test
bunx biome check --write .
```

## Add a template

Templates live in `templates/`. You edit readable HTML; a script turns it into the JSON the
editor loads.

1. Create `templates/source/<id>.html`. Use the tags the editor supports: `h1`–`h3`, `p`,
   `strong`, `em`, `ol`/`ul` with `li`, `br`, and `style="text-align: center"` or `end`.
2. Add an entry to `templates/source/templates.json`:

   ```json
   { "id": "<id>", "title": { "dv": "<Dhivehi name>", "en": "<English name>" } }
   ```

3. Put anything the user fills in inside square brackets, in Dhivehi: a name, a job title, a
   date.
   Do not use real people, real offices' letters, or real reference numbers.
4. Run `bun run templates`. This builds `templates/<id>.json` through the real editor, so
   paragraph directions and LTR isolation are stored.
5. Run `bun run test`. A test fails if a JSON file is out of date with its source.
6. Add the template to `src/templates.ts`.

Write percentages as `50%` and brackets in typing order. The Word workaround of typing `%50`
shows up as `%50` in Liyun.

## Add a bidi test case

Every bidi bug gets a test case before it is fixed. Cases live in
`packages/thaana-bidi/fixtures/` as JSON: the line as typed (`text`), the paragraph direction a
reader expects (`direction`), and the pieces of the line as they appear on screen from left to
right (`expected`). Copy an existing case, run `bun run test`, and check the reported layout with a
native reader before relying on it.

## Code

- TypeScript, formatted and linted with Biome.
- `packages/thaana-bidi` has no dependencies on the editor; keep it that way.
- Components never call IndexedDB or `localStorage` directly; go through `DocumentStore`.
- Keep the app's UI direction and a document's paragraph directions separate.
