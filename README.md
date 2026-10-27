# Warmaster Revolution List Builder

A roster builder for **Warmaster Revolution**, used by the CCK Warmaster group. Pick an
army, add units and upgrades, watch points / army size / validation update live, filter
the roster to the units you need, then save lists by name, share them with a link, copy
the list to your clipboard, or print an ink-friendly reference sheet.

It is built as a standalone static site, linked from the club site and live at
[wmr-list-builder.cckarchev.ar](https://wmr-list-builder.cckarchev.ar).

## Stack

- **React 19** + **TypeScript**
- **Vite** (dev server + build)
- **CSS Modules** (compiled by Lightning CSS), styled with the club's shared tokens
  (see Design system): each component's `.module.css` lives in its folder.
  Breakpoints are `@custom-media` queries in `src/theme/breakpoints.css`; variants
  and states are `data-*` attributes
- **Zustand** for state (`src/store/`) and **React Router** for routing
- **marked** for rendering Markdown in rule, spell, and magic-item text
- **Vitest** + **React Testing Library** for tests, and **Biome** for lint and format,
  from the shared preset in [`@cckarchev/shared`](https://github.com/cckarchev/cck-shared)
- **[Cloudflare Workers](https://workers.cloudflare.com)** with static assets, via Wrangler, deploy

## Commands

Requires Node 24.21 or later (`.node-version`).

| Command              | What it does                                        |
| :------------------- | :-------------------------------------------------- |
| `npm install`        | Install dependencies                                |
| `npm run dev`        | Dev server at `localhost:5173`                      |
| `npm run build`      | Production build to `dist/`                         |
| `npm run preview`    | Preview the local build                             |
| `npm run verify`     | Check, type check, test and build, as CI does       |
| `npm run deploy`     | `verify`, then deploy with Wrangler (manual deploy) |
| `npm run check`      | Biome lint and format check                         |
| `npm run check:fix`  | Biome lint and format with autofix                  |
| `npm run typecheck`  | Type check without emitting                         |
| `npm test`           | Run the unit tests (Vitest)                         |
| `npm run test:watch` | Run the unit tests in watch mode                    |

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

## Deploy

The site runs on Cloudflare Workers as static assets only, with no Worker script.
`wrangler.jsonc` serves `dist/`, falls back to `index.html` for the app's routes (so deep
links like `/build/goblin` resolve), and attaches the custom domain
`wmr-list-builder.cckarchev.ar`.

`npm run deploy` verifies, builds and uploads it with the project's own Wrangler. Log in once with
`npx wrangler login` on an account that holds the `cckarchev.ar` zone.

## Design system

The UI follows the club's design system: dark-only theme, sharp corners, orange
accent over a near-black base, and a light monochrome layout for print. The palette,
scales and fonts come from [`@cckarchev/shared`](https://github.com/cckarchev/cck-shared)
(`fonts.css` and `tokens.css`, imported in `src/main.tsx`). `src/theme/tokens.css` only
adds the tokens specific to this app.

## Credits

This project was initially based on [dsusco/wm-selector](https://github.com/dsusco/wm-selector),
the original open-source Warmaster army selector. Thanks to its author and contributors for
the army data and the validation logic that this rebuild started from.

## Disclaimer

This website is completely unofficial and in no way endorsed by Games Workshop Limited.
Warmaster and all associated names, races, and army lists are trademarks of Games Workshop
Limited. No challenge to their status is intended. All such material is used without
permission for non-commercial, fan use only.

See [NOTICE](NOTICE) for the full notice.
