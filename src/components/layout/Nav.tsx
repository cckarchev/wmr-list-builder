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

const ToolName = styled.span`
  color: ${({ theme }) => theme.color.text.dim};

  @media (max-width: ${({ theme }) => theme.breakpoint.sm}) {
    display: none;
  }
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
  const [section, armyId] = pathname.split('/').filter(Boolean);

  // From the print sheet, "back" returns to that army's roster (preserving the
  // build); from the roster it returns to the army list.
  const back =
    section === 'print' && armyId
      ? { to: `/build/${armyId}`, label: 'Back to roster' }
      : pathname !== '/'
        ? { to: '/', label: 'All armies' }
        : null;

  return (
    <Bar className="no-print">
      <Brand to="/">
        Warmaster <BrandMark>Revolution</BrandMark> <ToolName>· List Builder</ToolName>
      </Brand>
      {back && (
        <BackLink to={back.to}>
          <BackChevron>
            <ChevronMark size={10} color="currentColor" />
          </BackChevron>
          {back.label}
        </BackLink>
      )}
    </Bar>
  );
}
