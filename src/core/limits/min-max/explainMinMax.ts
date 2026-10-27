import {
  type ArmyInfo,
  type EliteInfo,
  isExact,
  linkedUnit,
  MIN_MAX_TOKENS,
  type MinMaxSource,
  type RateInfo,
  resolveMinMax,
  type TokenInfo,
} from "./minMaxInfo";

/**
 * Plain-language phrasing for the keyword tokens the validation rules enforce.
 */
const TOKEN_PHRASES: Record<string, string> = {
  [MIN_MAX_TOKENS.allOrNone]: "all or none of its unit",
  [MIN_MAX_TOKENS.halfOrAll]: "half or all of its unit",
  [MIN_MAX_TOKENS.halfOrMore]: "half or more of its unit",
  [MIN_MAX_TOKENS.halfOrNone]: "half or none of its unit",
  [MIN_MAX_TOKENS.upToHalf]: "up to half of its unit",
};

/** "min 1 / max 6", leaving out whichever bound is unset. */
const describeBounds = (min?: number, max?: number): string => {
  const parts: string[] = [];

  if (min) {
    parts.push(`min ${min}`);
  }

  if (max) {
    parts.push(`max ${max}`);
  }

  return parts.join(" / ");
};

/** The rate scaled to the current game size, e.g. "2-12", "8+" or "up to 4". */
const describeRateRange = ({ min, max, size }: RateInfo): string => {
  if (min && max) {
    return `${min * size}-${max * size}`;
  }

  if (min) {
    return `${min * size}+`;
  }

  return `up to ${max * size}`;
};

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
 * "min 1 / max 6 per 1,000 pts (≈ 2-12 at this size)". Used as the hover
 * tooltip. Returns undefined when the troop carries no constraints.
 */
export const explainMinMax = (
  troop: MinMaxSource,
  gameSize: number,
): string | undefined => {
  const info = resolveMinMax(troop, gameSize);

  switch (info?.kind) {
    case "army":
      return explainArmy(info);
    case "elite":
      return explainElite(info);
    case "token":
      return explainToken(info);
    case "rate":
      return explainRate(info);
    default:
      return undefined;
  }
};
