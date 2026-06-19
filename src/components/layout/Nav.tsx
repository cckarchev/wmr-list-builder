import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import ChevronMark from '../ui/ChevronMark';
import Icon from '../ui/Icon';
import { focusRing } from '../../theme/focusRing';

const Bar = styled.header`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => `${theme.space[3]}px`};
  /* Fixed height so the bar never reflows when the right-hand action chip
     appears or changes between screens. */
  min-height: 64px;
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

// Shared right-hand action chip: Build → Print, Print → back to roster.
const NavAction = styled(Link)`
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => `${theme.space[2]}px`};
  padding: ${({ theme }) => `${theme.space[1]}px ${theme.space[3]}px`};
  font-family: ${({ theme }) => theme.font.display};
  font-size: ${({ theme }) => theme.fontSize.sm};
  text-transform: uppercase;
  letter-spacing: ${({ theme }) => theme.tracking.button};
  color: ${({ theme }) => theme.color.text.body};
  text-decoration: none;
  border: 1px solid ${({ theme }) => theme.color.border.default};

  &:hover {
    color: ${({ theme }) => theme.color.accent};
    border-color: ${({ theme }) => theme.color.border.accent};
  }

  ${focusRing}
`;

const Chev = styled.span<{ $flip?: boolean }>`
  display: inline-flex;
  align-items: center;
  ${({ $flip }) => $flip && 'transform: rotate(180deg);'}
`;

export default function Nav() {
  const { pathname } = useLocation();
  const [section, armyId] = pathname.split('/').filter(Boolean);

  // The brand links home; the right-hand chip is the screen's primary nav.
  // Print → back to that army's roster (preserving the build).
  // On the Build screen, BuildHeader owns the Print action — no chip here.
  const action =
    section === 'print' && armyId
      ? { to: `/build/${armyId}`, label: 'Back', back: true }
      : null;

  return (
    <Bar className="no-print">
      <Brand to="/">
        Warmaster <BrandMark>Revolution</BrandMark> <ToolName>· List Builder</ToolName>
      </Brand>
      {action && (
        <NavAction to={action.to}>
          {action.back ? (
            <Chev $flip>
              <ChevronMark size={10} color="currentColor" />
            </Chev>
          ) : (
            <Icon name="print" size={14} />
          )}
          {action.label}
        </NavAction>
      )}
    </Bar>
  );
}
