import styled from 'styled-components';
import { useArmyStore } from '../../store/useArmyStore';
import { Markdown } from '../ui/Markdown';
import { PrintHeading, PrintSection } from './printSection';

const Content = styled.div`
  font-size: ${({ theme }) => theme.fontSize.sm};
  line-height: 1.6;

  p {
    margin-bottom: ${({ theme }) => `${theme.space.sm}px`};
  }

  p:last-child {
    margin-bottom: 0;
  }
`;

export const ArmyRules = () => {
  const army = useArmyStore((s) => s.army);

  if (!army?.armyRules) {
    return null;
  }

  return (
    <PrintSection>
      <PrintHeading>Army Rules</PrintHeading>
      <Content>
        <Markdown blocks={army.armyRules} />
      </Content>
    </PrintSection>
  );
};
