import { Icon } from '@/components/Icon';
import { Popover } from '@/components/popover/Popover';
import { resolveUnitSpecialRules } from '@/core/specialRulesForUnit';
import { useArmyStore } from '@/store/useArmyStore';
import { RuleList } from '../rule-list/RuleList';

interface UnitRulesProps {
  unitId: string;
}

export const UnitRules = ({ unitId }: UnitRulesProps) => {
  const unit = useArmyStore((s) => s.units[unitId]);
  const specialRules = useArmyStore((s) => s.specialRules);

  if (!unit) {
    return null;
  }

  const rules = resolveUnitSpecialRules(unitId, unit, specialRules);
  if (rules.length === 0) {
    return null;
  }

  return (
    <Popover
      label={`${unitId} special rules`}
      trigger={
        <>
          <Icon name="rules" size={14} />
          Rules
        </>
      }
      wide
    >
      <RuleList rules={rules} />
    </Popover>
  );
};
