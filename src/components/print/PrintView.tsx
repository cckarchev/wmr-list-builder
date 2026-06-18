import styled from 'styled-components';
import TextList from './TextList';
import Stats from './Stats';
import ArmyRules from './ArmyRules';
import SpecialRules from './SpecialRules';
import MagicItems from './MagicItems';
import Spells from './Spells';

const Document = styled.div`
  padding: ${({ theme }) => `${theme.space[4]}px`};
  color: ${({ theme }) => theme.color.text.body};
`;

const Section = styled.section`
  margin-bottom: ${({ theme }) => `${theme.space[6]}px`};
  padding-bottom: ${({ theme }) => `${theme.space[5]}px`};
  border-bottom: 1px dashed ${({ theme }) => theme.color.border.divider};

  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
  }
`;

interface PrintViewProps {
  selectedAbbrs: Set<string>;
}

export default function PrintView({ selectedAbbrs }: PrintViewProps) {
  return (
    <Document className="print-document">
      {selectedAbbrs.has('l') && (
        <Section>
          <TextList />
        </Section>
      )}
      {selectedAbbrs.has('s') && (
        <Section>
          <Stats used={false} />
        </Section>
      )}
      {selectedAbbrs.has('sl') && (
        <Section>
          <Stats used={true} />
        </Section>
      )}
      {selectedAbbrs.has('ar') && (
        <Section>
          <ArmyRules />
        </Section>
      )}
      {selectedAbbrs.has('sr') && (
        <Section>
          <SpecialRules used={false} />
        </Section>
      )}
      {selectedAbbrs.has('sru') && (
        <Section>
          <SpecialRules used={true} />
        </Section>
      )}
      {selectedAbbrs.has('mi') && (
        <Section>
          <MagicItems used={false} />
        </Section>
      )}
      {selectedAbbrs.has('miu') && (
        <Section>
          <MagicItems used={true} />
        </Section>
      )}
      {selectedAbbrs.has('sp') && (
        <Section>
          <Spells />
        </Section>
      )}
    </Document>
  );
}
