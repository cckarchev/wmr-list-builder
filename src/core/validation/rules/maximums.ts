import { halfDown, halfUp } from '@/core/lib/counts';
import { eliteCap } from '@/core/limits/eliteCap';
import { isAsToken, perRequired, perThousandPoints } from './bounds';
import type { Rule } from './types';

export const armyMax: Rule = ({ item, label, groupNumber }) => {
  if (item.armyMax === undefined || groupNumber <= item.armyMax) {
    return undefined;
  }

  return `Maximum of ${item.armyMax} ${label} per army.`;
};

/** `elite`: at most one per 1,000 points after the first. */
export const eliteMax: Rule = ({ item, label, groupNumber, size }) => {
  const maximum = eliteCap(size);
  const applies = item.max === 'elite' && groupNumber > maximum;

  return applies ? perThousandPoints('Maximum', maximum, label, size) : undefined;
};

export const halfOrNoneMax: Rule = ({ item, label, required }) => {
  if (item.max !== 'Half or None' || !required) {
    return undefined;
  }

  const maximum = halfUp(required.count);

  return item.number > maximum ? perRequired('Maximum', maximum, label, required) : undefined;
};

export const upToHalf: Rule = ({ item, label, required }) => {
  if (item.max !== 'Up to Half' || !required) {
    return undefined;
  }

  const maximum = halfDown(required.count);
  const isOverHalf = item.number > 0 && item.number > maximum;

  return isOverHalf ? perRequired('Maximum', maximum, label, required) : undefined;
};

export const asManyMax: Rule = ({ item, label, required }) => {
  if (!isAsToken(item.max) || !required) {
    return undefined;
  }

  const isOver = item.number > required.count;

  return isOver ? perRequired('Maximum', required.count, label, required) : undefined;
};

export const scaledMax: Rule = ({ item, label, groupNumber, size }) => {
  const maximum = Number(item.max) * size;

  return groupNumber > maximum ? perThousandPoints('Maximum', maximum, label, size) : undefined;
};
