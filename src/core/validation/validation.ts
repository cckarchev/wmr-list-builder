import { armySize, pointsCost } from '@/core/selectors';
import type { UnitState, UpgradeState } from '@/core/storeHelpers';
import type { ValidationError } from '@/data/types';
import { namesOf } from './namesOf';
import { itemErrors } from './rules/rules';
import type { RequiredGroup, ValidatableItem } from './rules/types';
import { toSentence } from './toSentence';
import { totalNumber } from './totalNumber';

interface Pools {
  units: Record<string, UnitState>;
  upgrades: Record<string, UpgradeState>;
}

/** Items that count together with this one toward its limits. */
const homologousGroup = (item: ValidatableItem, { units, upgrades }: Pools) => {
  if (item.homologousUnits) {
    const ids = item.homologousUnits;

    return { ids, names: namesOf(ids, units), count: totalNumber(ids, units) };
  }

  if (item.homologousUpgrades) {
    const ids = item.homologousUpgrades;

    return { ids, names: namesOf(ids, upgrades), count: totalNumber(ids, upgrades) };
  }

  return undefined;
};

const requiredGroup = (
  item: ValidatableItem,
  { units, upgrades }: Pools,
): RequiredGroup | undefined => {
  if (item.requiredUnits) {
    return {
      count: totalNumber(item.requiredUnits, units),
      sentence: toSentence(namesOf(item.requiredUnits, units)),
    };
  }

  if (item.requiredUpgrades) {
    return {
      count: totalNumber(item.requiredUpgrades, upgrades),
      sentence: toSentence(namesOf(item.requiredUpgrades, upgrades)),
    };
  }

  return undefined;
};

/**
 * Port of `checkValidations` (actions.js 194-340): the errors for one item (a
 * unit or an upgrade), attributed to it and to its homologous items.
 */
const checkItem = (
  itemId: string,
  item: ValidatableItem,
  pools: Pools,
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

  const cap = gameSize.toLocaleString('en-US');

  return [{ targets: [], message: `List is ${excess} points over the ${cap} cap.` }];
};

/**
 * Pure port of the Vue `validate` action (actions.js 173-183): checks every
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
    checkItem(id, unit as ValidatableItem, pools, gameSize),
  );
  const upgradeErrors = Object.entries(upgrades).flatMap(([id, upgrade]) =>
    checkItem(id, upgrade as ValidatableItem, pools, gameSize),
  );

  return [...overCapError(units, gameSize), ...unitErrors, ...upgradeErrors];
};
