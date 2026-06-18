import { armySize } from './selectors';

/** Minimal shape carrying min/max constraints — satisfied by units and upgrades. */
export interface MinMaxSource {
  armyMin?: number;
  armyMax?: number;
  min?: number | string;
  max?: number | string;
}

/** Plain-language phrasing for the keyword tokens enforced in validation.ts. */
const TOKEN_PHRASES: Record<string, string> = {
  'All or None': 'all or none of its unit',
  'Half or All': 'half or all of its unit',
  'Half or More': 'half or more of its unit',
  'Half or None': 'half or none of its unit',
  'Up to Half': 'up to half of its unit',
};

/** Terse forms of the keyword tokens, for the at-a-glance badge. */
const TOKEN_BADGES: Record<string, string> = {
  'All or None': 'all or none',
  'Half or All': 'half or all',
  'Half or More': 'half+',
  'Half or None': 'half or none',
  'Up to Half': '≤ half',
};

/**
 * Structured reading of a troop's min/max constraints, resolved against the
 * current game size. `explainMinMax` (full phrase) and `minMaxBadge` (terse)
 * are two renderings of the same descriptor, so the precedence rules live in
 * one place. Mirrors the rules enforced in `validate` (validation.ts) and the
 * raw-token formatter `minMax` (storeHelpers.ts).
 */
type MinMaxInfo =
  | { kind: 'army'; min?: number; max?: number }
  | { kind: 'elite'; cap: number }
  | { kind: 'token'; token: string }
  | { kind: 'rate'; min: number; max: number; size: number };

function resolveMinMax(troop: MinMaxSource, gameSize: number): MinMaxInfo | undefined {
  // Absolute per-army counts take precedence (mirrors `minMax`).
  if (troop.armyMin || troop.armyMax) {
    return { kind: 'army', min: troop.armyMin, max: troop.armyMax };
  }

  const size = armySize(gameSize);
  const { min, max } = troop;

  // `elite` lives in the max field and resolves to an absolute (size − 1) cap.
  if (max === 'elite') {
    return { kind: 'elite', cap: Math.max(0, size - 1) };
  }

  // Other keyword tokens are relative to the unit being upgraded.
  if (typeof min === 'string' || typeof max === 'string') {
    return { kind: 'token', token: typeof min === 'string' ? min : (max as string) };
  }

  // Numeric per-1,000-points scaling.
  const minN = typeof min === 'number' ? min : 0;
  const maxN = typeof max === 'number' ? max : 0;
  if (!minN && !maxN) return undefined;
  return { kind: 'rate', min: minN, max: maxN, size };
}

/**
 * Full plain-language phrase for a troop's min/max, e.g.
 * "min 1 / max 6 per 1,000 pts (≈ 2–12 at this size)". Used as the hover
 * tooltip. Returns undefined when the troop carries no constraints.
 */
export function explainMinMax(troop: MinMaxSource, gameSize: number): string | undefined {
  const info = resolveMinMax(troop, gameSize);
  if (!info) return undefined;

  switch (info.kind) {
    case 'army': {
      if (info.min && info.min === info.max) return 'exactly ' + info.min + ' per army';
      const parts: string[] = [];
      if (info.min) parts.push('min ' + info.min);
      if (info.max) parts.push('max ' + info.max);
      return parts.join(' / ') + ' per army';
    }
    case 'elite':
      return 'max ' + info.cap + ' (elite: 1 per 1,000 pts after the first)';
    case 'token': {
      if (/^As /.test(info.token)) return 'same number as ' + info.token.slice(3);
      return TOKEN_PHRASES[info.token] ?? info.token;
    }
    case 'rate': {
      const parts: string[] = [];
      if (info.min) parts.push('min ' + info.min);
      if (info.max) parts.push('max ' + info.max);
      const range =
        info.min && info.max
          ? info.min * info.size + '–' + info.max * info.size
          : info.min
            ? info.min * info.size + '+'
            : 'up to ' + info.max * info.size;
      return parts.join(' / ') + ' per 1,000 pts (≈ ' + range + ' at this size)';
    }
  }
}

/**
 * Terse badge of a troop's effective min/max at the current game size, e.g.
 * "2–12", "8+", "≤4", "1". The full rule is available via `explainMinMax`
 * (typically shown as a tooltip). Returns undefined when unconstrained.
 */
export function minMaxBadge(troop: MinMaxSource, gameSize: number): string | undefined {
  const info = resolveMinMax(troop, gameSize);
  if (!info) return undefined;

  switch (info.kind) {
    case 'army': {
      if (info.min && info.min === info.max) return String(info.min);
      if (info.min && info.max) return info.min + '–' + info.max;
      if (info.min) return info.min + '+';
      return '≤' + info.max;
    }
    case 'elite':
      return '≤' + info.cap;
    case 'token': {
      if (/^As /.test(info.token)) return '= ' + info.token.slice(3);
      return TOKEN_BADGES[info.token] ?? info.token;
    }
    case 'rate': {
      const lo = info.min * info.size;
      const hi = info.max * info.size;
      if (info.min && info.max) return lo + '–' + hi;
      if (info.min) return lo + '+';
      return '≤' + hi;
    }
  }
}
