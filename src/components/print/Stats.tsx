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

const Caption = styled.caption`
  font-family: ${({ theme }) => theme.font.display};
  font-size: ${({ theme }) => theme.fontSize.lg};
  color: ${({ theme }) => theme.color.text.strong};
  margin-bottom: ${({ theme }) => `${theme.space[2]}px`};
`;

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

const FootTd = styled(Td)`
  border-top: 2px solid currentColor;
  font-weight: 600;
`;

interface StatRowProps {
  name: string;
  troop: UnitState | UpgradeState | (UsedUnit & { pointsCost: number; number: number });
  parentUnit?: UnitState;
  specialRules: Record<string, { order?: number }>;
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

function StatRow({ name, troop, parentUnit, specialRules }: StatRowProps) {
  const t = troop as UnitState & UpgradeState;

  return (
    <tr>
      <Td>{t.number}</Td>
      <TdLeft>{name}</TdLeft>
      <TdLeft>{t.type || '-'}</TdLeft>
      <Td>{String(t.attack ?? '-')}</Td>
      <Td>{t.range || '-'}</Td>
      <Td>{String(t.hits ?? '-')}</Td>
      <Td>{t.armour || '-'}</Td>
      <Td>{String(t.command ?? '-')}</Td>
      <Td>{String(t.size ?? '-')}</Td>
      <Td>{resolvePoints(troop, parentUnit)}</Td>
      <Td>{resolveSpecial(name, t.specialRules, specialRules)}</Td>
    </tr>
  );
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

  return (
    <TableWrapper>
      <Table>
        <Caption>Stats</Caption>
        <thead>
          <tr>
            <Th>#</Th>
            <Th>Troop</Th>
            <Th>Type</Th>
            <Th>Attack</Th>
            <Th>Range</Th>
            <Th>Hits</Th>
            <Th>Armour</Th>
            <Th>Command</Th>
            <Th>Size</Th>
            <Th>Points</Th>
            <Th>Special</Th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(usedUnitsMap).flatMap(([unitId, unit]) => {
            const rows = [
              <StatRow key={`unit_${unitId}`} name={unitId} troop={unit} specialRules={srMap} />,
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
                  />,
                );
              });
            }
            return rows;
          })}
        </tbody>
        <tfoot>
          <tr>
            <FootTd>
              {count}/{Math.ceil(count / 2)}
            </FootTd>
            <FootTd colSpan={8}>{isValid ? '' : 'INVALID'}</FootTd>
            <FootTd>{total}</FootTd>
            <FootTd />
          </tr>
        </tfoot>
      </Table>
    </TableWrapper>
  );
}
