import styled from 'styled-components';
import Button from './Button';

interface StepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  label: string;
}

const StepperWrapper = styled.div`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => `${theme.space[1]}px`};
`;

const StepperValue = styled.span`
  font-family: ${({ theme }) => theme.font.mono};
  font-size: ${({ theme }) => theme.fontSize.sm};
  color: ${({ theme }) => theme.color.text.strong};
  min-width: 2ch;
  text-align: center;
  padding: ${({ theme }) => `0 ${theme.space[1]}px`};
`;

const StepButton = styled(Button)`
  padding: ${({ theme }) => `${theme.space[1]}px ${theme.space[2]}px`};
  font-size: ${({ theme }) => theme.fontSize.md};
  line-height: 1;
`;

export default function Stepper({ value, onChange, min, max, label }: StepperProps) {
  const atMin = min !== undefined && value <= min;
  const atMax = max !== undefined && value >= max;

  return (
    <StepperWrapper>
      <StepButton
        $variant="ghost"
        disabled={atMin}
        onClick={() => onChange(value - 1)}
        aria-label={`decrease ${label}`}
        type="button"
      >
        −
      </StepButton>
      <StepperValue>{value}</StepperValue>
      <StepButton
        $variant="ghost"
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
