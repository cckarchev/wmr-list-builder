import { describe, expect, it } from 'vitest';
import { theme } from './theme';

const SPACE_UNIT_PX = 4;
const CUSTOM_OPACITY = 0.45;

describe('theme', () => {
  it('exposes the CCK-coherent accent and dark base', () => {
    expect(theme.color.accent).toBe('#d4623e');
    expect(theme.color.bg.base).toBe('#0a1a22');
  });

  it('uses a named 4px-based space scale', () => {
    const steps = Object.values(theme.space);

    expect(theme.space.none).toBe(0);
    expect(theme.space.xxs).toBe(SPACE_UNIT_PX);

    for (const step of steps) {
      expect(step % SPACE_UNIT_PX).toBe(0);
    }
  });

  it('orders the space scale from smallest to largest', () => {
    const steps = Object.values(theme.space);
    const ascending = [...steps].sort((a, b) => a - b);

    expect(steps).toEqual(ascending);
  });

  it('uses sharp (zero) corners to match the parent site', () => {
    expect(theme.radius.sm).toBe('0');
    expect(theme.radius.md).toBe('0');
    expect(theme.radius.lg).toBe('0');
    expect(theme.radius.pill).toBe('0');
  });

  it('exposes the parent panel surface and an on-brand teal focus ring', () => {
    expect(theme.color.bg.panel).toBe('rgba(13,26,31,0.6)');
    // Focus uses brand teal (not faint white) so the keyboard indicator reads.
    expect(theme.color.border.focus).toBe('rgba(43,179,196,0.85)');
  });

  it('tokenizes the overlay surfaces components used to compose inline', () => {
    expect(theme.color.bg.accentTint).toBe('rgba(212,98,62,0.15)');
    expect(theme.color.bg.stripe).toBe('rgba(255,255,255,0.06)');
    expect(theme.color.bg.scrim).toBe('rgba(0,0,0,0.6)');
  });

  it('tokenizes the parent wide letter-spacing scale', () => {
    expect(theme.tracking.label).toBe('0.2em');
    expect(theme.tracking.labelWide).toBe('0.28em');
    expect(theme.tracking.button).toBe('0.12em');
  });

  it('composes colors from shared rgb channels via alpha()', () => {
    expect(theme.alpha(theme.rgb.teal, CUSTOM_OPACITY)).toBe('rgba(43,179,196,0.45)');
    expect(theme.color.ghost.borderHover).toBe('rgba(43,179,196,0.9)');
    expect(theme.color.border.accent).toBe('rgba(212,98,62,0.7)');
  });
});
