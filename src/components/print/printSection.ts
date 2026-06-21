import styled from 'styled-components';

// Shared building blocks for the print-sheet sections (Army Rules, Special
// Rules, Magic Items, Spells). These were previously duplicated verbatim in
// each section component.

/** Outer block for a print sheet section. */
export const PrintSection = styled.div`
  color: ${({ theme }) => theme.color.text.body};
`;

/** Centered section title. Spans the full width when a section is laid out
 * in two columns (no effect outside a multi-column context). */
export const PrintHeading = styled.h3`
  font-family: ${({ theme }) => theme.font.display};
  font-size: ${({ theme }) => theme.fontSize.lg};
  color: ${({ theme }) => theme.color.text.strong};
  text-align: center;
  margin-bottom: ${({ theme }) => `${theme.space[3]}px`};
  column-span: all;
`;

/** Definition list of name/description entries. */
export const DefList = styled.dl`
  font-size: ${({ theme }) => theme.fontSize.sm};
`;

/** Definition term (entry name). */
export const DefTerm = styled.dt`
  font-weight: 600;
  color: ${({ theme }) => theme.color.text.strong};
  margin-top: ${({ theme }) => `${theme.space[3]}px`};

  &:first-child {
    margin-top: 0;
  }
`;

/** Definition description (entry body). */
export const DefDesc = styled.dd`
  margin: 0;
  line-height: 1.6;
`;
