import { pointsCost } from '@/core/army-state/armyTotals';
import type { ArmyPools, UnitState, UpgradeState } from '@/core/army-state/types';
import { formatPoints } from '@/core/lib/quantities';
import { armySize } from '@/core/limits/armySize';
import type { ValidationError } from '@/data/types';
import { namesOf } from './namesOf';
import { itemErrors } from './rules/rules';
import type { RequiredGroup, ValidatableItem } from './rules/types';
import { toSentence } from './toSentence';
import { totalNumber } from './totalNumber';

type Pool = Record<string, { name: string; number: number }>;

/** The listed ids of a pool, with their names and how many are taken in all. */
const poolGroup = (ids: string[], pool: Pool) => ({
  ids,
  names: namesOf(ids, pool),
  count: totalNumber(ids, pool),
});

/** Items that count together with this one toward its limits. */
const homologousGroup = (item: ValidatableItem, { units, upgrades }: ArmyPools) => {
  if (item.homologousUnits) {
    return poolGroup(item.homologousUnits, units);
  }

  if (item.homologousUpgrades) {
    return poolGroup(item.homologousUpgrades, upgrades);
  }

  return undefined;
};

const toRequired = ({ names, count }: ReturnType<typeof poolGroup>): RequiredGroup => ({
  count,
  sentence: toSentence(names),
});

const requiredGroup = (
  item: ValidatableItem,
  { units, upgrades }: ArmyPools,
): RequiredGroup | undefined => {
  if (item.requiredUnits) {
    return toRequired(poolGroup(item.requiredUnits, units));
  }

  if (item.requiredUpgrades) {
    return toRequired(poolGroup(item.requiredUpgrades, upgrades));
  }

  return undefined;
};

/**
 * Port of `checkValidations` (actions.js): the errors for one item (a
 * unit or an upgrade), attributed to it and to its homologous items.
 */
const checkItem = (
  itemId: string,
  item: ValidatableItem,
  pools: ArmyPools,
  gameSize: number,
): ValidationError[] => {
  const homologous = homologousGroup(item, pools);
  const homologousIds = homologous?.ids ?? [];

  // Homologous items are named together as one group in messages.
  const label = homologous ? toSentence([item.name, ...homologous.names]) : item.name;
  const targets = [itemId, ...homologousIds];

  const messages = itemErrors({
    item,
    label,
    groupNumber: item.number + (homologous?.count ?? 0),
    required: requiredGroup(item, pools),
    ...pools,
    gameSize,
    size: armySize(gameSize),
  });

  return messages.map((message) => ({ targets, message }));
};

/** List-level points ceiling, attributed to no unit in particular. */
const overCapError = (units: Record<string, UnitState>, gameSize: number): ValidationError[] => {
  const excess = pointsCost({ units }) - gameSize;

  if (excess <= 0) {
    return [];
  }

  const cap = formatPoints(gameSize);

  return [{ targets: [], message: `List is ${excess} points over the ${cap} cap.` }];
};

/**
 * Pure port of the Vue `validate` action (actions.js): checks every
 * unit then every upgrade and returns the accumulated errors, headed by the
 * points-cap error when the list is over.
 */
export const validate = (
  units: Record<string, UnitState>,
  upgrades: Record<string, UpgradeState>,
  gameSize: number,
): ValidationError[] => {
  const pools = { units, upgrades };
  const unitErrors = Object.entries(units).flatMap(([id, unit]) =>
    checkItem(id, unit, pools, gameSize),
  );
  const upgradeErrors = Object.entries(upgrades).flatMap(([id, upgrade]) =>
    checkItem(id, upgrade, pools, gameSize),
  );

  return [...overCapError(units, gameSize), ...unitErrors, ...upgradeErrors];
};
