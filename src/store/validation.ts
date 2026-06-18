import type { ValidationError } from '../data/types';
import type { UnitState, UpgradeState, UnitUpgradeEntry } from './storeHelpers';
import { pointsCost, armySize } from './selectors';
import { toSentence } from './toSentence';

/** UNIT types (getters.js COUNTABLE_UNITS / actions.js UNIT_TYPES). */
const UNIT_TYPES = ['Artillery', 'Cavalry', 'Chariot', 'Elephant', 'Infantry', 'Machine', 'Monster'];

/** Magic-item upgrade types (actions.js MAGIC_ITEM_TYPES). */
const MAGIC_ITEM_TYPES = ['Device of Power', 'Magic Standard', 'Magic Weapon', 'Holy Item', 'Other Item'];

/**
 * Structural superset of the fields `checkValidations` reads off an "item".
 * The item is either a UnitState or an UpgradeState; all the fields below are
 * optional on at least one of those shapes, so we model the union as a record
 * of optionals (mirroring the dynamic property access in the Vue code).
 */
type ValidatableItem = {
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

/**
 * Faithful 1:1 port of `checkValidations` (actions.js 194-340). Pushes a
 * `{ message }` for each violation found on `item` (a unit or an upgrade).
 */
function checkValidations(
  id: string,
  item: ValidatableItem,
  units: Record<string, UnitState>,
  upgrades: Record<string, UpgradeState>,
  points: number,
  size: number,
  errors: ValidationError[],
): void {
  let homologousCount = 0;
  let requiredCount: number | undefined;
  let requiredSentence: string | undefined;

  if (item.homologousUnits) {
    homologousCount = item.homologousUnits.reduce(
      (count, unitID) => count + units[unitID].number,
      homologousCount,
    );
    id = toSentence([id].concat(item.homologousUnits));
  } else if (item.homologousUpgrades) {
    homologousCount = item.homologousUpgrades.reduce(
      (count, upgradeID) => count + upgrades[upgradeID].number,
      homologousCount,
    );
    id = toSentence([id].concat(item.homologousUpgrades));
  }

  if (item.requiredUnits) {
    requiredCount = item.requiredUnits.reduce((count, unitID) => count + units[unitID].number, 0);
    requiredSentence = toSentence(item.requiredUnits);
  } else if (item.requiredUpgrades) {
    requiredCount = item.requiredUpgrades.reduce(
      (count, upgradeID) => count + upgrades[upgradeID].number,
      0,
    );
    requiredSentence = toSentence(item.requiredUpgrades);
  }

  // army min
  if (item.number + homologousCount < (item.armyMin as number)) {
    errors.push({ message: 'Minimum of ' + item.armyMin + ' ' + id + ' per army.' });
  }

  // army max
  if (item.number + homologousCount > (item.armyMax as number)) {
    errors.push({ message: 'Maximum of ' + item.armyMax + ' ' + id + ' per army.' });
  }

  // min
  if (item.min === 'All or None' &&
      item.number > 0 &&
      item.number < (requiredCount as number)) {
    errors.push({ message: 'Minimum of ' + requiredCount + ' ' + id + ' per ' + requiredCount + ' ' + requiredSentence + '.' });
  } else if (item.min === 'Half or All' &&
             (item.number > 0 &&
              item.number < Math.floor((requiredCount as number) / 2) ||
              item.number > Math.ceil((requiredCount as number) / 2) &&
              item.number < (requiredCount as number))) {
    errors.push({ message: 'Half or all ' + requiredSentence + ' must be upgraded to ' + id + '.' });
  } else if (item.min === 'Half or More' &&
             item.number < Math.floor((requiredCount as number) / 2)) {
    errors.push({ message: 'Minimum of ' + Math.floor((requiredCount as number) / 2) + ' ' + id + ' per ' + requiredCount + ' ' + requiredSentence + '.' });
  } else if (item.min === 'Half or None' &&
      item.number > 0 &&
      item.number < Math.floor((requiredCount as number) / 2)) {
    errors.push({ message: 'Minimum of ' + Math.floor((requiredCount as number) / 2) + ' ' + id + ' per ' + requiredCount + ' ' + requiredSentence + '.' });
  } else if (/^As /.test(item.min as string) &&
             item.number < (requiredCount as number)) {
    errors.push({ message: 'Minimum of ' + requiredCount + ' ' + id + ' per ' + requiredCount + ' ' + requiredSentence + '.' });
  } else if (points >= 1000 &&
             item.number + homologousCount < (item.min as number) * size) {
    errors.push({ message: 'Minimum of ' + (item.min as number) * size + ' ' + id + ' per ' + size + ',000 points.' });
  }

  // max
  if (item.max === 'elite' &&
      item.number + homologousCount > size - 1) {
    errors.push({ message: 'Maximum of ' + (size - 1) + ' ' + id + ' per ' + size + ',000 points.' });
  } else if (item.max === 'Half or None' &&
             item.number > Math.ceil((requiredCount as number) / 2)) {
    errors.push({ message: 'Maximum of ' + Math.ceil((requiredCount as number) / 2) + ' ' + id + ' per ' + requiredCount + ' ' + requiredSentence + '.' });
  } else if (item.max === 'Up to Half' &&
             item.number > 0 &&
             item.number > Math.floor((requiredCount as number) / 2)) {
    errors.push({ message: 'Maximum of ' + Math.floor((requiredCount as number) / 2) + ' ' + id + ' per ' + requiredCount + ' ' + requiredSentence + '.' });
  } else if (/^As /.test(item.max as string) &&
             item.number > (requiredCount as number)) {
    errors.push({ message: 'Maximum of ' + requiredCount + ' ' + id + ' per ' + requiredCount + ' ' + requiredSentence + '.' });
  } else if (item.number + homologousCount > (item.max as number) * size) {
    errors.push({ message: 'Maximum of ' + (item.max as number) * size + ' ' + id + ' per ' + size + ',000 points.' });
  }

  // magic items upgrades can't exceed number
  if (item.upgrades &&
      item.number < Object.keys(item.upgrades).reduce((count, upgradeID) => {
        if (MAGIC_ITEM_TYPES.includes(upgrades[upgradeID].type)) {
          count += item.upgrades![upgradeID].number;
        }

        return count;
      }, 0)) {
    errors.push({ message: item.number + ' ' + id + ' may only have ' + item.number + ' magic item' + (item.number > 1 ? 's.' : '.') });
  }

  // mounts upgrades can't exceed number
  if (item.upgrades &&
      item.number < Object.keys(item.upgrades).reduce((count, upgradeID) => {
        if (/Mount$/.test(upgrades[upgradeID].type)) {
          count += item.upgrades![upgradeID].number;
        }

        return count;
      }, 0)) {
    errors.push({ message: item.number + ' ' + id + ' may only have ' + item.number + ' mount' + (item.number > 1 ? 's.' : '.') });
  }

  // unit upgrades can't exceed number
  if (item.upgrades &&
      item.number < Object.keys(item.upgrades).reduce((count, upgradeID) => {
        if (UNIT_TYPES.includes(upgrades[upgradeID].type)) {
          count += item.upgrades![upgradeID].number;
        }

        return count;
      }, 0)) {
    errors.push({ message: item.number + ' ' + id + ' may only have ' + item.number + ' upgrade' + (item.number > 1 ? 's.' : '.') });
  }

  // units added to other units/upgrades
  if (item.augendUnits &&
      item.number > item.augendUnits.reduce((count, unitID) => count + units[unitID].number, 0)) {
    errors.push({ message: item.number + ' ' + id + ' requires at least ' + item.number + ' ' + toSentence(item.augendUnits) + '.' });
  }

  // units required by a unit/upgrade
  if (item.requiredUnits &&
      item.number > 0 &&
      1 > item.requiredUnits.reduce((count, unitID) => count + units[unitID].number, 0)) {
    errors.push({ message: id + ' must be taken with ' + toSentence(item.requiredUnits) + '.' });
  }

  // upgrades required by a unit/upgrade
  if (item.requiredUpgrades &&
      item.number > 0 &&
      1 > item.requiredUpgrades.reduce((count, upgradeID) => count + upgrades[upgradeID].number, 0)) {
    errors.push({ message: id + ' must be taken with ' + toSentence(item.requiredUpgrades) + '.' });
  }

  // units prohibited by a unit/upgrade
  if (item.prohibitedUnits &&
      item.number > 0 &&
      0 < item.prohibitedUnits.reduce((count, unitID) => count + units[unitID].number, 0)) {
    errors.push({ message: id + ' cannot be taken with ' + toSentence(item.prohibitedUnits) + '.' });
  }

  // upgrades prohibited by a unit/upgrade
  if (item.prohibitedUpgrades &&
      item.number > 0 &&
      0 < item.prohibitedUpgrades.reduce((count, upgradeID) => count + upgrades[upgradeID].number, 0)) {
    errors.push({ message: id + ' cannot be taken with ' + toSentence(item.prohibitedUpgrades) + '.' });
  }
}

/**
 * Pure port of the Vue `validate` action (actions.js 173-183): runs
 * `checkValidations` over every unit then every upgrade and returns the
 * accumulated errors (the Vue action first commits CLEAR_ERRORS, here we just
 * start from an empty array).
 */
export function validate(
  units: Record<string, UnitState>,
  upgrades: Record<string, UpgradeState>,
): ValidationError[] {
  const errors: ValidationError[] = [];
  const points = pointsCost({ units });
  const size = armySize(points);

  for (const unit in units) {
    checkValidations(unit, units[unit] as ValidatableItem, units, upgrades, points, size, errors);
  }

  for (const upgrade in upgrades) {
    checkValidations(upgrade, upgrades[upgrade] as ValidatableItem, units, upgrades, points, size, errors);
  }

  return errors;
}
