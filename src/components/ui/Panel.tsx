import styled from 'styled-components';

const Panel = styled.div`
  background: ${({ theme }) => theme.color.bg.panel};
  border: 1px solid ${({ theme }) => theme.color.border.default};
  border-radius: ${({ theme }) => theme.radius.md};
  padding: ${({ theme }) => `${theme.space[4]}px`};
  transition: border-color 0.15s;

  &:hover {
    border-color: ${({ theme }) => theme.color.border.hover};
  }
`;

export default Panel;
