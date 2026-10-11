import {
  type ArmyInfo,
  type EliteInfo,
  isExact,
  linkedUnit,
  type MinMaxSource,
  type RateInfo,
  resolveMinMax,
  type TokenInfo,
} from './minMaxInfo';

/** Terse forms of the keyword tokens, for the at-a-glance badge. */
const TOKEN_BADGES: Record<string, string> = {
  'All or None': 'all or none',
  'Half or All': 'half or all',
  'Half or More': 'half+',
  'Half or None': 'half or none',
  'Up to Half': '≤ half',
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
