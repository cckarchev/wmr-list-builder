import type { UsedUnit } from '../../store/selectors';

export interface TextListParams {
  armyName: string;
  label: string;
  points: number;
  usedUnits: Record<string, UsedUnit>;
  version: string;
}

function padLeft(str: string | number, width: number): string {
  let s = String(str);
  while (s.length < width) {
    s = ' ' + s;
  }
  return s;
}

/**
 * Pure function that builds the plain-text army roster string.
 * Port of the TextList.vue component output format.
 */
export function buildTextList({
  armyName,
  label,
  points,
  usedUnits,
  version,
}: TextListParams): string {
  const pad = String(points).length;
  const lines: string[] = [];

  if (label) {
    lines.push(label);
  }

  lines.push(`${armyName}, ${points} points`);
  lines.push(version);
  lines.push('--------------------------------');

  for (const [unitName, unit] of Object.entries(usedUnits)) {
    lines.push(`${padLeft(unit.pointsCost, pad)} - ${unit.number} ${unitName}`);

    if (unit.upgrades) {
      for (const [upgradeName, upgrade] of Object.entries(unit.upgrades)) {
        lines.push(
          `${padLeft(' ', pad)} - ${upgrade.number} ${upgradeName} (${upgrade.pointsCost})`,
        );
      }
    }
  }

  lines.push('--------------------------------');

  // unit count / break value (half, rounded up)
  const unitCountTotal = Object.values(usedUnits).reduce((sum, u) => sum + u.number, 0);
  lines.push(`${padLeft(points, pad)} - ${unitCountTotal}/${Math.ceil(unitCountTotal / 2)}`);

  return lines.join('\n');
}
