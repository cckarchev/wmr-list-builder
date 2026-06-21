import styled from 'styled-components';
import { useArmyStore } from '../../store/useArmyStore';
import type { PrintSectionDef } from './printSections';
import { PrintOptionsContext, type PrintOptions } from './printOptions';

const Document = styled.div`
  padding: ${({ theme }) => `${theme.space[4]}px`};
  color: ${({ theme }) => theme.color.text.body};
`;

const Title = styled.h1`
  font-family: ${({ theme }) => theme.font.display};
  font-size: ${({ theme }) => theme.fontSize.xl};
  color: ${({ theme }) => theme.color.text.strong};
  text-align: center;
  margin-bottom: ${({ theme }) => `${theme.space[4]}px`};
`;

const Section = styled.section<{ $columns?: boolean }>`
  margin-bottom: ${({ theme }) => `${theme.space[4]}px`};
  padding-bottom: ${({ theme }) => `${theme.space[3]}px`};
  border-bottom: 1px dashed ${({ theme }) => theme.color.border.divider};

  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
  }

  ${({ $columns, theme }) =>
    $columns &&
    `
    column-count: 2;
    column-gap: ${theme.space[5]}px;

    /* Keep a heading glued to the start of its body, and never split a single
       paragraph across the gap, but let multi-paragraph bodies flow from one
       column into the next at paragraph boundaries. */
    dt {
      break-after: avoid;
    }
    p {
      break-inside: avoid;
    }
  `}
`;

interface PrintViewProps {
  sections: PrintSectionDef[];
  selectedIds: Set<string>;
  options: PrintOptions;
}

export default function PrintView({ sections, selectedIds, options }: PrintViewProps) {
  const armyName = useArmyStore((s) => s.army?.name ?? '');
  const label = useArmyStore((s) => s.label);
  const title = label ? `${armyName} · ${label}` : armyName;

  const classes = ['print-document'];
  if (options.smallFont) classes.push('font-small');
  if (options.condensed) classes.push('condensed');

  return (
    <PrintOptionsContext.Provider value={options}>
      <Document className={classes.join(' ')}>
        {armyName && !options.hideTitle && <Title>{title}</Title>}
        {sections
          .filter((section) => selectedIds.has(section.id))
          .map((section) => (
            <Section key={section.id} $columns={options.twoColumn && section.id !== 'stats'}>
              {section.render()}
            </Section>
          ))}
      </Document>
    </PrintOptionsContext.Provider>
  );
}
