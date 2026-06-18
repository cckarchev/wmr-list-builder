import styled from 'styled-components';

const Panel = styled.div`
  background: ${({ theme }) => theme.color.bg.surface};
  border: 1px solid ${({ theme }) => theme.color.border.default};
  border-radius: ${({ theme }) => theme.radius.md};
  padding: ${({ theme }) => `${theme.space[4]}px`};
  box-shadow: ${({ theme }) => theme.shadow.panel};
`;

export default Panel;
