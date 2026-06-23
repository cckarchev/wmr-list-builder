# Warmaster Revolution List Builder

A roster builder for **Warmaster Revolution**, used by the CCK Warmaster group. Pick an
army, add units and upgrades, watch points / army size / validation update live, filter
the roster to the units you need, then save lists by name, share them with a link, copy
the list to your clipboard, or print an ink-friendly reference sheet.

It is built as a standalone static site and is meant to be embedded full-bleed in an
`<iframe>` on the club site.

## Tech stack

- **React 19** + **TypeScript**
- **Vite** (dev server + build)
- **styled-components** for styling: all visual values come from the design tokens in
  `src/theme/theme.ts`; no inline styles
- **Zustand** for state (`src/store/`)
- **React Router** for routing
- **marked** for rendering Markdown in rule, spell, and magic-item text
- **Vitest** + **React Testing Library** for tests

## Getting started

    $ npm install
    $ npm run dev

Vite serves the app and prints the local URL (default <http://localhost:5173/>).

## Scripts

| Command                | What it does                                          |
| ---------------------- | ----------------------------------------------------- |
| `npm run dev`          | Start the Vite dev server                             |
| `npm run build`        | Type-check and build the production bundle to `dist/` |
| `npm run preview`      | Serve the built `dist/` locally                       |
| `npm test`             | Run the test suite once                               |
| `npm run test:watch`   | Run tests in watch mode                               |
| `npm run lint`         | Lint `src/`                                           |
| `npm run lint:fix`     | Lint `src/` and auto-fix what it can                  |
| `npm run typecheck`    | Type-check without emitting                           |
| `npm run format`       | Format the repo with Prettier                         |
| `npm run format:check` | Check formatting without writing                      |

## Project layout

    src/
      data/        Warmaster Revolution army JSON + loaders and types
      store/       Zustand store, selectors, validation (ports of the original logic)
      theme/       Design tokens + global styles (dark UI; light @media print)
      components/  ui/ primitives, army/ build widgets, print/ sheet, layout/ shell
      screens/     Home (army picker), Build (roster), Print (selectable sections)

Army data lives in `src/data/armies/*.json` and is imported at build time via Vite's
`import.meta.glob`, so adding an army is just dropping in a JSON file.

## Deployment

The app is a static SPA. Build it and serve `dist/` on any static host (Cloudflare
Pages, Netlify, etc.). `public/_redirects` provides the SPA fallback
(`/*  /index.html  200`) so deep links like `/build/goblin` resolve.

### Embedding

Host elsewhere and embed it on the club site:

```html
<iframe src="https://your-deploy-url/" style="width:100%;height:100%;border:0"></iframe>
```

The layout fills its container and uses a dark palette coherent with the club site.

## Saving & sharing

The roster header groups the list-management controls. **Save** and **Load** sit inline;
the rest (share link, copy as text, print, reset) live under the **More** overflow menu.

- **Save / Load** keep named lists per army in `localStorage`, so you can come back to a
  build later.
- **Share link** encodes the whole list into a compact `?list=` query parameter (a
  base64url blob of the army, game size, and chosen units / upgrades), so a URL alone
  reconstructs the roster with no server involved.
- **Copy** writes a plain-text version of the list to the clipboard.

Encoding, decoding, and the saved-list storage live in `src/store/persistence.ts`.

## Building a roster

On the Build screen, sections are collapsible and the **Filter** controls narrow the
roster down by what you are looking for, so large army lists stay manageable.

## Printing

The Print screen (the **Print** button on a roster) offers per-section checkboxes and an
optional label. Output is forced to a light, monochrome layout via `@media print` to save
ink/toner.

## Credits

This project was initially based on [dsusco/wm-selector](https://github.com/dsusco/wm-selector),
the original open-source Warmaster army selector. Thanks to its author and contributors for
the army data and the validation logic that this rebuild started from.

## Disclaimer

This website is completely unofficial and in no way endorsed by Games Workshop Limited.
Warmaster and all associated names, races, and army lists are trademarks of Games Workshop
Limited. No challenge to their status is intended. All such material is used without
permission for non-commercial, fan use only.

See [NOTICE](NOTICE) for the full credit and disclaimer.
