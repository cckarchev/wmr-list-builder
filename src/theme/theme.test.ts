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
});
