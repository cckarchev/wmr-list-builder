import styled from 'styled-components';
import { focusRing } from '../../theme/focusRing';

interface StepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  label: string;
}

const StepperWrapper = styled.div`
  display: inline-flex;
  align-items: stretch;
  border: 1px solid ${({ theme }) => theme.color.border.default};
  border-radius: ${({ theme }) => theme.radius.sm};
`;

const StepButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: ${({ theme }) => `${theme.space[6]}px`};
  padding: ${({ theme }) => `${theme.space[1]}px ${theme.space[2]}px`};
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

const StepperValue = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 2.5ch;
  padding: ${({ theme }) => `0 ${theme.space[2]}px`};
  border-left: 1px solid ${({ theme }) => theme.color.border.default};
  border-right: 1px solid ${({ theme }) => theme.color.border.default};
  font-family: ${({ theme }) => theme.font.mono};
  font-size: ${({ theme }) => theme.fontSize.md};
  font-weight: 600;
  color: ${({ theme }) => theme.color.text.strong};
`;

export default function Stepper({ value, onChange, min, max, label }: StepperProps) {
  const atMin = min !== undefined && value <= min;
  const atMax = max !== undefined && value >= max;

  return (
    <StepperWrapper>
      <StepButton
        disabled={atMin}
        onClick={() => onChange(value - 1)}
        aria-label={`decrease ${label}`}
        type="button"
      >
        −
      </StepButton>
      <StepperValue>{value}</StepperValue>
      <StepButton
        disabled={atMax}
        onClick={() => onChange(value + 1)}
        aria-label={`increase ${label}`}
        type="button"
      >
        +
      </StepButton>
    </StepperWrapper>
  );
}
