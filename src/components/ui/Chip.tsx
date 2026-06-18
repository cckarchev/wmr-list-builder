import styled from 'styled-components';

const Chip = styled.span`
  display: inline-flex;
  align-items: center;
  padding: ${({ theme }) => `${theme.space[1]}px ${theme.space[2]}px`};
  border-radius: ${({ theme }) => theme.radius.pill};
  font-size: ${({ theme }) => theme.fontSize.xs};
  font-family: ${({ theme }) => theme.font.mono};
  background: ${({ theme }) => theme.color.bg.tint};
  color: ${({ theme }) => theme.color.text.dim};
  border: 1px solid ${({ theme }) => theme.color.border.divider};
  white-space: nowrap;
`;

export default Chip;
