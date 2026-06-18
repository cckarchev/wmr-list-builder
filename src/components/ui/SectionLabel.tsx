import styled from 'styled-components';
import ChevronMark from './ChevronMark';

interface SectionLabelProps {
  label: string;
  number?: string;
  color?: string;
}

const Wrap = styled.span<{ $color?: string }>`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => `${theme.space[2]}px`};
  font-family: ${({ theme }) => theme.font.mono};
  font-size: ${({ theme }) => theme.fontSize.xs};
  letter-spacing: ${({ theme }) => theme.tracking.labelWide};
  text-transform: uppercase;
  white-space: nowrap;
  color: ${({ $color, theme }) => $color ?? theme.color.accent};
`;

export default function SectionLabel({ label, number, color }: SectionLabelProps) {
  const text = number ? `${number}: ${label}` : label;
  return (
    <Wrap $color={color}>
      <ChevronMark color="currentColor" size={11} />
      <span>{text}</span>
    </Wrap>
  );
}
