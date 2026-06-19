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
}

const StatTable = styled.div`
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(0, 1fr);
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
}: StatLineProps) {
  const cells: Array<{ label: string; value: string }> = [];

  // Always render every column (filling absent stats with "–") so the grid
  // lines up consistently across units regardless of which stats they have.
  cells.push({ label: 'Att', value: stat(attack) });
  cells.push({ label: 'Range', value: stat(range) });
  cells.push({ label: 'Hits', value: stat(hits) });
  cells.push({ label: 'Armour', value: stat(armour) });
  cells.push({ label: 'Cmd', value: stat(command) });
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
