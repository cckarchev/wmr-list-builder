import styled from 'styled-components';
import { useArmyStore } from '../../store/useArmyStore';
import { pointsCost, unitCount, usedUnits as getUsedUnits } from '../../store/selectors';
import { resolveUpgradePoints } from '../../store/storeHelpers';
import type { UnitState, UpgradeState } from '../../store/storeHelpers';
import type { UsedUnit } from '../../store/selectors';

const TableWrapper = styled.div`
  overflow-x: auto;
  font-family: ${({ theme }) => theme.font.mono};
  font-size: ${({ theme }) => theme.fontSize.xs};
  color: ${({ theme }) => theme.color.text.body};
`;

const Table = styled.table`
  border-collapse: collapse;
  width: 100%;
  text-align: center;

  tbody tr:nth-child(even) td {
    background: ${({ theme }) => theme.alpha(theme.rgb.white, 0.06)};
  }
`;

// Characters (General/Hero/Wizard) and the fighting units have wildly
// different stat profiles, so they print as two separate tables. The
// character table drops Range/Armour and keeps Command; the unit table drops
// Command. Only the units count toward the break point, so the totals footer
// lives on the unit table.
const CharacterTable = styled(Table)`
  margin-bottom: ${({ theme }) => `${theme.space[5]}px`};
`;

const CHARACTER_TYPES = new Set(['General', 'Hero', 'Wizard']);

const Th = styled.th`
  padding: ${({ theme }) => `${theme.space[1]}px ${theme.space[2]}px`};
  white-space: nowrap;
  border-bottom: 2px solid currentColor;
`;

const Td = styled.td`
  padding: ${({ theme }) => `${theme.space[1]}px ${theme.space[2]}px`};
  white-space: nowrap;
`;

const TdLeft = styled(Td)`
  text-align: left;
`;

// Indent attachment (upgrade) names so they read as nested under their parent
// unit, making it easy to scan where one unit ends and the next begins. The
// indent lives on an inner span because the print stylesheet forces a fixed
// cell padding that would otherwise wipe a cell-level indent.
const Name = styled.span<{ $indent?: boolean }>`
  display: inline-block;
  margin-left: ${({ theme, $indent }) => ($indent ? `${theme.space[3]}px` : '0')};
`;

const FootTd = styled(Td)`
  border-top: 2px solid currentColor;
  font-weight: 600;
`;

type StatKind = 'character' | 'unit';

interface StatRowProps {
  name: string;
  troop: UnitState | UpgradeState | (UsedUnit & { pointsCost: number; number: number });
  parentUnit?: UnitState;
  specialRules: Record<string, { order?: number }>;
  kind: StatKind;
  isUpgrade?: boolean;
}

function resolvePoints(
  troop: UnitState | UpgradeState | (UsedUnit & { pointsCost: number; number: number }),
  parentUnit?: UnitState,
): string {
  const price = resolveUpgradePoints(troop, parentUnit);
  return price !== undefined ? String(price) : '-';
}

function resolveSpecial(
  name: string,
  troopSpecialRules: string[] | undefined,
  specialRules: Record<string, { order?: number }>,
): string {
  const orders: number[] = [];

  const addOrder = (n: string) => {
    if (specialRules[n]?.order != null) {
      orders.push(specialRules[n].order as number);
    }
  };

  addOrder(name);
  if (troopSpecialRules) {
    troopSpecialRules.forEach(addOrder);
  }

  if (orders.length === 0) return '-';
  return orders
    .sort((a, b) => a - b)
    .map((o) => `*${o}`)
    .join(', ');
}

function StatRow({ name, troop, parentUnit, specialRules, kind, isUpgrade }: StatRowProps) {
  const t = troop as UnitState & UpgradeState;

  return (
    <tr>
      <Td>{t.number}</Td>
      <TdLeft>
        <Name $indent={isUpgrade}>{name}</Name>
      </TdLeft>
      <TdLeft>{t.type || '-'}</TdLeft>
      <Td>{String(t.attack ?? '-')}</Td>
      {kind === 'unit' && <Td>{t.range || '-'}</Td>}
      {kind === 'unit' && <Td>{String(t.hits ?? '-')}</Td>}
      {kind === 'unit' && <Td>{t.armour || '-'}</Td>}
      {kind === 'character' && <Td>{String(t.command ?? '-')}</Td>}
      {kind === 'unit' && <Td>{String(t.size ?? '-')}</Td>}
      <Td>{resolvePoints(troop, parentUnit)}</Td>
      <Td>{resolveSpecial(name, t.specialRules, specialRules)}</Td>
    </tr>
  );
}

function renderRows(
  entries: [string, UsedUnit][],
  kind: StatKind,
  units: Record<string, UnitState>,
  srMap: Record<string, { order?: number }>,
) {
  return entries.flatMap(([unitId, unit]) => {
    const rows = [
      <StatRow
        key={`unit_${unitId}`}
        name={unitId}
        troop={unit}
        specialRules={srMap}
        kind={kind}
      />,
    ];
    if (unit.upgrades) {
      Object.entries(unit.upgrades).forEach(([upId, upg]) => {
        rows.push(
          <StatRow
            key={`upgrade_${unitId}_${upId}`}
            name={upId}
            troop={upg}
            parentUnit={units[unitId]}
            specialRules={srMap}
            kind={kind}
            isUpgrade
          />,
        );
      });
    }
    return rows;
  });
}

export default function Stats() {
  const units = useArmyStore((s) => s.units);
  const upgrades = useArmyStore((s) => s.upgrades);
  const specialRulesData = useArmyStore((s) => s.specialRules) as
    | Record<string, { order?: number }>
    | undefined;
  const errors = useArmyStore((s) => s.errors);

  const srMap: Record<string, { order?: number }> = specialRulesData ?? {};
  const total = pointsCost({ units });
  const count = unitCount(units);
  const usedUnitsMap = getUsedUnits({ units, upgrades });

  const isValid = errors.length === 0;

  const entries = Object.entries(usedUnitsMap);
  const characterEntries = entries.filter(([, unit]) => CHARACTER_TYPES.has(unit.type));
  const unitEntries = entries.filter(([, unit]) => !CHARACTER_TYPES.has(unit.type));

  return (
    <TableWrapper>
      {characterEntries.length > 0 && (
        <CharacterTable>
          <thead>
            <tr>
              <Th>#</Th>
              <Th>Character</Th>
              <Th>Type</Th>
              <Th>Attack</Th>
              <Th>Command</Th>
              <Th>Points</Th>
              <Th>Special</Th>
            </tr>
          </thead>
          <tbody>{renderRows(characterEntries, 'character', units, srMap)}</tbody>
        </CharacterTable>
      )}

      <Table>
        <thead>
          <tr>
            <Th>#</Th>
            <Th>Troop</Th>
            <Th>Type</Th>
            <Th>Attack</Th>
            <Th>Range</Th>
            <Th>Hits</Th>
            <Th>Armour</Th>
            <Th>Size</Th>
            <Th>Points</Th>
            <Th>Special</Th>
          </tr>
        </thead>
        <tbody>{renderRows(unitEntries, 'unit', units, srMap)}</tbody>
        <tfoot>
          <tr>
            <FootTd>
              {count}/{Math.ceil(count / 2)}
            </FootTd>
            <FootTd colSpan={7}>{isValid ? '' : 'INVALID'}</FootTd>
            <FootTd>{total}</FootTd>
            <FootTd />
          </tr>
        </tfoot>
      </Table>
    </TableWrapper>
  );
}
