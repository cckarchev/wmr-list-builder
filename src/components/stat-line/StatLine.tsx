import type { StatValue } from '@/data/types';
import styles from './StatLine.module.css';

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

const stat = (value: StatValue | undefined): string =>
  value !== undefined && value !== '' ? String(value) : '–';

export const StatLine = ({
  attack,
  range,
  hits,
  armour,
  command,
  size,
  points,
  character = false,
}: StatLineProps) => {
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
    <div className={styles.table}>
      {cells.map(({ label, value }) => (
        <span className={styles.cell} key={label}>
          <span className={styles.label}>{label}</span>
          <span className={styles.figure}>{value}</span>
        </span>
      ))}
    </div>
  );
};
