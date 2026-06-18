import { describe, it, expect } from 'vitest';
import { theme } from './theme';

describe('theme', () => {
  it('exposes the CCK-coherent accent and dark base', () => {
    expect(theme.color.accent).toBe('#d4623e');
    expect(theme.color.bg.base).toBe('#0a1a22');
  });
  it('uses a 4px-based space scale', () => {
    expect(theme.space[1]).toBe(4);
    expect(theme.space[4]).toBe(16);
  });
  it('uses sharp (zero) corners to match the parent site', () => {
    expect(theme.radius.sm).toBe('0');
    expect(theme.radius.md).toBe('0');
    expect(theme.radius.lg).toBe('0');
    expect(theme.radius.pill).toBe('0');
  });
  it('exposes the parent panel surface and focus-border tokens', () => {
    expect(theme.color.bg.panel).toBe('rgba(13,26,31,0.6)');
    expect(theme.color.border.focus).toBe('rgba(255,255,255,0.24)');
  });
  it('tokenizes the parent wide letter-spacing scale', () => {
    expect(theme.tracking.label).toBe('0.2em');
    expect(theme.tracking.labelWide).toBe('0.28em');
    expect(theme.tracking.button).toBe('0.12em');
  });
  it('composes colors from shared rgb channels via alpha()', () => {
    expect(theme.alpha(theme.rgb.teal, 0.45)).toBe('rgba(43,179,196,0.45)');
    expect(theme.color.ghost.borderHover).toBe('rgba(43,179,196,0.75)');
    expect(theme.color.border.accent).toBe('rgba(212,98,62,0.65)');
  });
});
