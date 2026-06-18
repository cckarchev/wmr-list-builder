import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { armyIndex } from '../data/armyIndex';
import { focusRing } from '../theme/focusRing';

const Page = styled.main`
  max-width: 1100px;
  margin: 0 auto;
  padding: ${({ theme }) => `${theme.space[6]}px ${theme.space[4]}px`};
`;

const Heading = styled.h1`
  font-family: ${({ theme }) => theme.font.display};
  font-size: ${({ theme }) => theme.fontSize.xxl};
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: ${({ theme }) => theme.color.text.strong};
  margin-bottom: ${({ theme }) => `${theme.space[5]}px`};

  @media (max-width: ${({ theme }) => theme.breakpoint.sm}) {
    font-size: ${({ theme }) => theme.fontSize.xl};
  }
`;

const Grid = styled.ul`
  list-style: none;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: ${({ theme }) => `${theme.space[4]}px`};
`;

const ArmyCard = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => `${theme.space[2]}px`};
  min-height: 72px;
  padding: ${({ theme }) => `${theme.space[4]}px ${theme.space[5]}px`};
  border-radius: ${({ theme }) => theme.radius.md};
  border: 1px solid ${({ theme }) => theme.color.border.default};
  border-left: 3px solid ${({ theme }) => theme.color.border.default};
  background: ${({ theme }) => theme.color.bg.surface};
  color: ${({ theme }) => theme.color.text.body};
  font-family: ${({ theme }) => theme.font.display};
  font-size: ${({ theme }) => theme.fontSize.lg};
  text-transform: uppercase;
  letter-spacing: 0.03em;
  line-height: 1.1;
  text-decoration: none;
  transition: transform 0.12s, border-color 0.12s, background 0.12s, box-shadow 0.12s;

  &::after {
    content: '›';
    font-size: ${({ theme }) => theme.fontSize.xl};
    color: ${({ theme }) => theme.color.text.dim};
    transition: color 0.12s, transform 0.12s;
  }

  &:hover {
    background: ${({ theme }) => theme.color.bg.tint};
    border-color: ${({ theme }) => theme.color.border.hover};
    border-left-color: ${({ theme }) => theme.color.accent};
    color: ${({ theme }) => theme.color.text.strong};
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadow.panel};
  }

  &:hover::after {
    color: ${({ theme }) => theme.color.accent};
    transform: translateX(2px);
  }

  ${focusRing}
`;

export default function Home() {
  return (
    <Page>
      <Heading>Choose Your Army</Heading>
      <Grid>
        {armyIndex.map(({ id, name }) => (
          <li key={id}>
            <ArmyCard to={`/build/${id}`}>{name}</ArmyCard>
          </li>
        ))}
      </Grid>
    </Page>
  );
}
