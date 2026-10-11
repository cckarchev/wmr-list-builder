import { namesOf } from './namesOf';
import { POINTS_PER_ARMY_SIZE } from './selectors';
import type { UnitState, UnitUpgradeEntry, UpgradeState } from './storeHelpers';
import { toSentence } from './toSentence';
import { totalNumber } from './totalNumber';

/** UNIT types (getters.js COUNTABLE_UNITS / actions.js UNIT_TYPES). */
const UNIT_TYPES = [
  'Artillery',
  'Cavalry',
  'Chariot',
  'Elephant',
  'Infantry',
  'Machine',
  'Monster',
];

/** Magic-item upgrade types (actions.js MAGIC_ITEM_TYPES). */
const MAGIC_ITEM_TYPES = [
  'Device of Power',
  'Magic Standard',
  'Magic Weapon',
  'Holy Item',
  'Other Item',
];

const AS_TOKEN_PREFIX = 'As ';

/** Divisor for the "half of its unit" keyword rules. */
const HALVES = 2;

/**
 * Structural superset of the fields the rules read off an "item".
 * The item is either a UnitState or an UpgradeState; all the fields below are
 * optional on at least one of those shapes, so we model the union as a record
 * of optionals (mirroring the dynamic property access in the Vue code).
 */
export type ValidatableItem = {
  name: string;
  number: number;
  homologousUnits?: string[];
  homologousUpgrades?: string[];
  requiredUnits?: string[];
  requiredUpgrades?: string[];
  prohibitedUnits?: string[];
  prohibitedUpgrades?: string[];
  augendUnits?: string[];
  armyMin?: number;
  armyMax?: number;
  min?: number | string;
  max?: number | string;
  upgrades?: Record<string, UnitUpgradeEntry>;
};

/** The units or upgrades an item's keyword min/max is measured against. */
export interface RequiredGroup {
  count: number;
  sentence: string;
}

/** Everything a rule needs to judge one item. */
export interface RuleContext {
  item: ValidatableItem;
  /** How the item is named in messages: its id, or its whole homologous group. */
  label: string;
  /** The item's count plus its homologous items' counts. */
  groupNumber: number;
  required?: RequiredGroup;
  units: Record<string, UnitState>;
  upgrades: Record<string, UpgradeState>;
  gameSize: number;
  size: number;
}

/** A rule returns its error message, or undefined when the item passes. */
type Rule = (context: RuleContext) => string | undefined;

type Bound = 'Minimum' | 'Maximum';

const perRequired = (bound: Bound, count: number, label: string, required: RequiredGroup) =>
  `${bound} of ${count} ${label} per ${required.count} ${required.sentence}.`;

const perThousandPoints = (bound: Bound, count: number, label: string, size: number) =>
  `${bound} of ${count} ${label} per ${size},000 points.`;

const isAsToken = (value: number | string | undefined): boolean =>
  typeof value === 'string' && value.startsWith(AS_TOKEN_PREFIX);

const halfDown = ({ count }: RequiredGroup): number => Math.floor(count / HALVES);

const halfUp = ({ count }: RequiredGroup): number => Math.ceil(count / HALVES);

const armyMin: Rule = ({ item, label, groupNumber }) => {
  if (item.armyMin === undefined || groupNumber >= item.armyMin) {
    return undefined;
  }

  return `Minimum of ${item.armyMin} ${label} per army.`;
};

const armyMax: Rule = ({ item, label, groupNumber }) => {
  if (item.armyMax === undefined || groupNumber <= item.armyMax) {
    return undefined;
  }

  return `Maximum of ${item.armyMax} ${label} per army.`;
};

const allOrNone: Rule = ({ item, label, required }) => {
  if (item.min !== 'All or None' || !required) {
    return undefined;
  }

  const isPartial = item.number > 0 && item.number < required.count;

  return isPartial ? perRequired('Minimum', required.count, label, required) : undefined;
};

const halfOrAll: Rule = ({ item, label, required }) => {
  if (item.min !== 'Half or All' || !required) {
    return undefined;
  }

  const belowHalf = item.number > 0 && item.number < halfDown(required);
  const betweenHalfAndAll = item.number > halfUp(required) && item.number < required.count;

  if (!belowHalf && !betweenHalfAndAll) {
    return undefined;
  }

  return `Half or all ${required.sentence} must be upgraded to ${label}.`;
};

const halfOrMore: Rule = ({ item, label, required }) => {
  if (item.min !== 'Half or More' || !required) {
    return undefined;
  }

  const minimum = halfDown(required);

  return item.number < minimum ? perRequired('Minimum', minimum, label, required) : undefined;
};

const halfOrNoneMin: Rule = ({ item, label, required }) => {
  if (item.min !== 'Half or None' || !required) {
    return undefined;
  }

  const minimum = halfDown(required);
  const isBelowHalf = item.number > 0 && item.number < minimum;

  return isBelowHalf ? perRequired('Minimum', minimum, label, required) : undefined;
};

const asManyMin: Rule = ({ item, label, required }) => {
  if (!isAsToken(item.min) || !required) {
    return undefined;
  }

  const isShort = item.number < required.count;

  return isShort ? perRequired('Minimum', required.count, label, required) : undefined;
};

/** Numeric minimums scale per 1,000 points and only apply from 1,000 points up. */
const scaledMin: Rule = ({ item, label, groupNumber, gameSize, size }) => {
  const minimum = Number(item.min) * size;
  const applies = gameSize >= POINTS_PER_ARMY_SIZE && groupNumber < minimum;

  return applies ? perThousandPoints('Minimum', minimum, label, size) : undefined;
};

/** `elite`: at most one per 1,000 points after the first. */
const eliteMax: Rule = ({ item, label, groupNumber, size }) => {
  const maximum = size - 1;
  const applies = item.max === 'elite' && groupNumber > maximum;

  return applies ? perThousandPoints('Maximum', maximum, label, size) : undefined;
};

const halfOrNoneMax: Rule = ({ item, label, required }) => {
  if (item.max !== 'Half or None' || !required) {
    return undefined;
  }

  const maximum = halfUp(required);

  return item.number > maximum ? perRequired('Maximum', maximum, label, required) : undefined;
};

const upToHalf: Rule = ({ item, label, required }) => {
  if (item.max !== 'Up to Half' || !required) {
    return undefined;
  }

  const maximum = halfDown(required);
  const isOverHalf = item.number > 0 && item.number > maximum;

  return isOverHalf ? perRequired('Maximum', maximum, label, required) : undefined;
};

const asManyMax: Rule = ({ item, label, required }) => {
  if (!isAsToken(item.max) || !required) {
    return undefined;
  }

  const isOver = item.number > required.count;

  return isOver ? perRequired('Maximum', required.count, label, required) : undefined;
};

const scaledMax: Rule = ({ item, label, groupNumber, size }) => {
  const maximum = Number(item.max) * size;

  return groupNumber > maximum ? perThousandPoints('Maximum', maximum, label, size) : undefined;
};

/** Sum the per-unit counts of `item`'s upgrades whose type matches `match`. */
const countUpgradesOfType = (
  item: ValidatableItem,
  upgrades: Record<string, UpgradeState>,
  match: (type: string) => boolean,
): number => {
  const entries = Object.entries(item.upgrades ?? {});
  const matching = entries.filter(([id]) => match(upgrades[id].type));

  return matching.reduce((count, [, entry]) => count + entry.number, 0);
};

/** An item cannot carry more upgrades of a kind than it has models. */
const upgradeCap =
  (noun: string, match: (type: string) => boolean): Rule =>
  ({ item, label, upgrades }) => {
    const carried = countUpgradesOfType(item, upgrades, match);

    if (item.number >= carried) {
      return undefined;
    }

    const plural = item.number > 1 ? 's' : '';

    return `${item.number} ${label} may only have ${item.number} ${noun}${plural}.`;
  };

const magicItemCap = upgradeCap('magic item', (type) => MAGIC_ITEM_TYPES.includes(type));

const mountCap = upgradeCap('mount', (type) => type.endsWith('Mount'));

const unitUpgradeCap = upgradeCap('upgrade', (type) => UNIT_TYPES.includes(type));

/** Units added to other units need at least as many of those. */
const augends: Rule = ({ item, label, units }) => {
  if (!item.augendUnits) {
    return undefined;
  }

  const available = totalNumber(item.augendUnits, units);

  if (item.number <= available) {
    return undefined;
  }

  const augendNames = toSentence(namesOf(item.augendUnits, units));

  return `${item.number} ${label} requires at least ${item.number} ${augendNames}.`;
};

const requires = (
  ids: string[] | undefined,
  pool: Record<string, { name: string; number: number }>,
  label: string,
) => {
  if (!ids) {
    return undefined;
  }

  const noneTaken = totalNumber(ids, pool) === 0;

  return noneTaken ? `${label} must be taken with ${toSentence(namesOf(ids, pool))}.` : undefined;
};

const prohibits = (
  ids: string[] | undefined,
  pool: Record<string, { name: string; number: number }>,
  label: string,
) => {
  if (!ids) {
    return undefined;
  }

  const anyTaken = totalNumber(ids, pool) > 0;

  return anyTaken ? `${label} cannot be taken with ${toSentence(namesOf(ids, pool))}.` : undefined;
};

const requiredUnits: Rule = ({ item, label, units }) =>
  item.number > 0 ? requires(item.requiredUnits, units, label) : undefined;

const requiredUpgrades: Rule = ({ item, label, upgrades }) =>
  item.number > 0 ? requires(item.requiredUpgrades, upgrades, label) : undefined;

const prohibitedUnits: Rule = ({ item, label, units }) =>
  item.number > 0 ? prohibits(item.prohibitedUnits, units, label) : undefined;

const prohibitedUpgrades: Rule = ({ item, label, upgrades }) =>
  item.number > 0 ? prohibits(item.prohibitedUpgrades, upgrades, label) : undefined;

/**
 * Every rule, in the order their errors are reported. Faithful port of
 * `checkValidations` (actions.js 194-340). The min rules (and likewise the max
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
