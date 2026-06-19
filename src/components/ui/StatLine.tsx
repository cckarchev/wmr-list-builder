import styled from 'styled-components';
import type { StatValue } from '../../data/types';

export interface StatLineProps {
  attack?: StatValue;
  range?: string;
  hits?: StatValue;
  armour?: string;
  command?: number;
  size?: number;
  points?: StatValue;
  /**
   * Whether this unit is a character (General/Hero/Wizard). Characters carry a
   * Command value but never Range/Hits/Armour, so they show Att/Cmd/Size/Pts;
   * everyone else shows Att/Range/Hits/Armour/Size/Pts.
   */
  character?: boolean;
}

const StatTable = styled.div`
  display: grid;
  grid-auto-flow: column;
  /* Fixed-width columns packed from the left (rather than stretch-to-fill) so a
     character's shorter row stays compact instead of ballooning, and the Att
     column lines up card-to-card. */
  grid-auto-columns: minmax(0, 3.5rem);
  justify-content: start;
  align-items: end;
`;

const StatCell = styled.span`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => `${theme.space[1]}px`};
  padding: ${({ theme }) => `0 ${theme.space[1]}px`};
  text-align: center;

  & + & {
    border-left: 1px solid ${({ theme }) => theme.color.border.divider};
  }
`;

const StatLabel = styled.span`
  font-family: ${({ theme }) => theme.font.mono};
  font-size: ${({ theme }) => theme.fontSize.xs};
  color: ${({ theme }) => theme.color.text.dim};
  text-transform: uppercase;
  letter-spacing: 0.06em;
`;

const StatValue = styled.span`
  font-family: ${({ theme }) => theme.font.mono};
  font-size: ${({ theme }) => theme.fontSize.md};
  color: ${({ theme }) => theme.color.text.strong};
  font-weight: 600;
`;

function stat(value: StatValue | undefined): string {
  return value !== undefined && value !== '' ? String(value) : '–';
}

export default function StatLine({
  attack,
  range,
  hits,
  armour,
  command,
  size,
  points,
  character = false,
}: StatLineProps) {
  const cells: Array<{ label: string; value: string }> = [];

  // Characters and troops carry disjoint stat sets, so each shows only its own.
  // Characters: Att / Cmd / Size / Pts (no character has Range/Hits/Armour).
  // Troops: Att / Range / Hits / Armour / Size / Pts (no Cmd). Absent stats
  // within a set still render as "–" so the columns line up across units.
  cells.push({ label: 'Att', value: stat(attack) });
  if (character) {
    cells.push({ label: 'Cmd', value: stat(command) });
  } else {
    cells.push({ label: 'Range', value: stat(range) });
    cells.push({ label: 'Hits', value: stat(hits) });
    cells.push({ label: 'Armour', value: stat(armour) });
  }
  cells.push({ label: 'Size', value: stat(size) });
  cells.push({ label: 'Pts', value: stat(points) });

  return (
    <StatTable>
      {cells.map(({ label, value }) => (
        <StatCell key={label}>
          <StatLabel>{label}</StatLabel>
          <StatValue>{value}</StatValue>
        </StatCell>
      ))}
    </StatTable>
  );
}
