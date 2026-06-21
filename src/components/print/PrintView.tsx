import styled from 'styled-components';
import { useArmyStore } from '../../store/useArmyStore';
import type { PrintSectionDef } from './printSections';

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

const Section = styled.section`
  margin-bottom: ${({ theme }) => `${theme.space[4]}px`};
  padding-bottom: ${({ theme }) => `${theme.space[3]}px`};
  border-bottom: 1px dashed ${({ theme }) => theme.color.border.divider};

  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
  }
`;

interface PrintViewProps {
  sections: PrintSectionDef[];
  selectedIds: Set<string>;
}

export default function PrintView({ sections, selectedIds }: PrintViewProps) {
  const armyName = useArmyStore((s) => s.army?.name ?? '');
  const label = useArmyStore((s) => s.label);
  const title = label ? `${armyName} · ${label}` : armyName;

  return (
    <Document className="print-document">
      {armyName && <Title>{title}</Title>}
      {sections
        .filter((section) => selectedIds.has(section.id))
        .map((section) => (
          <Section key={section.id}>{section.render()}</Section>
        ))}
    </Document>
  );
}
