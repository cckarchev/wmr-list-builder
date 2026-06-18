import { marked } from 'marked';
import styled from 'styled-components';
import { useArmyStore } from '../../store/useArmyStore';

const Wrapper = styled.div`
  color: ${({ theme }) => theme.color.text.body};
`;

const Heading = styled.h3`
  font-family: ${({ theme }) => theme.font.display};
  font-size: ${({ theme }) => theme.fontSize.lg};
  color: ${({ theme }) => theme.color.text.strong};
  text-align: center;
  margin-bottom: ${({ theme }) => `${theme.space[3]}px`};
`;

const Content = styled.div`
  font-size: ${({ theme }) => theme.fontSize.sm};
  line-height: 1.6;
`;

export default function ArmyRules() {
  const army = useArmyStore((s) => s.army);

  if (!army?.armyRules) return null;

  const html = marked(army.armyRules.join('\n')) as string;

  return (
    <Wrapper>
      <Heading>Army Rules</Heading>
      <Content dangerouslySetInnerHTML={{ __html: html }} />
    </Wrapper>
  );
}
