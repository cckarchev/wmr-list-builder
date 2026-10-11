import { halfUp } from '@/core/lib/counts';
import type { UsedUnit } from './selectors';

interface TextListParams {
  armyName: string;
  label: string;
  points: number;
  usedUnits: Record<string, UsedUnit>;
  version: string;
}

const DIVIDER = '--------------------------------';

const padLeft = (value: string | number, width: number): string => String(value).padStart(width);

/** One unit line plus a line per upgrade it carries. */
const unitLines = (unit: UsedUnit, pad: number): string[] => {
  const unitLine = `${padLeft(unit.pointsCost, pad)} - ${unit.number} ${unit.name}`;
  const upgrades = Object.values(unit.upgrades ?? {});
  const upgradeLines = upgrades.map(
    (upgrade) => `${padLeft(' ', pad)} - ${upgrade.number} ${upgrade.name} (${upgrade.pointsCost})`,
  );

  return [unitLine, ...upgradeLines];
};

/**
 * Pure function that builds the plain-text army roster string.
 * Port of the TextList.vue component output format.
 */
export const buildTextList = ({
  armyName,
  label,
  points,
  usedUnits,
  version,
}: TextListParams): string => {
  const pad = String(points).length;
  const units = Object.values(usedUnits);
  const unitCountTotal = units.reduce((sum, unit) => sum + unit.number, 0);
  // An army breaks when it loses half its units, rounded up.
  const breakValue = halfUp(unitCountTotal);

  const lines = [
    ...(label ? [label] : []),
    `${armyName}, ${points} points`,
    version,
    DIVIDER,
    ...units.flatMap((unit) => unitLines(unit, pad)),
    DIVIDER,
    `${padLeft(points, pad)} - ${unitCountTotal}/${breakValue}`,
  ];

  return lines.join('\n');
};
