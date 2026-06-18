import styled from 'styled-components';
import { useArmyStore } from '../../store/useArmyStore';
import { pointsCost, usedUnits as getUsedUnits } from '../../store/selectors';
import { buildTextList } from '../army/textList';

const Pre = styled.pre`
  font-family: ${({ theme }) => theme.font.mono};
  font-size: ${({ theme }) => theme.fontSize.sm};
  color: ${({ theme }) => theme.color.text.body};
  margin: 0;
  white-space: pre;
`;

export default function TextList() {
  const army = useArmyStore((s) => s.army);
  const units = useArmyStore((s) => s.units);
  const upgrades = useArmyStore((s) => s.upgrades);
  const label = useArmyStore((s) => s.label);
  const version = useArmyStore((s) => s.version);

  if (!army) return null;

  const points = pointsCost({ units });
  const used = getUsedUnits({ units, upgrades });

  const text = buildTextList({
    armyName: army.name,
    label,
    points,
    usedUnits: used,
    version,
  });

  return <Pre>{text}</Pre>;
}
