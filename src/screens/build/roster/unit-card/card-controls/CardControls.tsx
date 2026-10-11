import { Stepper } from '@/components/stepper/Stepper';
import { Tooltip } from '@/components/tooltip/Tooltip';
import type { UnitState } from '@/core/army-state/types';
import { explainMinMax } from '@/core/limits/explainMinMax';
import { resolveBounds } from '@/core/limits/forceLimits';
import { minMaxBadge } from '@/core/limits/minMaxBadge';
import { useArmyStore } from '@/store/useArmyStore';
import styles from './CardControls.module.css';

interface CardControlsProps {
  unitId: string;
  unit: UnitState;
}

/**
 * The unit count stepper, with the points cost (when selected) and the model
 * restriction badge underneath.
 */
export const CardControls = ({ unitId, unit }: CardControlsProps) => {
  const gameSize = useArmyStore((s) => s.gameSize);
  const setUnitNumber = useArmyStore((s) => s.setUnitNumber);

  const selected = unit.number > 0;
  const { min, max } = resolveBounds(unit, gameSize);
  const badge = minMaxBadge(unit, gameSize);
  const rule = explainMinMax(unit, gameSize);
  const restriction = badge && rule ? { badge, rule } : undefined;

  const changeNumber = (count: number) => {
    setUnitNumber(unitId, count);
  };

  return (
    <div className={styles.controls}>
      <Stepper value={unit.number} onChange={changeNumber} min={min} max={max} label={unit.name} />
      <div className={styles.meta}>
        {selected && <span className={styles.pts}>{unit.pointsCost} pts</span>}
        {selected && restriction && (
          <span className={styles.separator} aria-hidden>
            ·
          </span>
        )}
        {restriction && (
          <Tooltip label={restriction.rule}>
            <span className={styles.restriction}>{restriction.badge}</span>
          </Tooltip>
        )}
      </div>
    </div>
  );
};
