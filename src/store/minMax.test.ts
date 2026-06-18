import { describe, it, expect } from 'vitest';
import { explainMinMax, minMaxBadge } from './minMax';

describe('explainMinMax', () => {
  it('returns undefined when there are no min/max constraints', () => {
    expect(explainMinMax({}, 2000)).toBeUndefined();
  });

  describe('numeric per-1,000-points constraints', () => {
    it('explains a min + max, scaled to the current game size', () => {
      // Slingers: min 1 / max 6 per 1,000 pts. At 2,000 pts → 2–12.
      expect(explainMinMax({ min: 1, max: 6 }, 2000)).toBe(
        'min 1 / max 6 per 1,000 pts (≈ 2–12 at this size)',
      );
    });

    it('explains a max-only constraint', () => {
      // Ogres: max 2 per 1,000 pts. At 2,000 pts → up to 4.
      expect(explainMinMax({ max: 2 }, 2000)).toBe(
        'max 2 per 1,000 pts (≈ up to 4 at this size)',
      );
    });

    it('explains a min-only constraint', () => {
      // Warriors: min 2 per 1,000 pts. At 2,000 pts → 4+.
      expect(explainMinMax({ min: 2 }, 2000)).toBe('min 2 per 1,000 pts (≈ 4+ at this size)');
    });

    it('scales against the game size (1,000 pts → ×1)', () => {
      expect(explainMinMax({ min: 1, max: 6 }, 1000)).toBe(
        'min 1 / max 6 per 1,000 pts (≈ 1–6 at this size)',
      );
    });
  });

  describe('absolute per-army constraints', () => {
    it('explains an armyMin + armyMax pair', () => {
      expect(explainMinMax({ armyMin: 1, armyMax: 2 }, 2000)).toBe('min 1 / max 2 per army');
    });

    it('collapses equal armyMin/armyMax to "exactly N"', () => {
      expect(explainMinMax({ armyMin: 1, armyMax: 1 }, 2000)).toBe('exactly 1 per army');
    });

    it('explains an armyMax-only constraint', () => {
      expect(explainMinMax({ armyMax: 2 }, 2000)).toBe('max 2 per army');
    });

    it('takes precedence over numeric min/max', () => {
      expect(explainMinMax({ armyMin: 1, min: 4, max: 8 }, 2000)).toBe('min 1 per army');
    });
  });

  describe('keyword tokens', () => {
    it('explains "elite" as size − 1', () => {
      // size = floor(2000 / 1000) = 2, so max = 1.
      expect(explainMinMax({ max: 'elite' }, 2000)).toBe(
        'max 1 (elite: 1 per 1,000 pts after the first)',
      );
    });

    it('explains "Half or None"', () => {
      expect(explainMinMax({ min: 'Half or None' }, 2000)).toBe('half or none of its unit');
    });

    it('explains "All or None"', () => {
      expect(explainMinMax({ min: 'All or None' }, 2000)).toBe('all or none of its unit');
    });

    it('explains "Up to Half" living in the max field', () => {
      expect(explainMinMax({ max: 'Up to Half' }, 2000)).toBe('up to half of its unit');
    });

    it('explains an "As <unit>" token', () => {
      expect(explainMinMax({ min: 'As Goblins' }, 2000)).toBe('same number as Goblins');
    });
  });
});

describe('minMaxBadge', () => {
  it('returns undefined when there are no constraints', () => {
    expect(minMaxBadge({}, 2000)).toBeUndefined();
  });

  describe('numeric per-1,000-points constraints (resolved to the game size)', () => {
    it('shows a range for min + max', () => {
      expect(minMaxBadge({ min: 1, max: 6 }, 2000)).toBe('2–12');
    });

    it('shows ≤ for a max-only constraint', () => {
      expect(minMaxBadge({ max: 2 }, 2000)).toBe('≤4');
    });

    it('shows + for a min-only constraint', () => {
      expect(minMaxBadge({ min: 2 }, 2000)).toBe('4+');
    });

    it('scales against the game size', () => {
      expect(minMaxBadge({ min: 1, max: 6 }, 1000)).toBe('1–6');
    });
  });

  describe('absolute per-army constraints', () => {
    it('shows a bare count for equal armyMin/armyMax', () => {
      expect(minMaxBadge({ armyMin: 1, armyMax: 1 }, 2000)).toBe('1');
    });

    it('shows a range for differing armyMin/armyMax', () => {
      expect(minMaxBadge({ armyMin: 1, armyMax: 2 }, 2000)).toBe('1–2');
    });

    it('shows ≤ for an armyMax-only constraint', () => {
      expect(minMaxBadge({ armyMax: 2 }, 2000)).toBe('≤2');
    });
  });

  describe('keyword tokens', () => {
    it('resolves "elite" to ≤(size − 1)', () => {
      expect(minMaxBadge({ max: 'elite' }, 2000)).toBe('≤1');
    });

    it('shows a terse form for "Half or None"', () => {
      expect(minMaxBadge({ min: 'Half or None' }, 2000)).toBe('half or none');
    });

    it('shows "= <unit>" for an "As <unit>" token', () => {
      expect(minMaxBadge({ min: 'As Goblins' }, 2000)).toBe('= Goblins');
    });
  });
});
