import { Stepper } from '@/components/stepper/Stepper';
import type { UnitState } from '@/core/army-state/types';
import { resolveBounds } from '@/core/limits/forceLimits';
import { minMaxHint } from '@/core/limits/min-max/minMaxHint';
import { useArmyStore } from '@/store/useArmyStore';
import { LimitBadge } from '../shared/LimitBadge';
import styles from './CardControls.module.css';

interface CardControlsProps {
  unitId: string;
  unit: UnitState;
}

/**
 * The unit count stepper, with the total points cost (when selected) and the
 * model restriction badge underneath. The total reads "= 255 pts" so it is not
 * mistaken for the per-unit Pts stat.
 */
export const CardControls = ({ unitId, unit }: CardControlsProps) => {
  const gameSize = useArmyStore((s) => s.gameSize);
  const setUnitNumber = useArmyStore((s) => s.setUnitNumber);

  const selected = unit.number > 0;
  const { min, max } = resolveBounds(unit, gameSize);
  const restriction = minMaxHint(unit, gameSize);

  const changeNumber = (count: number) => {
    setUnitNumber(unitId, count);
  };

  return (
    <div className={styles.controls}>
      <div className={styles.stepper}>
        <Stepper
          value={unit.number}
          onChange={changeNumber}
          min={min}
          max={max}
          label={unit.name}
        />
      </div>
      <div className={styles.meta}>
        {selected && <span className={styles.pts}>= {unit.pointsCost} pts</span>}
        {selected && restriction && (
          <span className={styles.separator} aria-hidden="true">
            ·
          </span>
        )}
        {restriction && <LimitBadge hint={restriction} className={styles.restriction} />}
      </div>
    </div>
  );
};
