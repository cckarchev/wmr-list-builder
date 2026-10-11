import { Icon } from '@/components/Icon';
import { Popover } from '@/components/popover/Popover';
import { Stepper } from '@/components/stepper/Stepper';
import { Tooltip } from '@/components/tooltip/Tooltip';
import { resolveUpgradePoints } from '@/core/army-state/pricing';
import { explainMinMax } from '@/core/limits/explainMinMax';
import { minMaxBadge } from '@/core/limits/minMaxBadge';
import { errorsForTarget } from '@/core/selectors';
import { resolveUpgradeRules } from '@/core/special-rules/upgradeRules';
import type { StatValue } from '@/data/types';
import { useArmyStore } from '@/store/useArmyStore';
import { InlineErrors } from '../../shared/inline-errors/InlineErrors';
import { RuleList } from '../../shared/rule-list/RuleList';
import styles from './UpgradeRow.module.css';

interface UpgradeRowProps {
  unitId: string;
  upgradeId: string;
}

/** Shown when an upgrade has no price at all. */
const NO_PRICE = '–';

/** Variable pricing that cannot be resolved for this unit shows as "?pts". */
const formatPrice = (price: StatValue | undefined, hasVariablePrice: boolean): string => {
  if (price !== undefined) {
    return `${price}pts`;
  }

  if (hasVariablePrice) {
    return '?pts';
  }

  return NO_PRICE;
};

export const UpgradeRow = ({ unitId, upgradeId }: UpgradeRowProps) => {
  const unit = useArmyStore((s) => s.units[unitId]);
  const upgrade = useArmyStore((s) => s.upgrades[upgradeId]);
  const setUnitUpgradeNumber = useArmyStore((s) => s.setUnitUpgradeNumber);
  const gameSize = useArmyStore((s) => s.gameSize);
  const errors = useArmyStore((s) => s.errors);
  const specialRules = useArmyStore((s) => s.specialRules);

  if (!unit || !upgrade) {
    return null;
  }

  const rules = resolveUpgradeRules(upgradeId, upgrade, specialRules);
  const upgradeErrors = errorsForTarget(errors, upgradeId);

  const unitUpgrade = unit.upgrades?.[upgradeId];
  const count = unitUpgrade?.number ?? 0;

  // A unit can't take more of an upgrade than it has stands. On top of that,
  // upgrades with an army-wide cap (`armyMax`, e.g. Magic Standards = 1 per
  // army) are hard-limited by how much of that allowance is still unspent
  // elsewhere. `upgrade.number` is the army-wide total; subtract this unit's
  // own share to get what the rest of the army has already used.
  let maxCount = unit.number;

  if (upgrade.armyMax !== undefined) {
    const usedElsewhere = upgrade.number - count;
    const armyAllowanceLeft = Math.max(0, upgrade.armyMax - usedElsewhere);
    maxCount = Math.min(maxCount, armyAllowanceLeft);
  }

  const badge = minMaxBadge(upgrade, gameSize);
  const rule = explainMinMax(upgrade, gameSize);

  // Resolve points display: pointsValue means variable pricing
  const price = resolveUpgradePoints(upgrade, unit);
  const hasVariablePrice = upgrade.pointsValue !== undefined;
  const pointsDisplay = formatPrice(price, hasVariablePrice);
  const invalid = upgradeErrors.length > 0;

  const changeCount = (n: number) => {
    setUnitUpgradeNumber(unitId, upgradeId, n);
  };

  return (
    <div className={styles.row} data-invalid={invalid || undefined}>
      <div className={styles.main}>
        <span className={styles.name}>{upgrade.name}</span>
        {rules.length > 0 && (
          <Popover
            label={`${upgrade.name} special rules`}
            trigger={<Icon name="rules" size={14} />}
            wide
          >
            <RuleList rules={rules} />
          </Popover>
        )}
        {badge && rule && (
          <Tooltip label={rule}>
            <span className={styles.limit}>{badge}</span>
          </Tooltip>
        )}
        <span className={styles.points}>{pointsDisplay}</span>
        <Stepper
          value={count}
          onChange={changeCount}
          min={0}
          max={maxCount}
          label={`${upgrade.name} for ${unit.name}`}
        />
      </div>
      <InlineErrors errors={upgradeErrors} label={`${upgrade.name} errors`} />
    </div>
  );
};
