import { armySize } from "../armySize";
import { eliteCap } from "../eliteCap";

/** Minimal shape carrying min/max constraints, satisfied by units and upgrades. */
export interface MinMaxSource {
  armyMin?: number;
  armyMax?: number;
  min?: number | string;
  max?: number | string;
}

/** Keyword values the army data puts in `min` and `max`, read by the rules and the badges. */
export const MIN_MAX_TOKENS = {
  allOrNone: "All or None",
  halfOrAll: "Half or All",
  halfOrMore: "Half or More",
  halfOrNone: "Half or None",
  upToHalf: "Up to Half",
  elite: "elite",
} as const;

/** Prefix of "As X" tokens, which tie a troop's count to another unit's. */
export const AS_TOKEN_PREFIX = "As ";

/**
 * Structured reading of a troop's min/max constraints, resolved against the
 * current game size. `explainMinMax` (full phrase) and `minMaxBadge` (terse)
 * are two renderings of the same descriptor, so the precedence rules live in
 * one place. Mirrors the rules enforced in validation/rules.
 */
type MinMaxInfo =
  | { kind: "army"; min?: number; max?: number }
  | { kind: "elite"; cap: number }
  | { kind: "token"; token: string }
  | { kind: "rate"; min: number; max: number; size: number };

export type ArmyInfo = Extract<MinMaxInfo, { kind: "army" }>;
export type EliteInfo = Extract<MinMaxInfo, { kind: "elite" }>;
export type TokenInfo = Extract<MinMaxInfo, { kind: "token" }>;
export type RateInfo = Extract<MinMaxInfo, { kind: "rate" }>;

/** The unit an "As X" token ties the troop to, or undefined for keyword tokens. */
export const linkedUnit = (token: string): string | undefined => {
  if (!token.startsWith(AS_TOKEN_PREFIX)) {
    return undefined;
  }

  return token.slice(AS_TOKEN_PREFIX.length);
};

/** An absolute per-army count with matching bounds, e.g. "exactly 1". */
export const isExact = ({ min, max }: ArmyInfo): boolean =>
  Boolean(min) && min === max;

export const resolveMinMax = (
  troop: MinMaxSource,
  gameSize: number,
): MinMaxInfo | undefined => {
  // Absolute per-army counts take precedence.
  if (troop.armyMin || troop.armyMax) {
    return { kind: "army", min: troop.armyMin, max: troop.armyMax };
  }

  const size = armySize(gameSize);
  const { min, max } = troop;

  // `elite` lives in the max field and resolves to an absolute cap.
  if (max === MIN_MAX_TOKENS.elite) {
    return { kind: "elite", cap: eliteCap(size) };
  }

  // Other keyword tokens are relative to the unit being upgraded.
  if (typeof min === "string") {
    return { kind: "token", token: min };
  }

  if (typeof max === "string") {
    return { kind: "token", token: max };
  }

  // Numeric per-1,000-points scaling.
  const minN = min ?? 0;
  const maxN = max ?? 0;

  if (!minN && !maxN) {
    return undefined;
  }

  return { kind: "rate", min: minN, max: maxN, size };
};
