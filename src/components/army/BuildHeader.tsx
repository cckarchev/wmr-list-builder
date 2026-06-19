import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { useArmyStore } from '../../store/useArmyStore';
import { pointsCost, unitCount, breakPoint, globalErrors } from '../../store/selectors';
import { unitDomId } from './unitDomId';
import { focusRing } from '../../theme/focusRing';
import Button from '../ui/Button';
import Icon from '../ui/Icon';
import CopyListButton from './CopyListButton';
import CopyShareLinkButton from './CopyShareLinkButton';

const Header = styled.header`
  position: sticky;
  top: 0;
  z-index: 10;
  background: ${({ theme }) => theme.color.bg.deep};
  border-bottom: 1px solid ${({ theme }) => theme.color.border.default};
  box-shadow: ${({ theme }) => theme.shadow.panel};
`;

const TitleZone = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${({ theme }) => `${theme.space[2]}px ${theme.space[4]}px`};
  padding: ${({ theme }) => `${theme.space[3]}px ${theme.space[4]}px`};
`;

const ArmyName = styled.h1`
  margin: 0;
  font-family: ${({ theme }) => theme.font.display};
  font-size: ${({ theme }) => theme.fontSize.xl};
  color: ${({ theme }) => theme.color.accent};
`;

const Actions = styled.div`
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => `${theme.space[2]}px`};
`;

const InlineActions = styled(Actions)`
  /* The mobile menu takes over below md. Stop just short of md so this and
     MenuActions' min-width rule are strict complements (no dead zone at md). */
  @media (max-width: ${({ theme }) => `calc(${theme.breakpoint.md} - 0.02px)`}) {
    display: none;
  }
`;

const MenuActions = styled(Actions)`
  position: relative;

  /* Inline buttons take over at md and up. */
  @media (min-width: ${({ theme }) => theme.breakpoint.md}) {
    display: none;
  }
`;

const MenuPanel = styled.div`
  position: absolute;
  top: calc(100% + ${({ theme }) => `${theme.space[1]}px`});
  right: 0;
  z-index: 20;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => `${theme.space[2]}px`};
  padding: ${({ theme }) => `${theme.space[2]}px`};
  background: ${({ theme }) => theme.color.bg.surface};
  border: 1px solid ${({ theme }) => theme.color.border.default};
  border-radius: ${({ theme }) => theme.radius.sm};
  box-shadow: ${({ theme }) => theme.shadow.panel};
`;

const Strip = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${({ theme }) => `${theme.space[2]}px ${theme.space[4]}px`};
  padding: ${({ theme }) => `${theme.space[3]}px ${theme.space[4]}px`};
  border-top: 1px solid ${({ theme }) => theme.color.border.divider};
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

const SizeInput = styled.input`
  width: 10ch;
  font-family: ${({ theme }) => theme.font.mono};
  font-size: ${({ theme }) => theme.fontSize.md};
  font-weight: 500;
  color: ${({ theme }) => theme.color.text.strong};
  background: ${({ theme }) => theme.color.bg.panel};
  border: 1px solid ${({ theme }) => theme.color.border.default};
  border-radius: ${({ theme }) => theme.radius.sm};
  padding: ${({ theme }) => `${theme.space[1]}px ${theme.space[2]}px`};
`;

const PointsValue = styled(StatValue)<{ $over: boolean }>`
  color: ${({ $over, theme }) => ($over ? theme.color.semantic.error : theme.color.text.strong)};
`;

const ValidIndicator = styled.span<{ $valid: boolean }>`
  margin-left: auto;
  font-family: ${({ theme }) => theme.font.mono};
  font-size: ${({ theme }) => theme.fontSize.xs};
  font-weight: 600;
  letter-spacing: ${({ theme }) => theme.tracking.label};
  text-transform: uppercase;
  color: ${({ $valid, theme }) =>
    $valid ? theme.color.semantic.success : theme.color.semantic.error};
`;

const InvalidButton = styled.button`
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => `${theme.space[1]}px`};
  padding: ${({ theme }) => `${theme.space[1]}px ${theme.space[2]}px`};
  background: transparent;
  border: 1px solid ${({ theme }) => theme.color.semantic.error};
  border-radius: ${({ theme }) => theme.radius.sm};
  font-family: ${({ theme }) => theme.font.mono};
  font-size: ${({ theme }) => theme.fontSize.xs};
  font-weight: 600;
  letter-spacing: ${({ theme }) => theme.tracking.label};
  text-transform: uppercase;
  color: ${({ theme }) => theme.color.semantic.error};
  cursor: pointer;

  ${focusRing}
`;

const GlobalError = styled.p`
  flex-basis: 100%;
  margin: 0;
  font-family: ${({ theme }) => theme.font.body};
  font-size: ${({ theme }) => theme.fontSize.xs};
  color: ${({ theme }) => theme.color.semantic.error};
`;

export default function BuildHeader() {
  const army = useArmyStore((s) => s.army);
  const armyId = useArmyStore((s) => s.armyId);
  const units = useArmyStore((s) => s.units);
  const errors = useArmyStore((s) => s.errors);
  const gameSize = useArmyStore((s) => s.gameSize);
  const setGameSize = useArmyStore((s) => s.setGameSize);

  const total = pointsCost({ units });
  const count = unitCount(units);
  const breaks = breakPoint(units);
  const isValid = errors.length === 0;
  const over = total > gameSize;
  const globals = globalErrors(errors);

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [menuOpen]);

  // Jump to the first invalid unit shown in "Your Army" (a used unit).
  const firstTarget = errors.flatMap((e) => e.targets).find((id) => units[id]?.number > 0);
  const goToFirstError = () => {
    if (!firstTarget) return;
    document
      .getElementById(unitDomId(firstTarget))
      ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <Header className="no-print" data-testid="points-bar">
      <TitleZone>
        <ArmyName>{army?.name}</ArmyName>
        <InlineActions data-testid="actions-inline">
          <CopyListButton />
          <CopyShareLinkButton />
          {armyId && (
            <Button as={Link} to={`/print/${armyId}`} $variant="ghost" $size="sm">
              <Icon name="print" size={16} />
              Print
            </Button>
          )}
        </InlineActions>
        <MenuActions data-testid="actions-menu" ref={menuRef}>
          <Button
            type="button"
            $variant="ghost"
            $size="sm"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
          >
            Export
            <Icon name="export" size={16} />
          </Button>
          {menuOpen && (
            <MenuPanel role="menu">
              <CopyListButton />
              <CopyShareLinkButton />
              {armyId && (
                <Button as={Link} to={`/print/${armyId}`} $variant="ghost" $size="sm">
                  <Icon name="print" size={16} />
                  Print
                </Button>
              )}
            </MenuPanel>
          )}
        </MenuActions>
      </TitleZone>
      <Strip>
        <Stat>
          <StatLabel as="label" htmlFor="game-size">
            Game Size
          </StatLabel>
          <SizeInput
            id="game-size"
            data-testid="game-size"
            type="number"
            min={0}
            step={500}
            value={gameSize}
            onChange={(e) => setGameSize(e.target.valueAsNumber)}
          />
        </Stat>
        <Stat>
          <StatLabel>Points</StatLabel>
          <PointsValue $over={over} data-testid="points-total">
            {total}
          </PointsValue>
        </Stat>
        <Stat>
          <StatLabel>Units</StatLabel>
          <StatValue>{count}</StatValue>
        </Stat>
        <Stat>
          <StatLabel>Break Point</StatLabel>
          <StatValue data-testid="break-point">{breaks}</StatValue>
        </Stat>
        {isValid ? (
          <ValidIndicator $valid data-testid="valid-indicator">
            Valid
          </ValidIndicator>
        ) : (
          <InvalidButton
            type="button"
            onClick={goToFirstError}
            data-testid="invalid-indicator"
            aria-label={`${errors.length} issue${errors.length === 1 ? '' : 's'} — go to first`}
          >
            {errors.length} issue{errors.length === 1 ? '' : 's'}
          </InvalidButton>
        )}
        {globals.map((e, i) => (
          <GlobalError key={i}>{e.message}</GlobalError>
        ))}
      </Strip>
    </Header>
  );
}
