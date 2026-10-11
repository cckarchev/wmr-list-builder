import { halfDown, halfUp } from '@/core/lib/counts';
import { POINTS_PER_ARMY_SIZE } from '@/core/selectors';
import { isAsToken, perRequired, perThousandPoints } from './bounds';
import type { Rule } from './types';

export const armyMin: Rule = ({ item, label, groupNumber }) => {
  if (item.armyMin === undefined || groupNumber >= item.armyMin) {
    return undefined;
  }

  return `Minimum of ${item.armyMin} ${label} per army.`;
};

export const allOrNone: Rule = ({ item, label, required }) => {
  if (item.min !== 'All or None' || !required) {
    return undefined;
  }

  const isPartial = item.number > 0 && item.number < required.count;

  return isPartial ? perRequired('Minimum', required.count, label, required) : undefined;
};

export const halfOrAll: Rule = ({ item, label, required }) => {
  if (item.min !== 'Half or All' || !required) {
    return undefined;
  }

  const belowHalf = item.number > 0 && item.number < halfDown(required.count);
  const betweenHalfAndAll = item.number > halfUp(required.count) && item.number < required.count;

  if (!belowHalf && !betweenHalfAndAll) {
    return undefined;
  }

  return `Half or all ${required.sentence} must be upgraded to ${label}.`;
};

export const halfOrMore: Rule = ({ item, label, required }) => {
  if (item.min !== 'Half or More' || !required) {
    return undefined;
  }

  const minimum = halfDown(required.count);

  return item.number < minimum ? perRequired('Minimum', minimum, label, required) : undefined;
};

export const halfOrNoneMin: Rule = ({ item, label, required }) => {
  if (item.min !== 'Half or None' || !required) {
    return undefined;
  }

  const minimum = halfDown(required.count);
  const isBelowHalf = item.number > 0 && item.number < minimum;

  return isBelowHalf ? perRequired('Minimum', minimum, label, required) : undefined;
};

export const asManyMin: Rule = ({ item, label, required }) => {
  if (!isAsToken(item.min) || !required) {
    return undefined;
  }

  const isShort = item.number < required.count;

  return isShort ? perRequired('Minimum', required.count, label, required) : undefined;
};

/** Numeric minimums scale per 1,000 points and only apply from 1,000 points up. */
export const scaledMin: Rule = ({ item, label, groupNumber, gameSize, size }) => {
  const minimum = Number(item.min) * size;
  const applies = gameSize >= POINTS_PER_ARMY_SIZE && groupNumber < minimum;

  return applies ? perThousandPoints('Minimum', minimum, label, size) : undefined;
};
