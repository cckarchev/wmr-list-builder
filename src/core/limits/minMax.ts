import { armySize } from '@/core/selectors';

/** Minimal shape carrying min/max constraints, satisfied by units and upgrades. */
export interface MinMaxSource {
  armyMin?: number;
  armyMax?: number;
  min?: number | string;
  max?: number | string;
}

/** Prefix of "As X" tokens, which tie a troop's count to another unit's. */
const AS_TOKEN_PREFIX = 'As ';

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

type ArmyInfo = Extract<MinMaxInfo, { kind: 'army' }>;
type EliteInfo = Extract<MinMaxInfo, { kind: 'elite' }>;
type TokenInfo = Extract<MinMaxInfo, { kind: 'token' }>;
type RateInfo = Extract<MinMaxInfo, { kind: 'rate' }>;

/** "min 1 / max 6", leaving out whichever bound is unset. */
const describeBounds = (min?: number, max?: number): string => {
  const parts: string[] = [];

  if (min) {
    parts.push(`min ${min}`);
  }

  if (max) {
    parts.push(`max ${max}`);
  }

  return parts.join(' / ');
};

/** "2–12", "8+" or "≤4"; a bound that is unset (or zero) is left out. */
const badgeRange = (low: number | undefined, high: number | undefined): string => {
  if (low && high) {
    return `${low}–${high}`;
  }

  if (low) {
    return `${low}+`;
  }

  return `≤${high}`;
};

/** The unit an "As X" token ties the troop to, or undefined for keyword tokens. */
const linkedUnit = (token: string): string | undefined => {
  if (!token.startsWith(AS_TOKEN_PREFIX)) {
    return undefined;
  }

  return token.slice(AS_TOKEN_PREFIX.length);
};

/** The rate scaled to the current game size, e.g. "2–12", "8+" or "up to 4". */
const describeRateRange = ({ min, max, size }: RateInfo): string => {
  if (min && max) {
    return `${min * size}–${max * size}`;
  }

  if (min) {
    return `${min * size}+`;
  }

  return `up to ${max * size}`;
};

const resolveMinMax = (troop: MinMaxSource, gameSize: number): MinMaxInfo | undefined => {
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
  if (typeof min === 'string') {
    return { kind: 'token', token: min };
  }

  if (typeof max === 'string') {
    return { kind: 'token', token: max };
  }

  // Numeric per-1,000-points scaling.
  const minN = min ?? 0;
  const maxN = max ?? 0;

  if (!minN && !maxN) {
    return undefined;
  }

  return { kind: 'rate', min: minN, max: maxN, size };
};

const isExact = ({ min, max }: ArmyInfo): boolean => Boolean(min) && min === max;

const explainArmy = (info: ArmyInfo): string => {
  if (isExact(info)) {
    return `exactly ${info.min} per army`;
  }

  return `${describeBounds(info.min, info.max)} per army`;
};

const explainElite = ({ cap }: EliteInfo): string =>
  `max ${cap} (elite: 1 per 1,000 pts after the first)`;

const explainToken = ({ token }: TokenInfo): string => {
  const unit = linkedUnit(token);

  if (unit) {
    return `same number as ${unit}`;
  }

  return TOKEN_PHRASES[token] ?? token;
};

const explainRate = (info: RateInfo): string => {
  const bounds = describeBounds(info.min, info.max);
  const range = describeRateRange(info);

  return `${bounds} per 1,000 pts (≈ ${range} at this size)`;
};

/**
 * Full plain-language phrase for a troop's min/max, e.g.
 * "min 1 / max 6 per 1,000 pts (≈ 2–12 at this size)". Used as the hover
 * tooltip. Returns undefined when the troop carries no constraints.
 */
export const explainMinMax = (troop: MinMaxSource, gameSize: number): string | undefined => {
  const info = resolveMinMax(troop, gameSize);

  switch (info?.kind) {
    case 'army':
      return explainArmy(info);
    case 'elite':
      return explainElite(info);
    case 'token':
      return explainToken(info);
    case 'rate':
      return explainRate(info);
    default:
      return undefined;
  }
};

const armyBadge = (info: ArmyInfo): string => {
  if (isExact(info)) {
    return String(info.min);
  }

  return badgeRange(info.min, info.max);
};

const eliteBadge = ({ cap }: EliteInfo): string => `≤${cap}`;

const tokenBadge = ({ token }: TokenInfo): string => {
  const unit = linkedUnit(token);

  if (unit) {
    return `= ${unit}`;
  }

  return TOKEN_BADGES[token] ?? token;
};

const rateBadge = ({ min, max, size }: RateInfo): string => badgeRange(min * size, max * size);

/**
 * Terse badge of a troop's effective min/max at the current game size, e.g.
 * "2–12", "8+", "≤4", "1". The full rule is available via `explainMinMax`
 * (typically shown as a tooltip). Returns undefined when unconstrained.
 */
export const minMaxBadge = (troop: MinMaxSource, gameSize: number): string | undefined => {
  const info = resolveMinMax(troop, gameSize);

  switch (info?.kind) {
    case 'army':
      return armyBadge(info);
    case 'elite':
      return eliteBadge(info);
    case 'token':
      return tokenBadge(info);
    case 'rate':
      return rateBadge(info);
    default:
      return undefined;
  }
};
