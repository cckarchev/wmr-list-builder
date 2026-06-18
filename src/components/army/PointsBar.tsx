import styled from 'styled-components';
import { useArmyStore } from '../../store/useArmyStore';
import { pointsCost, unitCount, globalErrors } from '../../store/selectors';
import { unitDomId } from './unitDomId';
import { focusRing } from '../../theme/focusRing';

const Bar = styled.div`
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${({ theme }) => `${theme.space[2]}px ${theme.space[4]}px`};
  padding: ${({ theme }) => `${theme.space[3]}px ${theme.space[4]}px`};
  background: ${({ theme }) => theme.color.bg.deep};
  border-bottom: 1px solid ${({ theme }) => theme.color.border.default};
  box-shadow: ${({ theme }) => theme.shadow.panel};
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

interface ValidIndicatorProps {
  $valid: boolean;
}

const ValidIndicator = styled.span<ValidIndicatorProps>`
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

export default function PointsBar() {
  const units = useArmyStore((s) => s.units);
  const errors = useArmyStore((s) => s.errors);
  const gameSize = useArmyStore((s) => s.gameSize);
  const setGameSize = useArmyStore((s) => s.setGameSize);

  const total = pointsCost({ units });
  const count = unitCount(units);
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
    <Bar className="no-print" data-testid="points-bar">
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
    </Bar>
  );
}
