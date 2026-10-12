import { describe, expect, it } from 'vitest';
import { resolveBounds } from './forceLimits';

const UNDER_ONE_STEP = 750;
const TWO_STEPS = 2000;
const PER_STEP_MIN = 2;
const PER_STEP_MAX = 3;
const ARMY_MAX = 4;

describe('resolveBounds', () => {
  it('has no bounds for a unit without limits', () => {
    expect(resolveBounds({}, TWO_STEPS)).toEqual({ min: 0, max: undefined });
  });

  it('takes absolute army limits as they are', () => {
    const armyMin = 1;

    expect(resolveBounds({ armyMin, armyMax: ARMY_MAX }, TWO_STEPS)).toEqual({
      min: armyMin,
      max: ARMY_MAX,
    });
  });

  it('scales numeric per-1,000-point limits by army size', () => {
    const steps = 2;

    expect(resolveBounds({ min: PER_STEP_MIN, max: PER_STEP_MAX }, TWO_STEPS)).toEqual({
      min: PER_STEP_MIN * steps,
      max: PER_STEP_MAX * steps,
    });
  });

  it('skips the scaled minimum below 1,000 points but still scales the maximum', () => {
    expect(resolveBounds({ min: PER_STEP_MIN, max: PER_STEP_MAX }, UNDER_ONE_STEP)).toEqual({
      min: 0,
      max: PER_STEP_MAX,
    });
  });

  it('keeps the tighter of the army and scaled maximums', () => {
    expect(resolveBounds({ max: PER_STEP_MAX, armyMax: ARMY_MAX }, TWO_STEPS).max).toBe(ARMY_MAX);
  });

  it('ignores keyword limits, which need cross-unit context', () => {
    expect(resolveBounds({ min: 'As Knights', max: 'elite' }, TWO_STEPS)).toEqual({
      min: 0,
      max: undefined,
    });
  });

  it('leaves scaled limits of homologous units to soft validation', () => {
    const unit = { min: PER_STEP_MIN, max: PER_STEP_MAX, homologousUnits: ['Knights'] };

    expect(resolveBounds(unit, TWO_STEPS)).toEqual({ min: 0, max: undefined });
  });
});
