import {
  augends,
  prohibitedUnits,
  prohibitedUpgrades,
  requiredUnits,
  requiredUpgrades,
} from "./dependencies";
import {
  armyMax,
  asManyMax,
  eliteMax,
  halfOrNoneMax,
  scaledMax,
  upToHalf,
} from "./maximums";
import {
  allOrNone,
  armyMin,
  asManyMin,
  halfOrAll,
  halfOrMore,
  halfOrNoneMin,
  scaledMin,
} from "./minimums";
import type { Rule, RuleContext } from "./types";
import { magicItemCap, mountCap, unitUpgradeCap } from "./upgradeCaps";

/**
 * Every rule, in the order their errors are reported. Faithful port of
 * `checkValidations` (actions.js). The min rules (and likewise the max
 * rules) each require a different `min` (`max`) value, so at most one of them
 * can fire per item, matching the original else-if chains.
 */
const RULES: Rule[] = [
  armyMin,
  armyMax,
  allOrNone,
  halfOrAll,
  halfOrMore,
  halfOrNoneMin,
  asManyMin,
  scaledMin,
  eliteMax,
  halfOrNoneMax,
  upToHalf,
  asManyMax,
  scaledMax,
  magicItemCap,
  mountCap,
  unitUpgradeCap,
  augends,
  requiredUnits,
  requiredUpgrades,
  prohibitedUnits,
  prohibitedUpgrades,
];

/** The error messages one item breaks, in report order. */
export const itemErrors = (context: RuleContext): string[] => {
  const messages = RULES.map((rule) => rule(context));

  return messages.filter((message): message is string => message !== undefined);
};
