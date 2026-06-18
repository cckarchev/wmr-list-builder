import styled from 'styled-components';
import { useArmyStore } from '../../store/useArmyStore';
import { pointsCost, unitCount, usedUnits as getUsedUnits } from '../../store/selectors';
import type { UnitState, UpgradeState } from '../../store/storeHelpers';
import type { UsedUnit } from '../../store/selectors';

const MAGIC_ITEM_TYPES = new Set([
  'Magic Standard',
  'Magic Weapon',
  'Device of Power',
  'Bannière Magique',
  'Arme Magique',
  'Objet Enchanté',
]);

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

interface StatRowProps {
  name: string;
  troop: UnitState | UpgradeState | (UsedUnit & { pointsCost: number; number: number });
  used: boolean;
  isUpgrade?: boolean;
  parentUnit?: UnitState;
  specialRules: Record<string, { order?: number }>;
}

function resolvePoints(
  troop: UnitState | UpgradeState | (UsedUnit & { pointsCost: number; number: number }),
  parentUnit?: UnitState,
): string {
  const t = troop as UpgradeState;
  if (t.pointsValue !== undefined && parentUnit) {
    const key = String((parentUnit as unknown as Record<string, unknown>)[t.pointsValue] ?? '-');
    const pts = t.points as Record<string, string>;
    return String(pts[key] ?? '-');
  }
  return t.points !== undefined ? String(t.points) : '-';
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

function StatRow({ name, troop, used, isUpgrade = false, parentUnit, specialRules }: StatRowProps) {
  const t = troop as UnitState & UpgradeState;

  const pointsCostDisplay = used
    ? isUpgrade
      ? `(${t.pointsCost})`
      : String(t.pointsCost)
    : null;

  return (
    <tr>
      {used && <Td>{pointsCostDisplay}</Td>}
      {used && <Td>{t.number}</Td>}
      <TdLeft>{name}</TdLeft>
      <TdLeft>{t.type || '-'}</TdLeft>
      <Td>{String(t.attack ?? '-')}</Td>
      <Td>{t.range || '-'}</Td>
      <Td>{String(t.hits ?? '-')}</Td>
      <Td>{t.armour || '-'}</Td>
      <Td>{String(t.command ?? '-')}</Td>
      <Td>{String(t.size ?? '-')}</Td>
      <Td>{resolvePoints(troop, parentUnit)}</Td>
      <Td>{t.minMax || '-'}</Td>
      <Td>{resolveSpecial(name, t.specialRules, specialRules)}</Td>
    </tr>
  );
}

interface StatsProps {
  used?: boolean;
}

export default function Stats({ used = false }: StatsProps) {
  const army = useArmyStore((s) => s.army);
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

  const armyName = army?.name ?? '';
  const caption = used ? 'Stats Used' : `${armyName} — Warmaster Revolution`;

  // non-magic upgrades for the all-units view
  const nonMagicUpgrades = Object.fromEntries(
    Object.entries(upgrades).filter(([, upg]) => !MAGIC_ITEM_TYPES.has(upg.type)),
  );

  const isValid = errors.length === 0;

  return (
    <TableWrapper>
      <Table>
        <Caption>{caption}</Caption>
        <thead>
          <tr>
            {used && <Th>Cost</Th>}
            {used && <Th>#</Th>}
            <Th>Troop</Th>
            <Th>Type</Th>
            <Th>Attack</Th>
            <Th>Range</Th>
            <Th>Hits</Th>
            <Th>Armour</Th>
            <Th>Command</Th>
            <Th>Size</Th>
            <Th>Points</Th>
            <Th>Min/Max</Th>
            <Th>Special</Th>
          </tr>
        </thead>

        {!used && (
          <tbody>
            {Object.entries(units).map(([id, unit]) => (
              <StatRow
                key={`unit_${id}`}
                name={id}
                troop={unit}
                used={false}
                specialRules={srMap}
              />
            ))}
            {Object.entries(nonMagicUpgrades).map(([id, upg]) => (
              <StatRow
                key={`upgrade_${id}`}
                name={id}
                troop={upg}
                used={false}
                isUpgrade
                specialRules={srMap}
              />
            ))}
          </tbody>
        )}

        {used && (
          <>
            <tbody>
              {Object.entries(usedUnitsMap).flatMap(([unitId, unit]) => {
                const rows = [
                  <StatRow
                    key={`unit_${unitId}`}
                    name={unitId}
                    troop={unit}
                    used
                    specialRules={srMap}
                  />,
                ];
                if (unit.upgrades) {
                  Object.entries(unit.upgrades).forEach(([upId, upg]) => {
                    rows.push(
                      <StatRow
                        key={`upgrade_${unitId}_${upId}`}
                        name={upId}
                        troop={upg}
                        used
                        isUpgrade
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
                <Td>{total}</Td>
                <Td>{count}/{Math.ceil(count / 2)}</Td>
                <Td colSpan={11}>{isValid ? '' : 'INVALID'}</Td>
              </tr>
            </tfoot>
          </>
        )}
      </Table>
    </TableWrapper>
  );
}
