import styled from 'styled-components';
import { useArmyStore } from '../../store/useArmyStore';
import { focusRing } from '../../theme/focusRing';

// Game size is adjusted in fixed point increments; the − / + buttons step by
// this much, matching the native input's `step`.
const GAME_SIZE_STEP = 500;

const Label = styled.label`
  font-family: ${({ theme }) => theme.font.mono};
  font-size: ${({ theme }) => theme.fontSize.xs};
  color: ${({ theme }) => theme.color.text.dim};
  text-transform: uppercase;
  letter-spacing: ${({ theme }) => theme.tracking.label};
  text-align: center;
`;

// Bordered −/+ group wrapping the editable input, mirroring the Stepper control.
const Stepper = styled.div`
  display: inline-flex;
  align-items: stretch;
  align-self: center;
  background: ${({ theme }) => theme.color.bg.panel};
  border: 1px solid ${({ theme }) => theme.color.border.default};
  border-radius: ${({ theme }) => theme.radius.sm};
`;

const StepButton = styled.button`
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

const Input = styled.input`
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

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => `${theme.space[1]}px`};
`;

export default function GameSizeStepper() {
  const gameSize = useArmyStore((s) => s.gameSize);
  const setGameSize = useArmyStore((s) => s.setGameSize);

  return (
    <Field>
      <Label htmlFor="game-size">Game Size</Label>
      <Stepper>
        <StepButton
          type="button"
          aria-label="decrease game size"
          disabled={gameSize <= 0}
          onClick={() => setGameSize(gameSize - GAME_SIZE_STEP)}
        >
          −
        </StepButton>
        <Input
          id="game-size"
          data-testid="game-size"
          type="number"
          min={0}
          step={GAME_SIZE_STEP}
          value={gameSize}
          onChange={(e) => setGameSize(e.target.valueAsNumber)}
        />
        <StepButton
          type="button"
          aria-label="increase game size"
          onClick={() => setGameSize(gameSize + GAME_SIZE_STEP)}
        >
          +
        </StepButton>
      </Stepper>
    </Field>
  );
}
