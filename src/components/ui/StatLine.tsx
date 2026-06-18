import styled from 'styled-components';
import type { StatValue } from '../../data/types';

export interface StatLineProps {
  type?: string;
  attack?: StatValue;
  range?: string;
  hits?: StatValue;
  armour?: string;
  command?: number;
  size?: number;
  points?: StatValue;
}

const StatTable = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => `${theme.space[2]}px ${theme.space[3]}px`};
  font-family: ${({ theme }) => theme.font.mono};
  font-size: ${({ theme }) => theme.fontSize.xs};
  color: ${({ theme }) => theme.color.text.dim};
`;

const StatCell = styled.span`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => `${theme.space[1]}px`};
`;

const StatLabel = styled.span`
  font-size: ${({ theme }) => theme.fontSize.xs};
  color: ${({ theme }) => theme.color.text.dim};
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

const StatValue = styled.span`
  color: ${({ theme }) => theme.color.text.body};
  font-weight: 500;
`;

function stat(value: StatValue | undefined): string {
  return value !== undefined && value !== '' ? String(value) : '-';
}

export default function StatLine({
  type,
  attack,
  range,
  hits,
  armour,
  command,
  size,
  points,
}: StatLineProps) {
  const cells: Array<{ label: string; value: string }> = [];

  if (type !== undefined) cells.push({ label: 'Type', value: stat(type) });
  cells.push({ label: 'Att', value: stat(attack) });
  if (range !== undefined) cells.push({ label: 'Range', value: stat(range) });
  cells.push({ label: 'Hits', value: stat(hits) });
  cells.push({ label: 'Armour', value: stat(armour) });
  if (command !== undefined) cells.push({ label: 'Cmd', value: stat(command) });
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
