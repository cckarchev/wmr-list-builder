import { describe, expect, it } from 'vitest';
import { buildShareUrl } from './shareLink';

const ORIGIN = 'https://wmr.example';

describe('buildShareUrl', () => {
  it('links to the build route on this origin when not embedded', () => {
    const url = buildShareUrl({
      armyId: 'empire',
      encoded: 'abc',
      embedBase: null,
      origin: ORIGIN,
    });

    expect(url).toBe('https://wmr.example/build/empire?list=abc');
  });

  it('links back to the embedding page, carrying the army and list as query params', () => {
    const url = buildShareUrl({
      armyId: 'empire',
      encoded: 'abc',
      embedBase: 'https://cckarchev.ar/builder',
      origin: ORIGIN,
    });

    expect(url).toBe('https://cckarchev.ar/builder?army=empire&list=abc');
  });

  it('keeps the embedding page query params and overrides stale army and list', () => {
    const url = buildShareUrl({
      armyId: 'empire',
      encoded: 'abc',
      embedBase: 'https://cckarchev.ar/builder?lang=en&list=old',
      origin: ORIGIN,
    });

    expect(url).toBe('https://cckarchev.ar/builder?lang=en&list=abc&army=empire');
  });
});
