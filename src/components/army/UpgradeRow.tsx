import styled from 'styled-components';
import { useArmyStore } from '../../store/useArmyStore';
import Stepper from '../ui/Stepper';

interface UpgradeRowProps {
  unitId: string;
  upgradeId: string;
}

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => `${theme.space[2]}px`};
  padding: ${({ theme }) => `${theme.space[2]}px ${theme.space[3]}px`};
  border-left: 2px solid ${({ theme }) => theme.color.border.divider};
  border-radius: ${({ theme }) => `0 ${theme.radius.sm} ${theme.radius.sm} 0`};
  background: ${({ theme }) => theme.color.bg.tint};
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

  if (!unit || !upgrade) return null;

  const unitUpgrade = unit.upgrades?.[upgradeId];
  const count = unitUpgrade?.number ?? 0;
  const maxCount = unit.number;

  // Resolve points display: pointsValue means variable pricing
  let pointsDisplay: string;
  if (upgrade.pointsValue !== undefined) {
    const lookup = (unit as unknown as Record<string, unknown>)[upgrade.pointsValue];
    const pts = (upgrade.points as Record<string, string>)?.[String(lookup ?? '-')];
    pointsDisplay = pts !== undefined ? `${pts}pts` : '?pts';
  } else {
    pointsDisplay = upgrade.points !== undefined ? `${upgrade.points}pts` : '—';
  }

  return (
    <Row>
      <UpgradeName>{upgradeId}</UpgradeName>
      <UpgradePoints>{pointsDisplay}</UpgradePoints>
      <Stepper
        value={count}
        onChange={(n) => setUnitUpgradeNumber(unitId, upgradeId, n)}
        min={0}
        max={maxCount}
        label={`${upgradeId} for ${unitId}`}
      />
    </Row>
  );
}
