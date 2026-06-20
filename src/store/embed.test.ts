import { describe, it, expect, beforeEach } from 'vitest';
import { initEmbed, getEmbedBase } from './embed';

describe('embed', () => {
  beforeEach(() => initEmbed('')); // reset to non-embedded between tests

  it('returns null when there is no embed param', () => {
    initEmbed('?foo=bar');
    expect(getEmbedBase()).toBeNull();
  });

  it('returns null for an empty embed param', () => {
    initEmbed('?embed=');
    expect(getEmbedBase()).toBeNull();
  });

  it('accepts an allowlisted https host', () => {
    const base = 'https://www.cckarchev.ar/juegos/warmaster/list-builder/';
    initEmbed('?embed=' + encodeURIComponent(base));
    expect(getEmbedBase()).toBe(base);
  });

  it('accepts the apex allowlisted host', () => {
    const base = 'https://cckarchev.ar/juegos/warmaster/list-builder/';
    initEmbed('?embed=' + encodeURIComponent(base));
    expect(getEmbedBase()).toBe(base);
  });

  it('rejects a non-allowlisted host', () => {
    initEmbed('?embed=' + encodeURIComponent('https://evil.com/x'));
    expect(getEmbedBase()).toBeNull();
  });

  it('rejects a non-https url', () => {
    initEmbed('?embed=' + encodeURIComponent('http://www.cckarchev.ar/x'));
    expect(getEmbedBase()).toBeNull();
  });

  it('accepts http localhost for local dev testing', () => {
    const base = 'http://localhost:4321/juegos/warmaster/list-builder/';
    initEmbed('?embed=' + encodeURIComponent(base));
    expect(getEmbedBase()).toBe(base);
  });

  it('accepts http 127.0.0.1 for local dev testing', () => {
    const base = 'http://127.0.0.1:4321/juegos/warmaster/list-builder/';
    initEmbed('?embed=' + encodeURIComponent(base));
    expect(getEmbedBase()).toBe(base);
  });

  it('rejects a value that does not parse as a url', () => {
    initEmbed('?embed=' + encodeURIComponent('not a url'));
    expect(getEmbedBase()).toBeNull();
  });
});
