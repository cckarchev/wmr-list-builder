import { Icon, INLINE_ICON_SIZE } from '@/components/Icon';
import { Popover } from '@/components/popover/Popover';
import { Stepper } from '@/components/stepper/Stepper';
import { formatPrice } from '@/core/army-state/formatPrice';
import { resolveUpgradePoints } from '@/core/army-state/pricing';
import { minMaxHint } from '@/core/limits/min-max/minMaxHint';
import { upgradeMaxCount } from '@/core/limits/upgradeMaxCount';
import { resolveUpgradeRules } from '@/core/special-rules/upgradeRules';
import { errorsForTarget } from '@/core/validation/errorTargets';
import { useArmyStore } from '@/store/useArmyStore';
import { InlineErrors } from '../../shared/inline-errors/InlineErrors';
import { LimitBadge } from '../../shared/LimitBadge';
import { RuleList } from '../../shared/rule-list/RuleList';
import styles from './UpgradeRow.module.css';

interface UpgradeRowProps {
  unitId: string;
  upgradeId: string;
}

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

  const maxCount = upgradeMaxCount({
    stands: unit.number,
    taken: count,
    armyTotal: upgrade.number,
    armyMax: upgrade.armyMax,
  });

  const limit = minMaxHint(upgrade, gameSize);

  // Resolve points display: pointsValue means variable pricing
  const price = resolveUpgradePoints(upgrade, unit);
  const hasVariablePrice = upgrade.pointsValue !== undefined;
  const pointsDisplay = formatPrice(price, hasVariablePrice);
  const invalid = upgradeErrors.length > 0;

  const changeCount = (newCount: number) => {
    setUnitUpgradeNumber(unitId, upgradeId, newCount);
  };

  return (
    <div className={styles.row} data-invalid={invalid || undefined}>
      <div className={styles.main}>
        <span className={styles.name}>{upgrade.name}</span>
        {rules.length > 0 && (
          <Popover
            label={`${upgrade.name} special rules`}
            heading={`${upgrade.name} · Rules`}
            trigger={<Icon name="rules" size={INLINE_ICON_SIZE} />}
            wide
          >
            <RuleList rules={rules} />
          </Popover>
        )}
        {limit && <LimitBadge hint={limit} className={styles.limit} />}
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
