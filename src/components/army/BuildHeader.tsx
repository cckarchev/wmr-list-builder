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
import ResetListButton from './ResetListButton';
import SaveListButton from './SaveListButton';
import LoadListButton from './LoadListButton';
import OverflowMenu, { MenuDivider } from './OverflowMenu';
import { useIsDirty } from '../../store/useIsDirty';

const Header = styled.header`
  position: sticky;
  top: 0;
  /* Above the popover/tooltip layer (z-index 30) so open popovers scroll under
     the header rather than over it; below ConfirmDialog (z-index 100). */
  z-index: 40;
  background: ${({ theme }) => theme.color.bg.deep};
  border-bottom: 1px solid ${({ theme }) => theme.color.border.default};
  box-shadow: ${({ theme }) => theme.shadow.panel};
`;

const TitleZone = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${({ theme }) => `${theme.space[2]}px ${theme.space[4]}px`};
  padding: ${({ theme }) => `${theme.space[2]}px ${theme.space[4]}px`};
  /* The header bar is full-bleed; its content is centered to the same width as
     the page body so the title lines up with the roster below. */
  width: 100%;
  max-width: ${({ theme }) => theme.layout.maxWidth};
  margin-inline: auto;
`;

const TitleBlock = styled.div`
  display: flex;
  flex: 1;
  min-width: 0;
  flex-direction: column;
  gap: ${({ theme }) => `${theme.space[1]}px`};
`;

const ArmyName = styled.h1`
  margin: 0;
  font-family: ${({ theme }) => theme.font.display};
  font-size: ${({ theme }) => theme.fontSize.xl};
  color: ${({ theme }) => theme.color.accent};
`;

const ListName = styled.span`
  display: inline-flex;
  align-items: center;
  min-width: 0;
  max-width: 100%;
  color: ${({ theme }) => theme.color.text.dim};
  font-size: ${({ theme }) => theme.fontSize.sm};
`;

const ListNameText = styled.span`
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

const Placeholder = styled.span`
  font-style: italic;
`;

const UnsavedDot = styled.span`
  flex-shrink: 0;
  margin-left: ${({ theme }) => `${theme.space[1]}px`};
  color: ${({ theme }) => theme.color.semantic.warning};
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

const Strip = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${({ theme }) => `${theme.space[2]}px ${theme.space[4]}px`};
  padding: ${({ theme }) => `${theme.space[3]}px ${theme.space[4]}px`};
  border-top: 1px solid ${({ theme }) => theme.color.border.divider};
  width: 100%;
  max-width: ${({ theme }) => theme.layout.maxWidth};
  margin-inline: auto;
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
  display: flex;
  align-items: center;
  justify-content: center;
  /* Match SizeInput's box height (padding + border) so every value row lines
     up despite the input being taller than plain text. */
  padding: ${({ theme }) => `${theme.space[1]}px ${theme.space[2]}px`};
  border: 1px solid transparent;
  font-family: ${({ theme }) => theme.font.mono};
  font-size: ${({ theme }) => theme.fontSize.md};
  color: ${({ theme }) => theme.color.text.strong};
  font-weight: 500;
  text-align: center;
`;

const GameSizeLabel = styled(StatLabel)`
  text-align: center;
`;

// Game size is adjusted in fixed point increments; the − / + buttons step by
// this much, matching the native input's `step`.
const GAME_SIZE_STEP = 500;

// Bordered −/+ group wrapping the editable input, mirroring the Stepper control.
const SizeStepper = styled.div`
  display: inline-flex;
  align-items: stretch;
  align-self: center;
  background: ${({ theme }) => theme.color.bg.panel};
  border: 1px solid ${({ theme }) => theme.color.border.default};
  border-radius: ${({ theme }) => theme.radius.sm};
`;

const SizeStepButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: ${({ theme }) => `${theme.space[6]}px`};
  padding: ${({ theme }) => `0 ${theme.space[2]}px`};
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.color.tealBright};
  font-family: ${({ theme }) => theme.font.mono};
  font-size: ${({ theme }) => theme.fontSize.lg};
  line-height: 1;
  cursor: pointer;
  transition:
    background 0.12s,
    color 0.12s;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.color.ghost.bg};
  }
  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  ${focusRing}
`;

const SizeInput = styled.input`
  /* Sits between the − / + buttons. Fixed width fits the largest game size
     ("2000") and keeps Chrome/Firefox in sync — Chrome ignores the size attr and
     reserves room for the spinner, which we also hide below. */
  width: 7ch;
  box-sizing: border-box;
  text-align: center;
  font-family: ${({ theme }) => theme.font.mono};
  font-size: ${({ theme }) => theme.fontSize.md};
  font-weight: 500;
  color: ${({ theme }) => theme.color.text.strong};
  background: transparent;
  border: none;
  border-inline: 1px solid ${({ theme }) => theme.color.border.default};
  padding: ${({ theme }) => `${theme.space[1]}px ${theme.space[2]}px`};

  /* Hide the native spinner buttons; stepping is handled by the −/+ buttons. */
  appearance: textfield;
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    appearance: none;
    margin: 0;
  }

  ${focusRing}
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

const WarningBanner = styled.div`
  flex-basis: 100%;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => `${theme.space[2]}px`};
  margin: 0;
  font-family: ${({ theme }) => theme.font.body};
  font-size: ${({ theme }) => theme.fontSize.xs};
  color: ${({ theme }) => theme.color.semantic.warning};
`;

const WarningDismiss = styled.button`
  margin-left: auto;
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  font-size: ${({ theme }) => theme.fontSize.sm};
  line-height: 1;
  padding: 0;
`;

export default function BuildHeader() {
  const army = useArmyStore((s) => s.army);
  const armyId = useArmyStore((s) => s.armyId);
  const units = useArmyStore((s) => s.units);
  const errors = useArmyStore((s) => s.errors);
  const loadWarning = useArmyStore((s) => s.loadWarning);
  const setLoadWarning = useArmyStore((s) => s.setLoadWarning);
  const gameSize = useArmyStore((s) => s.gameSize);
  const setGameSize = useArmyStore((s) => s.setGameSize);
  const listName = useArmyStore((s) => s.label);
  const isDirty = useIsDirty();

  const total = pointsCost({ units });
  const count = unitCount(units);
  const breaks = breakPoint(units);
  const isValid = errors.length === 0;
  const over = total > gameSize;
  const globals = globalErrors(errors);

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
        <TitleBlock>
          <ArmyName>{army?.name}</ArmyName>
          <ListName>
            {listName ? (
              <>
                <ListNameText>{listName}</ListNameText>
                {isDirty && (
                  <UnsavedDot data-testid="unsaved-marker" aria-label="unsaved changes">
                    •
                  </UnsavedDot>
                )}
              </>
            ) : (
              <Placeholder>Unsaved</Placeholder>
            )}
          </ListName>
        </TitleBlock>
        <InlineActions data-testid="actions-inline">
          <SaveListButton />
          <LoadListButton />
          <OverflowMenu>
            <CopyShareLinkButton />
            <CopyListButton />
            {armyId && (
              <Button as={Link} to={`/print/${armyId}`} $variant="ghost" $size="sm">
                <Icon name="print" size={16} />
                Print
              </Button>
            )}
            <MenuDivider />
            <ResetListButton />
          </OverflowMenu>
        </InlineActions>
        <MenuActions data-testid="actions-menu">
          <SaveListButton />
          <LoadListButton />
          <OverflowMenu>
            <CopyShareLinkButton />
            <CopyListButton />
            {armyId && (
              <Button as={Link} to={`/print/${armyId}`} $variant="ghost" $size="sm">
                <Icon name="print" size={16} />
                Print
              </Button>
            )}
            <MenuDivider />
            <ResetListButton />
          </OverflowMenu>
        </MenuActions>
      </TitleZone>
      <Strip>
        <Stat>
          <GameSizeLabel as="label" htmlFor="game-size">
            Game Size
          </GameSizeLabel>
          <SizeStepper>
            <SizeStepButton
              type="button"
              aria-label="decrease game size"
              disabled={gameSize <= 0}
              onClick={() => setGameSize(gameSize - GAME_SIZE_STEP)}
            >
              −
            </SizeStepButton>
            <SizeInput
              id="game-size"
              data-testid="game-size"
              type="number"
              min={0}
              step={GAME_SIZE_STEP}
              value={gameSize}
              onChange={(e) => setGameSize(e.target.valueAsNumber)}
            />
            <SizeStepButton
              type="button"
              aria-label="increase game size"
              onClick={() => setGameSize(gameSize + GAME_SIZE_STEP)}
            >
              +
            </SizeStepButton>
          </SizeStepper>
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
          <StatLabel>Break</StatLabel>
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
        {loadWarning && (
          <WarningBanner role="alert">
            {loadWarning}
            <WarningDismiss
              type="button"
              aria-label="Dismiss warning"
              onClick={() => setLoadWarning(null)}
            >
              ✕
            </WarningDismiss>
          </WarningBanner>
        )}
      </Strip>
    </Header>
  );
}
