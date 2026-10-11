import { namesOf } from '../namesOf';
import { toSentence } from '../toSentence';
import { totalNumber } from '../totalNumber';
import type { Rule } from './types';

type Pool = Record<string, { name: string; number: number }>;

/** Units added to other units need at least as many of those. */
export const augends: Rule = ({ item, label, units }) => {
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

const requires = (ids: string[] | undefined, pool: Pool, label: string) => {
  if (!ids) {
    return undefined;
  }

  const noneTaken = totalNumber(ids, pool) === 0;

  return noneTaken ? `${label} must be taken with ${toSentence(namesOf(ids, pool))}.` : undefined;
};

const prohibits = (ids: string[] | undefined, pool: Pool, label: string) => {
  if (!ids) {
    return undefined;
  }

  const anyTaken = totalNumber(ids, pool) > 0;

  return anyTaken ? `${label} cannot be taken with ${toSentence(namesOf(ids, pool))}.` : undefined;
};

export const requiredUnits: Rule = ({ item, label, units }) =>
  item.number > 0 ? requires(item.requiredUnits, units, label) : undefined;

export const requiredUpgrades: Rule = ({ item, label, upgrades }) =>
  item.number > 0 ? requires(item.requiredUpgrades, upgrades, label) : undefined;

export const prohibitedUnits: Rule = ({ item, label, units }) =>
  item.number > 0 ? prohibits(item.prohibitedUnits, units, label) : undefined;

export const prohibitedUpgrades: Rule = ({ item, label, upgrades }) =>
  item.number > 0 ? prohibits(item.prohibitedUpgrades, upgrades, label) : undefined;
