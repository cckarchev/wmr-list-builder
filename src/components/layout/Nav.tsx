import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import ChevronMark from '../ui/ChevronMark';
import { focusRing } from '../../theme/focusRing';

const Bar = styled.header`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => `${theme.space[3]}px`};
  padding: ${({ theme }) => `${theme.space[2]}px ${theme.space[4]}px`};
  background: ${({ theme }) => theme.color.bg.deep};
  border-bottom: 1px solid ${({ theme }) => theme.color.border.divider};
`;

const Brand = styled(Link)`
  font-family: ${({ theme }) => theme.font.display};
  font-size: ${({ theme }) => theme.fontSize.md};
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: ${({ theme }) => theme.color.text.strong};
  text-decoration: none;

  &:hover {
    color: ${({ theme }) => theme.color.accent};
  }

  ${focusRing}
`;

const BrandMark = styled.span`
  color: ${({ theme }) => theme.color.accent};
`;

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => `${theme.space[2]}px`};
  font-family: ${({ theme }) => theme.font.body};
  font-size: ${({ theme }) => theme.fontSize.sm};
  color: ${({ theme }) => theme.color.text.dim};
  text-decoration: none;

  &:hover {
    color: ${({ theme }) => theme.color.text.strong};
  }

  ${focusRing}
`;

const BackChevron = styled.span`
  display: inline-block;
  transform: rotate(180deg);
`;

export default function Nav() {
  const { pathname } = useLocation();
  const showBack = pathname !== '/';

  return (
    <Bar className="no-print">
      <Brand to="/">
        Warmaster <BrandMark>Revolution</BrandMark>
      </Brand>
      {showBack && (
        <BackLink to="/">
          <BackChevron>
            <ChevronMark size={10} color="currentColor" />
          </BackChevron>
          All armies
        </BackLink>
      )}
    </Bar>
  );
}
