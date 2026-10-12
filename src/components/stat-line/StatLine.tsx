import { formatStat } from '@/core/lib/formatStat';
import type { StatValue } from '@/data/types';
import styles from './StatLine.module.css';

interface StatLineProps {
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
  // `shortLabel` replaces the label on a phone, where the columns are narrowest.
  const cells: Array<{ label: string; shortLabel?: string; value: string }> = [];

  // Characters and troops carry disjoint stat sets, so each shows only its own.
  // Characters: Att / Cmd / Size / Pts (no character has Range/Hits/Armour).
  // Troops: Att / Range / Hits / Armour / Size / Pts (no Cmd). Absent stats
  // within a set still render as "–" so the columns line up across units.
  cells.push({ label: 'Att', value: formatStat(attack) });

  if (character) {
    cells.push({ label: 'Cmd', value: formatStat(command) });
  } else {
    cells.push({ label: 'Range', value: formatStat(range) });
    cells.push({ label: 'Hits', value: formatStat(hits) });
    cells.push({ label: 'Armour', shortLabel: 'Arm', value: formatStat(armour) });
  }

  cells.push({ label: 'Size', value: formatStat(size) });
  cells.push({ label: 'Pts', value: formatStat(points) });

  return (
    <div className={styles.table}>
      {cells.map(({ label, shortLabel, value }) => (
        <span className={styles.cell} key={label}>
          {shortLabel ? (
            <span className={styles.label}>
              <span className={styles.fullLabel}>{label}</span>
              <span className={styles.shortLabel}>{shortLabel}</span>
            </span>
          ) : (
            <span className={styles.label}>{label}</span>
          )}
          <span className={styles.figure}>{value}</span>
        </span>
      ))}
    </div>
  );
};
