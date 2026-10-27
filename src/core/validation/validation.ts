import { pointsCost } from "@/core/army-state/armyTotals";
import type {
  ArmyPools,
  UnitState,
  UpgradeState,
} from "@/core/army-state/types";
import { formatPoints } from "@/core/lib/quantities";
import { armySize } from "@/core/limits/armySize";
import type { ValidationError } from "@/data/types";
import { errorKey } from "./errorTargets";
import { namesOf } from "./namesOf";
import { itemErrors } from "./rules/rules";
import type { RequiredGroup, ValidatableItem } from "./rules/types";
import { toSentence } from "./toSentence";
import { totalNumber } from "./totalNumber";

type Pool = Record<string, { name: string; number: number }>;

/** The listed ids of a pool, with their names and how many are taken in all. */
const poolGroup = (ids: string[], pool: Pool) => ({
  ids,
  names: namesOf(ids, pool),
  count: totalNumber(ids, pool),
});

/**
 * The ids sorted by where the pool lists them, so a group reads the same from
 * any member.
 */
const inPoolOrder = (ids: string[], pool: Pool): string[] => {
  const listed = Object.keys(pool);
  const placeOf = (id: string) => listed.indexOf(id);

  return [...ids].sort((a, b) => placeOf(a) - placeOf(b));
};

/**
 * The ids an item lists as counting together with it, and the pool they live
 * in.
 */
const homologousIds = (
  item: ValidatableItem,
  { units, upgrades }: ArmyPools,
) => {
  if (item.homologousUnits) {
    return { ids: item.homologousUnits, pool: units };
  }

  if (item.homologousUpgrades) {
    return { ids: item.homologousUpgrades, pool: upgrades };
  }

  return undefined;
};

/**
 * The items that count together toward this one's limits, itself included, in
 * their listed order, and how many of the others are taken.
 */
const homologousGroup = (
  itemId: string,
  item: ValidatableItem,
  pools: ArmyPools,
) => {
  const homologous = homologousIds(item, pools);

  if (!homologous) {
    return undefined;
  }

  const { ids, pool } = homologous;
  const memberIds = inPoolOrder([itemId, ...ids], pool);

  return {
    ids: memberIds,
    names: namesOf(memberIds, pool),
    othersCount: totalNumber(ids, pool),
  };
};

const toRequired = ({
  names,
  count,
}: ReturnType<typeof poolGroup>): RequiredGroup => ({
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
  const homologous = homologousGroup(itemId, item, pools);

  // Homologous items are named together as one group in messages.
  const label = homologous ? toSentence(homologous.names) : item.name;
  const targets = homologous?.ids ?? [itemId];

  const messages = itemErrors({
    item,
    label,
    groupNumber: item.number + (homologous?.othersCount ?? 0),
    required: requiredGroup(item, pools),
    ...pools,
    gameSize,
    size: armySize(gameSize),
  });

  return messages.map((message) => ({ targets, message }));
};

/** List-level points ceiling, attributed to no unit in particular. */
const overCapError = (
  units: Record<string, UnitState>,
  gameSize: number,
): ValidationError[] => {
  const excess = pointsCost({ units }) - gameSize;

  if (excess <= 0) {
    return [];
  }

  const cap = formatPoints(gameSize);

  return [
    { targets: [], message: `List is ${excess} points over the ${cap} cap.` },
  ];
};

/**
 * Each error once: every member of a homologous group reports the group's
 * shared limit, in the same words and naming the same items in the same order.
 * Unrelated items that only share a name keep their own errors.
 */
const dropRepeated = (errors: ValidationError[]): ValidationError[] => {
  const byKey = new Map(errors.map((error) => [errorKey(error), error]));

  return [...byKey.values()];
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

  return dropRepeated([
    ...overCapError(units, gameSize),
    ...unitErrors,
    ...upgradeErrors,
  ]);
};
