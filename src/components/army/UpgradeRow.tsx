import styled from 'styled-components';
import { useArmyStore } from '../../store/useArmyStore';
import { resolveUpgradePoints } from '../../store/storeHelpers';
import { errorsForTarget } from '../../store/selectors';
import Stepper from '../ui/Stepper';
import InlineErrors from './InlineErrors';

interface UpgradeRowProps {
  unitId: string;
  upgradeId: string;
}

const Row = styled.div<{ $invalid?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => `${theme.space[1]}px`};
  padding: ${({ theme }) => `${theme.space[2]}px ${theme.space[3]}px`};
  border-left: 2px solid
    ${({ theme, $invalid }) => ($invalid ? theme.color.semantic.error : theme.color.border.divider)};
  border-radius: ${({ theme }) => `0 ${theme.radius.sm} ${theme.radius.sm} 0`};
  background: ${({ theme }) => theme.color.bg.tint};
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
`;

export default function UpgradeRow({ unitId, upgradeId }: UpgradeRowProps) {
  const unit = useArmyStore((s) => s.units[unitId]);
  const upgrade = useArmyStore((s) => s.upgrades[upgradeId]);
  const setUnitUpgradeNumber = useArmyStore((s) => s.setUnitUpgradeNumber);
  const errors = useArmyStore((s) => s.errors);

  if (!unit || !upgrade) return null;

  const upgradeErrors = errorsForTarget(errors, upgradeId);

  const unitUpgrade = unit.upgrades?.[upgradeId];
  const count = unitUpgrade?.number ?? 0;
  const maxCount = unit.number;

  // Resolve points display: pointsValue means variable pricing
  const price = resolveUpgradePoints(upgrade, unit);
  const pointsDisplay =
    price !== undefined ? `${price}pts` : upgrade.pointsValue !== undefined ? '?pts' : '—';

  return (
    <Row $invalid={upgradeErrors.length > 0}>
      <RowMain>
        <UpgradeName>{upgradeId}</UpgradeName>
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
