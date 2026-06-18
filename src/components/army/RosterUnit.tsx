import styled from 'styled-components';
import { useArmyStore } from '../../store/useArmyStore';
import Stepper from '../ui/Stepper';
import StatLine from '../ui/StatLine';

interface RosterUnitProps {
  unitId: string;
}

const Card = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => `${theme.space[2]}px`};
  padding: ${({ theme }) => `${theme.space[3]}px`};
  background: ${({ theme }) => theme.color.bg.surface};
  border: 1px solid ${({ theme }) => theme.color.border.default};
  border-radius: ${({ theme }) => theme.radius.md};
`;

const Header = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: ${({ theme }) => `${theme.space[2]}px`};
`;

const UnitName = styled.span`
  font-family: ${({ theme }) => theme.font.display};
  font-size: ${({ theme }) => theme.fontSize.md};
  color: ${({ theme }) => theme.color.text.strong};
`;

const MinMax = styled.span`
  font-family: ${({ theme }) => theme.font.mono};
  font-size: ${({ theme }) => theme.fontSize.xs};
  color: ${({ theme }) => theme.color.text.dim};
`;

const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => `${theme.space[2]}px`};
  margin-top: ${({ theme }) => `${theme.space[1]}px`};
`;

export default function RosterUnit({ unitId }: RosterUnitProps) {
  const unit = useArmyStore((s) => s.units[unitId]);
  const setUnitNumber = useArmyStore((s) => s.setUnitNumber);

  if (!unit) return null;

  return (
    <Card>
      <Header>
        <UnitName>{unitId}</UnitName>
        {unit.minMax && <MinMax>min/max: {unit.minMax}</MinMax>}
      </Header>
      <StatLine
        type={unit.type}
        attack={unit.attack}
        range={unit.range}
        hits={unit.hits}
        armour={unit.armour}
        command={unit.command}
        size={unit.size}
        points={unit.points}
      />
      <Footer>
        <Stepper
          value={unit.number}
          onChange={(n) => setUnitNumber(unitId, n)}
          min={0}
          label={unitId}
        />
      </Footer>
    </Card>
  );
}
