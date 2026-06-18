import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { useArmyStore } from '../store/useArmyStore';
import PrintView from '../components/print/PrintView';

const Page = styled.main`
  min-height: 100dvh;
`;

const Controls = styled.div`
  position: sticky;
  top: 0;
  z-index: 10;
  background: ${({ theme }) => theme.color.bg.deep};
  border-bottom: 1px solid ${({ theme }) => theme.color.border.default};
  padding: ${({ theme }) => `${theme.space[3]}px ${theme.space[4]}px`};
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${({ theme }) => `${theme.space[3]}px`};
`;

const SectionToggles = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => `${theme.space[2]}px`};
`;

const CheckLabel = styled.label`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => `${theme.space[1]}px`};
  font-size: ${({ theme }) => theme.fontSize.sm};
  color: ${({ theme }) => theme.color.text.body};
  cursor: pointer;
`;

const CheckInput = styled.input`
  cursor: pointer;
  accent-color: ${({ theme }) => theme.color.accent};
`;

const LabelInput = styled.input`
  font-family: ${({ theme }) => theme.font.body};
  font-size: ${({ theme }) => theme.fontSize.sm};
  color: ${({ theme }) => theme.color.text.body};
  background: ${({ theme }) => theme.color.bg.surface};
  border: 1px solid ${({ theme }) => theme.color.border.default};
  border-radius: ${({ theme }) => theme.radius.sm};
  padding: ${({ theme }) => `${theme.space[1]}px ${theme.space[2]}px`};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.color.border.active};
  }
`;

const PrintButton = styled.button`
  font-family: ${({ theme }) => theme.font.body};
  font-size: ${({ theme }) => theme.fontSize.sm};
  font-weight: 500;
  padding: ${({ theme }) => `${theme.space[2]}px ${theme.space[3]}px`};
  background: ${({ theme }) => theme.color.accent};
  color: ${({ theme }) => theme.color.accentInk};
  border: none;
  border-radius: ${({ theme }) => theme.radius.sm};
  cursor: pointer;
  margin-left: auto;

  &:hover {
    opacity: 0.85;
  }
`;

const Hint = styled.p`
  width: 100%;
  font-size: ${({ theme }) => theme.fontSize.xs};
  color: ${({ theme }) => theme.color.text.dim};
`;

export default function Print() {
  const { armyId } = useParams<{ armyId: string }>();
  const army = useArmyStore((s) => s.army);
  const armyIdInStore = useArmyStore((s) => s.armyId);
  const setArmy = useArmyStore((s) => s.setArmy);
  const printableItems = useArmyStore((s) => s.printableItems);
  const printItems = useArmyStore((s) => s.printItems);
  const label = useArmyStore((s) => s.label);
  const setLabel = useArmyStore((s) => s.setLabel);

  // Load army if not already loaded or if different army
  useEffect(() => {
    if (armyId && armyIdInStore !== armyId) {
      setArmy(armyId);
    }
  }, [armyId, armyIdInStore, setArmy]);

  // All available section items (combined from both printableItems and printItems)
  const allItems = [...printableItems, ...printItems];

  // Local selection state: start with all sections selected
  const [selectedAbbrs, setSelectedAbbrs] = useState<Set<string>>(
    () => new Set(allItems.map((item) => item.abbr)),
  );

  // When the loaded army changes, reset the selection to all sections.
  // Adjusting state during render (React's recommended pattern) instead of
  // an effect avoids an extra render pass.
  const [selectionArmy, setSelectionArmy] = useState(army);
  if (army !== selectionArmy) {
    setSelectionArmy(army);
    setSelectedAbbrs(new Set(allItems.map((item) => item.abbr)));
  }

  const toggleAbbr = (abbr: string) => {
    setSelectedAbbrs((prev) => {
      const next = new Set(prev);
      if (next.has(abbr)) {
        next.delete(abbr);
      } else {
        next.add(abbr);
      }
      return next;
    });
  };

  if (!army) return null;

  return (
    <Page>
      <Controls className="no-print">
        <SectionToggles>
          {allItems.map((item) => (
            <CheckLabel key={item.abbr}>
              <CheckInput
                type="checkbox"
                checked={selectedAbbrs.has(item.abbr)}
                onChange={() => toggleAbbr(item.abbr)}
              />
              {item.title}
            </CheckLabel>
          ))}
        </SectionToggles>
        <LabelInput
          type="text"
          placeholder="Optional label…"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
        />
        <PrintButton onClick={() => window.print()}>Print</PrintButton>
        <Hint>Check the sections you want to include, then click Print.</Hint>
      </Controls>

      <PrintView selectedAbbrs={selectedAbbrs} />
    </Page>
  );
}
