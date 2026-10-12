import type { ValidationError } from '@/data/types';

/** Errors attributed to a given unit/upgrade id, for inline rendering. */
export const errorsForTarget = (errors: ValidationError[], id: string): ValidationError[] =>
  errors.filter((e) => e.targets.includes(id));

/** Errors are the same when they say the same about the same items. */
export const errorKey = ({ message, targets }: ValidationError): string =>
  JSON.stringify([message, targets]);

/** List-level errors with no specific target (e.g. the points ceiling). */
export const globalErrors = (errors: ValidationError[]): ValidationError[] =>
  errors.filter((e) => e.targets.length === 0);
