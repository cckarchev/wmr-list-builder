import { marked } from 'marked';
import styled from 'styled-components';
import { useArmyStore } from '../../store/useArmyStore';
import { PrintSection, PrintHeading } from './printSection';

const Content = styled.div`
  font-size: ${({ theme }) => theme.fontSize.sm};
  line-height: 1.6;

  p {
    margin-bottom: ${({ theme }) => `${theme.space[3]}px`};
  }

  p:last-child {
    margin-bottom: 0;
  }
`;

export default function ArmyRules() {
  const army = useArmyStore((s) => s.army);

  if (!army?.armyRules) return null;

  const html = marked(army.armyRules.join('\n')) as string;

  return (
    <PrintSection>
      <PrintHeading>Army Rules</PrintHeading>
      <Content dangerouslySetInnerHTML={{ __html: html }} />
    </PrintSection>
  );
}
