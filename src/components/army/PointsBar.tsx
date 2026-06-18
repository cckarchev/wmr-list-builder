import styled from 'styled-components';
import { useArmyStore } from '../../store/useArmyStore';
import { pointsCost, armySize, unitCount } from '../../store/selectors';

const Bar = styled.div`
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${({ theme }) => `${theme.space[2]}px ${theme.space[4]}px`};
  padding: ${({ theme }) => `${theme.space[3]}px ${theme.space[4]}px`};
  background: ${({ theme }) => theme.color.bg.deep};
  border-bottom: 1px solid ${({ theme }) => theme.color.border.default};
  box-shadow: ${({ theme }) => theme.shadow.panel};
`;

const Stat = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => `${theme.space[1]}px`};
`;

const StatLabel = styled.span`
  font-family: ${({ theme }) => theme.font.mono};
  font-size: ${({ theme }) => theme.fontSize.xs};
  color: ${({ theme }) => theme.color.text.dim};
  text-transform: uppercase;
  letter-spacing: ${({ theme }) => theme.tracking.label};
`;

const StatValue = styled.span`
  font-family: ${({ theme }) => theme.font.mono};
  font-size: ${({ theme }) => theme.fontSize.md};
  color: ${({ theme }) => theme.color.text.strong};
  font-weight: 500;
`;

interface ValidIndicatorProps {
  $valid: boolean;
}

const ValidIndicator = styled.span<ValidIndicatorProps>`
  margin-left: auto;
  font-family: ${({ theme }) => theme.font.mono};
  font-size: ${({ theme }) => theme.fontSize.xs};
  font-weight: 600;
  letter-spacing: ${({ theme }) => theme.tracking.label};
  text-transform: uppercase;
  color: ${({ $valid, theme }) =>
    $valid ? theme.color.semantic.success : theme.color.semantic.error};
`;

export default function PointsBar() {
  const units = useArmyStore((s) => s.units);
  const errors = useArmyStore((s) => s.errors);

  const total = pointsCost({ units });
  const size = armySize(total);
  const count = unitCount(units);
  const isValid = errors.length === 0;

  return (
    <Bar className="no-print" data-testid="points-bar">
      <Stat>
        <StatLabel>Points</StatLabel>
        <StatValue data-testid="points-total">{total}</StatValue>
      </Stat>
      <Stat>
        <StatLabel>Army Size</StatLabel>
        <StatValue>{size}</StatValue>
      </Stat>
      <Stat>
        <StatLabel>Units</StatLabel>
        <StatValue>{count}</StatValue>
      </Stat>
      <ValidIndicator $valid={isValid}>{isValid ? 'Valid' : 'Invalid'}</ValidIndicator>
    </Bar>
  );
}
