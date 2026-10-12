import type { ValidationError } from '@/data/types';

/** Errors attributed to a given unit/upgrade id, for inline rendering. */
export const errorsForTarget = (errors: ValidationError[], id: string): ValidationError[] =>
  errors.filter((e) => e.targets.includes(id));

/** List-level errors with no specific target (e.g. the points ceiling). */
export const globalErrors = (errors: ValidationError[]): ValidationError[] =>
  errors.filter((e) => e.targets.length === 0);
