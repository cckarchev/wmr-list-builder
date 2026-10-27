/// <reference types="node" />
import { globSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";

const COMMENT = /\/\*[\s\S]*?\*\//g;

// Vitest stubs out imported CSS, so the stylesheets are read from disk.
// Comments are dropped so example tokens in them don't count as references.
const readCss = (path: string): string => {
  const css = readFileSync(path, "utf8");

  return css.replace(COMMENT, "");
};

const SHARED_TOKENS_PATH = createRequire(import.meta.url).resolve(
  "@cckarchev/shared/tokens.css",
);

/** Custom properties set inline by components rather than defined as tokens. */
const INLINE_PROPERTIES = new Set(["--header-height"]);

/**
 * Custom properties a control defines on itself to share one value across its
 * own edges, such as the stepper frame and its dividers.
 */
const LOCAL_PROPERTIES = new Set(["--stepper-edge", "--arrows-edge"]);

const stylesheetPaths = globSync("src/**/*.css");

/** Components that pass a token as a prop value, such as a bracket color. */
const componentPaths = globSync("src/**/*.tsx", {
  exclude: (path) => path.endsWith(".test.tsx"),
});

const readComponent = (path: string): string => readFileSync(path, "utf8");

const parseTokens = (css: string): Map<string, string> => {
  const declaration = /(--[\w-]+):\s*([^;]+);/g;
  const tokens = new Map<string, string>();

  for (const [, name, value] of css.matchAll(declaration)) {
    tokens.set(name, value.trim());
  }

  return tokens;
};

const sharedTokens = parseTokens(readCss(SHARED_TOKENS_PATH));
const appTokens = parseTokens(readCss("src/theme/tokens.css"));

describe("design tokens", () => {
  it("uses sharp (zero) corners to match the parent site", () => {
    expect(appTokens.get("--radius")).toBe("0");
  });

  it("defines every token the stylesheets reference", () => {
    const reference = /var\((--[\w-]+)/g;
    const missing: string[] = [];

    expect(stylesheetPaths.length).toBeGreaterThan(1);

    for (const path of stylesheetPaths) {
      for (const [, name] of readCss(path).matchAll(reference)) {
        const defined =
          sharedTokens.has(name) ||
          appTokens.has(name) ||
          INLINE_PROPERTIES.has(name) ||
          LOCAL_PROPERTIES.has(name);

        if (!defined) {
          missing.push(`${path}: ${name}`);
        }
      }
    }

    expect(missing).toEqual([]);
  });

  // Overrides of shared tokens, such as the reduced-motion duration, are
  // exempt.
  it("uses every token it adds somewhere in the styles or components", () => {
    const reference = /var\((--[\w-]+)/g;
    const sources = [
      ...stylesheetPaths.map(readCss),
      ...componentPaths.map(readComponent),
    ];
    const referencedNames = (source: string): string[] =>
      [...source.matchAll(reference)].map(([, name]) => name);
    const used = new Set(sources.flatMap(referencedNames));
    const added = [...appTokens.keys()].filter(
      (name) => !sharedTokens.has(name),
    );
    const unused = added.filter((name) => !used.has(name));

    expect(unused).toEqual([]);
  });
});
