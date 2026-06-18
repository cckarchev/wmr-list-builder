import styled from 'styled-components';
import type { ValidationError } from '../../data/types';

interface InlineErrorsProps {
  errors: ValidationError[];
  label?: string;
}

const List = styled.ul`
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => `${theme.space[1]}px`};
`;

const Item = styled.li`
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => `${theme.space[2]}px`};
  color: ${({ theme }) => theme.color.semantic.error};
  font-family: ${({ theme }) => theme.font.body};
  font-size: ${({ theme }) => theme.fontSize.xs};
  line-height: 1.4;
`;

const Marker = styled.span`
  flex-shrink: 0;
  font-family: ${({ theme }) => theme.font.mono};
  font-weight: 700;
`;

/** Renders the validation errors attributed to a single roster row. */
export default function InlineErrors({ errors, label = 'Unit errors' }: InlineErrorsProps) {
  if (errors.length === 0) return null;
  return (
    <List role="list" aria-label={label}>
      {errors.map((error, i) => (
        <Item key={i}>
          <Marker aria-hidden="true">!</Marker>
          {error.message}
        </Item>
      ))}
    </List>
  );
}
