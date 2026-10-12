import { AS_TOKEN_PREFIX } from '@/core/limits/min-max/minMaxInfo';
import type { RequiredGroup } from './types';

type Bound = 'Minimum' | 'Maximum';

export const perRequired = (bound: Bound, count: number, label: string, required: RequiredGroup) =>
  `${bound} of ${count} ${label} per ${required.count} ${required.sentence}.`;

export const perThousandPoints = (bound: Bound, count: number, label: string, size: number) =>
  `${bound} of ${count} ${label} per ${size},000 points.`;

export const isAsToken = (value: number | string | undefined): boolean =>
  typeof value === 'string' && value.startsWith(AS_TOKEN_PREFIX);
