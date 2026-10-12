/// <reference types="node" />
import { globSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const COMMENT = /\/\*[\s\S]*?\*\//g;

// Vitest stubs out imported CSS, so the stylesheets are read from disk. Comments
// are dropped so example tokens in them don't count as references.
const readCss = (path: string): string => {
  const css = readFileSync(path, 'utf8');

  return css.replace(COMMENT, '');
};

const tokensCss = readCss('src/theme/tokens.css');

const SPACE_UNIT_PX = 4;

/** Custom properties set inline by components rather than defined as tokens. */
const INLINE_PROPERTIES = new Set(['--header-height']);

const stylesheetPaths = globSync('src/**/*.css');

/** Components that pass a token as a prop value, such as a bracket color. */
const componentPaths = globSync('src/**/*.tsx', { exclude: (path) => path.endsWith('.test.tsx') });

const readComponent = (path: string): string => readFileSync(path, 'utf8');

const parseTokens = (css: string): Map<string, string> => {
  const declaration = /(--[\w-]+):\s*([^;]+);/g;
  const tokens = new Map<string, string>();

  for (const [, name, value] of css.matchAll(declaration)) {
    tokens.set(name, value.trim());
  }

  return tokens;
};

const tokens = parseTokens(tokensCss);

const tokenValue = (name: string): string => {
  const value = tokens.get(name);

  if (value === undefined) {
    throw new Error(`Missing token ${name}`);
  }

  return value;
};

const spaceSteps = (): number[] => {
  const names = [...tokens.keys()].filter((name) => name.startsWith('--space-'));

  return names.map((name) => Number.parseInt(tokenValue(name), 10));
};

describe('design tokens', () => {
  it('exposes the CCK-coherent accent and dark base', () => {
    expect(tokenValue('--color-accent')).toBe('#d4623e');
    expect(tokenValue('--color-bg-base')).toBe('#0a1a22');
  });

  it('uses a 4px-based space scale ordered from smallest to largest', () => {
    const steps = spaceSteps();
    const ascending = [...steps].sort((a, b) => a - b);

    expect(tokenValue('--space-xxs')).toBe(`${SPACE_UNIT_PX}px`);
    expect(steps).toEqual(ascending);

    for (const step of steps) {
      expect(step % SPACE_UNIT_PX).toBe(0);
    }
  });

  it('uses sharp (zero) corners to match the parent site', () => {
    expect(tokenValue('--radius')).toBe('0');
  });

  it('draws the focus ring in brand teal so the keyboard indicator reads', () => {
    expect(tokenValue('--focus-ring')).toContain('var(--color-border-focus)');
    expect(tokenValue('--color-border-focus')).toContain('var(--rgb-teal)');
  });

  it('defines every token the stylesheets reference', () => {
    const reference = /var\((--[\w-]+)/g;
    const missing: string[] = [];

    expect(stylesheetPaths.length).toBeGreaterThan(1);

    for (const path of stylesheetPaths) {
      for (const [, name] of readCss(path).matchAll(reference)) {
        if (!(tokens.has(name) || INLINE_PROPERTIES.has(name))) {
          missing.push(`${path}: ${name}`);
        }
      }
    }

    expect(missing).toEqual([]);
  });

  it('uses every token it defines somewhere in the styles or components', () => {
    const reference = /var\((--[\w-]+)/g;
    const sources = [...stylesheetPaths.map(readCss), ...componentPaths.map(readComponent)];
    const referencedNames = (source: string): string[] =>
      [...source.matchAll(reference)].map(([, name]) => name);
    const used = new Set(sources.flatMap(referencedNames));
    const unused = [...tokens.keys()].filter((name) => !used.has(name));

    expect(unused).toEqual([]);
  });
});
