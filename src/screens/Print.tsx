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
  /* Above the popover/tooltip layer (z-index 30) so open popovers scroll under
     the controls bar rather than over it; below ConfirmDialog (z-index 100). */
  z-index: 40;
  background: ${({ theme }) => theme.color.bg.deep};
  border-bottom: 1px solid ${({ theme }) => theme.color.border.default};
  padding: ${({ theme }) => `${theme.space[3]}px ${theme.space[4]}px`};
  /* Two columns: the toggle groups stack on the left, the Print button is its
     own full-height column on the right. The button never shares a line with
     the wrapping checkboxes, so nothing flows above or below it. */
  display: flex;
  align-items: stretch;
  gap: ${({ theme }) => `${theme.space[3]}px`};
`;

// Left column: the Sections and Options groups stacked. Wrapping happens inside
// this column only, keeping the checkboxes clear of the Print button.
const Stack = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => `${theme.space[3]}px`};
`;

const Group = styled.div`
  display: flex;
  /* Top-align the label so it sits on the first line of toggles even when they
     wrap onto multiple rows, rather than floating in the vertical center. */
  align-items: flex-start;
  gap: ${({ theme }) => `${theme.space[2]}px`};
  min-width: 0;
`;

const GroupLabel = styled.span`
  flex: none;
  /* Fixed width lines the "Sections" and "Options" labels into a column and
     starts both sets of toggles at the same x. Wide enough to hold the longest
     label ("SECTIONS") at its 0.2em tracking without spilling onto the first
     toggle. */
  width: 90px;
  white-space: nowrap;
  /* Nudge down to align with the toggle text on the first row. */
  padding-top: 3px;
  font-family: ${({ theme }) => theme.font.mono};
  font-size: ${({ theme }) => theme.fontSize.xs};
  text-transform: uppercase;
  letter-spacing: ${({ theme }) => theme.tracking.label};
  color: ${({ theme }) => theme.color.text.dim};
`;

const Toggles = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => `${theme.space[2]}px ${theme.space[3]}px`};
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
  /* Own column on the right: a tall tile with the icon over the label, centered
     vertically against the stacked toggle groups. */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => `${theme.space[1]}px`};
  flex: none;
  font-family: ${({ theme }) => theme.font.body};
  font-size: ${({ theme }) => theme.fontSize.sm};
  font-weight: 500;
  padding: ${({ theme }) => `${theme.space[2]}px ${theme.space[4]}px`};
  background: ${({ theme }) => theme.color.accent};
  color: ${({ theme }) => theme.color.accentInk};
  border: none;
  border-radius: ${({ theme }) => theme.radius.sm};
  cursor: pointer;
  white-space: nowrap;

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
        <Stack>
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

          <Group>
            <GroupLabel>Options</GroupLabel>
            <Toggles>
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
                  checked={condensed}
                  onChange={() => setCondensed((v) => !v)}
                />
                Condensed
              </CheckLabel>
              <CheckLabel>
                <CheckInput
                  type="checkbox"
                  checked={smallFont}
                  onChange={() => setSmallFont((v) => !v)}
                />
                Smaller font
              </CheckLabel>
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
                  checked={hideTitle}
                  onChange={() => setHideTitle((v) => !v)}
                />
                Hide name
              </CheckLabel>
            </Toggles>
          </Group>
        </Stack>

        <PrintButton onClick={() => window.print()}>
          <Icon name="print" size={18} />
          Print
        </PrintButton>
      </Controls>

      <PrintView
        sections={sections}
        selectedIds={selectedIds}
        options={{ spellFluff, twoColumn, smallFont, hideTitle, condensed }}
      />
    </Page>
  );
}
