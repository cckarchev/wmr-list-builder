# Warmaster Revolution List Builder

A roster builder for **Warmaster Revolution**, used by the CCK Warmaster group. Pick an
army, add units and upgrades, watch points / army size / validation update live, filter
the roster to the units you need, then save lists by name, share them with a link, copy
the list to your clipboard, or print an ink-friendly reference sheet.

It is built as a standalone static site, linked from the club site.

## Tech stack

- **React 19** + **TypeScript**
- **Vite** (dev server + build)
- **CSS Modules** (compiled by Lightning CSS) for styling: each component's
  `.module.css` lives in its folder, and every visual value comes from the design
  tokens in `src/theme/tokens.css`. Breakpoints are `@custom-media` queries in
  `src/theme/breakpoints.css`; variants and states are `data-*` attributes
- **Zustand** for state (`src/store/`)
- **React Router** for routing
- **marked** for rendering Markdown in rule, spell, and magic-item text
- **Vitest** + **React Testing Library** for tests

## Getting started

    $ npm install
    $ npm run dev

Vite serves the app and prints the local URL (default <http://localhost:5173/>).

## Scripts

| Command              | What it does                                          |
| -------------------- | ----------------------------------------------------- |
| `npm run dev`        | Start the Vite dev server                             |
| `npm run build`      | Type-check and build the production bundle to `dist/` |
| `npm run preview`    | Serve the built `dist/` locally                       |
| `npm test`           | Run the test suite once                               |
| `npm run test:watch` | Run tests in watch mode                               |
| `npm run lint`       | Lint, format, and import-order check with Biome       |
| `npm run lint:fix`   | Apply all safe Biome fixes                            |
| `npm run typecheck`  | Type-check without emitting                           |
| `npm run deploy`     | Build and deploy to Cloudflare Workers                |

## Project layout

    src/
      core/        Pure logic: validation, force limits, army totals, roster grouping, persistence (ports of the original logic)
      data/        Warmaster Revolution army JSON + loaders and types
      store/       Zustand store and store-bound hooks
      theme/       Design tokens + global styles (dark UI; light @media print)
      components/  Shared UI primitives, one folder per component
      hooks/       Shared React hooks: popup dismissal, Escape key, element size
      layout/      App shell: layout, nav, footer, scroll restoration
      screens/     home/ (army picker), build/ (roster), print/ (selectable sections), about/ (edition, links, credits)

Each screen folder mirrors its component tree: a component with private children keeps
them in subfolders beside it. Imports inside one area are relative; imports that leave
it use the `@/` alias for `src/`.

Army data lives in `src/data/armies/*.json` and is imported at build time via Vite's
`import.meta.glob`, so adding an army is just dropping in a JSON file.

## Deployment

The site runs on Cloudflare Workers as static assets only, with no Worker script.
`wrangler.jsonc` serves `dist/`, falls back to `index.html` for the app's routes (so deep
links like `/build/goblin` resolve), and attaches the custom domain
`wmr-list-builder.cckarchev.ar`.

`npm run deploy` builds and uploads it with the project's own Wrangler. Log in once with
`npx wrangler login` on an account that holds the `cckarchev.ar` zone.

## Saving & sharing

The roster header groups the list-management controls. **Save** and **Load** sit inline;
the rest (share link, copy as text, print, reset) live under the **More** overflow menu.
- **Save / Load** keep named lists per army in `localStorage`, so you can come back to a
  build later.
- **Share link** encodes the whole list into a compact `?list=` query parameter (a
  base64url blob of the army, game size, and chosen units / upgrades), so a URL alone
  reconstructs the roster with no server involved.
- **Copy** writes a plain-text version of the list to the clipboard.

Encoding, decoding, and the saved-list storage live in `src/core/persistence/`.

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
