import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { useArmyStore } from '../store/useArmyStore';
import PrintView from '../components/print/PrintView';
import { availablePrintSections } from '../components/print/printSections';
import Icon from '../components/ui/Icon';

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

const Group = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: ${({ theme }) => `${theme.space[2]}px`};
`;

const GroupLabel = styled.span`
  font-family: ${({ theme }) => theme.font.mono};
  font-size: ${({ theme }) => theme.fontSize.xs};
  text-transform: uppercase;
  letter-spacing: ${({ theme }) => theme.tracking.label};
  color: ${({ theme }) => theme.color.text.dim};
`;

// Forces the options onto their own row beneath the sections and print button.
const OptionsGroup = styled(Group)`
  flex-basis: 100%;
`;

const Toggles = styled.div`
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

const PrintButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => `${theme.space[2]}px`};
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

export default function Print() {
  const { armyId } = useParams<{ armyId: string }>();
  const army = useArmyStore((s) => s.army);
  const armyIdInStore = useArmyStore((s) => s.armyId);
  const setArmy = useArmyStore((s) => s.setArmy);
  const hasArmyRules = useArmyStore((s) => !!s.army?.armyRules);
  const hasSpecialRules = useArmyStore((s) => !!s.specialRules);
  const magic = useArmyStore((s) => s.magic);

  // Load army if not already loaded or if different army
  useEffect(() => {
    if (armyId && armyIdInStore !== armyId) {
      setArmy(armyId);
    }
  }, [armyId, armyIdInStore, setArmy]);

  const sections = useMemo(
    () => availablePrintSections({ hasArmyRules, hasSpecialRules, magic }),
    [hasArmyRules, hasSpecialRules, magic],
  );

  // Local selection state: start with all available sections selected.
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set(sections.map((s) => s.id)),
  );

  // When the loaded army changes, reset the selection to all sections.
  // Adjusting state during render (React's recommended pattern) instead of an
  // effect avoids an extra render pass.
  const [selectionArmy, setSelectionArmy] = useState(army);
  if (army !== selectionArmy) {
    setSelectionArmy(army);
    setSelectedIds(new Set(sections.map((s) => s.id)));
  }

  // Print options (distinct from which sections to include). Both default off.
  const [spellFluff, setSpellFluff] = useState(false);
  const [twoColumn, setTwoColumn] = useState(false);
  const [smallFont, setSmallFont] = useState(false);
  const [hideTitle, setHideTitle] = useState(false);
  const [condensed, setCondensed] = useState(false);

  const toggle = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  if (!army) return null;

  return (
    <Page>
      <Controls className="no-print">
        <Group>
          <GroupLabel>Sections</GroupLabel>
          <Toggles>
            {sections.map((section) => (
              <CheckLabel key={section.id}>
                <CheckInput
                  type="checkbox"
                  checked={selectedIds.has(section.id)}
                  onChange={() => toggle(section.id)}
                />
                {section.title}
              </CheckLabel>
            ))}
          </Toggles>
        </Group>

        <PrintButton onClick={() => window.print()}>
          <Icon name="print" size={16} />
          Print
        </PrintButton>

        <OptionsGroup>
          <GroupLabel>Options</GroupLabel>
          <Toggles>
            {magic && (
              <CheckLabel>
                <CheckInput
                  type="checkbox"
                  checked={spellFluff}
                  onChange={() => setSpellFluff((v) => !v)}
                />
                Spell fluff
              </CheckLabel>
            )}
            <CheckLabel>
              <CheckInput
                type="checkbox"
                checked={twoColumn}
                onChange={() => setTwoColumn((v) => !v)}
              />
              Two columns
            </CheckLabel>
            <CheckLabel>
              <CheckInput
                type="checkbox"
                checked={smallFont}
                onChange={() => setSmallFont((v) => !v)}
              />
              Smaller font
            </CheckLabel>
            <CheckLabel>
              <CheckInput
                type="checkbox"
                checked={condensed}
                onChange={() => setCondensed((v) => !v)}
              />
              Condensed
            </CheckLabel>
            <CheckLabel>
              <CheckInput
                type="checkbox"
                checked={hideTitle}
                onChange={() => setHideTitle((v) => !v)}
              />
              Hide name
            </CheckLabel>
          </Toggles>
        </OptionsGroup>
      </Controls>

      <PrintView
        sections={sections}
        selectedIds={selectedIds}
        options={{ spellFluff, twoColumn, smallFont, hideTitle, condensed }}
      />
    </Page>
  );
}
