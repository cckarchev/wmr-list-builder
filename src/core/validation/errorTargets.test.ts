import { describe, expect, it } from 'vitest';
import type { ValidationError } from '@/data/types';
import { errorsForTarget, globalErrors } from './errorTargets';

describe('errorsForTarget / globalErrors', () => {
  const errors: ValidationError[] = [
    { message: 'over cap', targets: [] },
    { message: 'too few A', targets: ['A'] },
    { message: 'A or B issue', targets: ['A', 'B'] },
  ];

  it('errorsForTarget returns every error naming the id', () => {
    expect(errorsForTarget(errors, 'A').map((e) => e.message)).toEqual([
      'too few A',
      'A or B issue',
    ]);

    expect(errorsForTarget(errors, 'B').map((e) => e.message)).toEqual(['A or B issue']);
    expect(errorsForTarget(errors, 'C')).toEqual([]);
  });

  it('globalErrors returns only errors with no targets', () => {
    expect(globalErrors(errors).map((e) => e.message)).toEqual(['over cap']);
  });
});
