import styled from 'styled-components';
import type { ValidationError } from '../../data/types';

interface ErrorListProps {
  errors: ValidationError[];
}

const ErrorUl = styled.ul`
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => `${theme.space[1]}px`};
`;

const ErrorItem = styled.li`
  color: ${({ theme }) => theme.color.semantic.error};
  font-size: ${({ theme }) => theme.fontSize.sm};
  font-family: ${({ theme }) => theme.font.body};
  padding: ${({ theme }) => `${theme.space[2]}px ${theme.space[3]}px`};
  border-left: 2px solid ${({ theme }) => theme.color.semantic.error};
  background: ${({ theme }) => theme.color.bg.tint};
  border-radius: ${({ theme }) => `0 ${theme.radius.sm} ${theme.radius.sm} 0`};
`;

export default function ErrorList({ errors }: ErrorListProps) {
  if (errors.length === 0) return null;
  return (
    <ErrorUl role="list" aria-label="Validation errors">
      {errors.map((error, i) => (
        <ErrorItem key={i}>{error.message}</ErrorItem>
      ))}
    </ErrorUl>
  );
}
