import { marked } from 'marked';
import styled from 'styled-components';
import { useArmyStore } from '../../store/useArmyStore';
import { resolveUpgradePoints } from '../../store/storeHelpers';
import { errorsForTarget } from '../../store/selectors';
import { resolveUpgradeRules } from '../../store/upgradeRules';
import { minMaxBadge, explainMinMax } from '../../store/minMax';
import Stepper from '../ui/Stepper';
import Tooltip from '../ui/Tooltip';
import Popover from '../ui/Popover';
import Icon from '../ui/Icon';
import InlineErrors from './InlineErrors';

interface UpgradeRowProps {
  unitId: string;
  upgradeId: string;
}

const Row = styled.div<{ $invalid?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => `${theme.space[1]}px`};
  padding: ${({ theme }) => `${theme.space[1]}px ${theme.space[2]}px`};
  border-left: 2px solid
    ${({ theme, $invalid }) => ($invalid ? theme.color.semantic.error : theme.color.border.divider)};

  &:hover {
    background: ${({ theme }) => theme.color.bg.tint};
  }
`;

const RowMain = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => `${theme.space[2]}px`};
`;

const UpgradeName = styled.span`
  font-family: ${({ theme }) => theme.font.body};
  font-size: ${({ theme }) => theme.fontSize.sm};
  color: ${({ theme }) => theme.color.text.body};
  flex: 1;
`;

const UpgradePoints = styled.span`
  font-family: ${({ theme }) => theme.font.mono};
  font-size: ${({ theme }) => theme.fontSize.xs};
  color: ${({ theme }) => theme.color.text.dim};
  white-space: nowrap;
  /* Fixed width, right-aligned, so a shorter cost (e.g. +5pts vs +30pts)
     doesn't shift the rules icon and limit badge out of their column. */
  min-width: 3.5rem;
  text-align: right;
`;

const Limit = styled.span`
  font-family: ${({ theme }) => theme.font.mono};
  font-size: ${({ theme }) => theme.fontSize.xs};
  color: ${({ theme }) => theme.color.text.dim};
`;

const Rule = styled.div`
  & + & {
    margin-top: ${({ theme }) => `${theme.space[3]}px`};
  }
`;

const RuleName = styled.h4`
  margin: 0 0 ${({ theme }) => `${theme.space[1]}px`};
  font-family: ${({ theme }) => theme.font.display};
  font-size: ${({ theme }) => theme.fontSize.sm};
  color: ${({ theme }) => theme.color.text.strong};
`;

const RuleText = styled.div`
  font-family: ${({ theme }) => theme.font.body};
  font-size: ${({ theme }) => theme.fontSize.xs};
  color: ${({ theme }) => theme.color.text.body};
  line-height: 1.4;

  & p {
    margin: 0 0 ${({ theme }) => `${theme.space[1]}px`};
  }
  & p:last-child {
    margin-bottom: 0;
  }
`;

export default function UpgradeRow({ unitId, upgradeId }: UpgradeRowProps) {
  const unit = useArmyStore((s) => s.units[unitId]);
  const upgrade = useArmyStore((s) => s.upgrades[upgradeId]);
  const setUnitUpgradeNumber = useArmyStore((s) => s.setUnitUpgradeNumber);
  const gameSize = useArmyStore((s) => s.gameSize);
  const errors = useArmyStore((s) => s.errors);
  const specialRules = useArmyStore((s) => s.specialRules);

  if (!unit || !upgrade) return null;

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
    maxCount = Math.min(maxCount, Math.max(0, upgrade.armyMax - usedElsewhere));
  }
  const badge = minMaxBadge(upgrade, gameSize);
  const rule = explainMinMax(upgrade, gameSize);

  // Resolve points display: pointsValue means variable pricing
  const price = resolveUpgradePoints(upgrade, unit);
  const pointsDisplay =
    price !== undefined ? `${price}pts` : upgrade.pointsValue !== undefined ? '?pts' : '—';

  return (
    <Row $invalid={upgradeErrors.length > 0}>
      <RowMain>
        <UpgradeName>{upgradeId}</UpgradeName>
        {rules.length > 0 && (
          <Popover
            label={`${upgradeId} special rules`}
            trigger={<Icon name="rules" size={14} />}
            wide
          >
            {rules.map(({ name, rule }) => (
              <Rule key={name}>
                <RuleName>{name}</RuleName>
                <RuleText
                  dangerouslySetInnerHTML={{
                    __html: marked(rule.text?.join('\n\n') ?? '') as string,
                  }}
                />
              </Rule>
            ))}
          </Popover>
        )}
        {badge && rule && (
          <Tooltip label={rule}>
            <Limit>{badge}</Limit>
          </Tooltip>
        )}
        <UpgradePoints>{pointsDisplay}</UpgradePoints>
        <Stepper
          value={count}
          onChange={(n) => setUnitUpgradeNumber(unitId, upgradeId, n)}
          min={0}
          max={maxCount}
          label={`${upgradeId} for ${unitId}`}
        />
      </RowMain>
      <InlineErrors errors={upgradeErrors} label={`${upgradeId} errors`} />
    </Row>
  );
}
