import { marked } from 'marked';
import styled from 'styled-components';
import { useArmyStore } from '../../store/useArmyStore';
import type { SpecialRule } from '../../data/types';

const Wrapper = styled.div`
  color: ${({ theme }) => theme.color.text.body};
`;

const Heading = styled.h3`
  font-family: ${({ theme }) => theme.font.display};
  font-size: ${({ theme }) => theme.fontSize.lg};
  color: ${({ theme }) => theme.color.text.strong};
  text-align: center;
  margin-bottom: ${({ theme }) => `${theme.space[3]}px`};
`;

const Dl = styled.dl`
  font-size: ${({ theme }) => theme.fontSize.sm};
`;

const Dt = styled.dt`
  font-weight: 600;
  color: ${({ theme }) => theme.color.text.strong};
  margin-top: ${({ theme }) => `${theme.space[3]}px`};

  &:first-child {
    margin-top: 0;
  }
`;

const Dd = styled.dd`
  margin: 0;
  line-height: 1.6;
`;

interface SpecialRulesProps {
  used?: boolean;
}

function collectUsedSpecialRules(
  allSpecialRules: Record<string, SpecialRule>,
  units: ReturnType<typeof useArmyStore.getState>['units'],
  upgrades: ReturnType<typeof useArmyStore.getState>['upgrades'],
): Record<string, SpecialRule> {
  const result: Record<string, SpecialRule> = {};

  const addRule = (name: string) => {
    if (allSpecialRules[name]) {
      result[name] = allSpecialRules[name];
    }
  };

  for (const [unitId, unit] of Object.entries(units)) {
    if (unit.number > 0) {
      // rule named after the unit
      addRule(unitId);
      // rules in the unit's specialRules array
      unit.specialRules?.forEach(addRule);
    }
  }

  for (const [upgradeId, upgrade] of Object.entries(upgrades)) {
    if (upgrade.number > 0) {
      addRule(upgradeId);
      upgrade.specialRules?.forEach(addRule);
    }
  }

  return result;
}

export default function SpecialRules({ used = false }: SpecialRulesProps) {
  const specialRulesRaw = useArmyStore((s) => s.specialRules) as
    | Record<string, SpecialRule>
    | undefined;
  const units = useArmyStore((s) => s.units);
  const upgrades = useArmyStore((s) => s.upgrades);

  if (!specialRulesRaw) return null;

  const rulesMap = used
    ? collectUsedSpecialRules(specialRulesRaw, units, upgrades)
    : specialRulesRaw;

  // sort by order
  const sorted = Object.entries(rulesMap).sort(([, a], [, b]) => {
    const ao = a.order ?? 0;
    const bo = b.order ?? 0;
    return ao < bo ? -1 : ao > bo ? 1 : 0;
  });

  if (sorted.length === 0) return null;

  return (
    <Wrapper>
      <Heading>Special Rules{used ? ' Used' : ''}</Heading>
      <Dl>
        {sorted.flatMap(([name, rule]) => {
          const html = rule.text ? (marked(rule.text.join('\n')) as string) : '';
          return [
            <Dt key={`dt_${name}`}>
              {rule.order != null ? `${rule.order}. ` : ''}{name}
            </Dt>,
            <Dd key={`dd_${name}`} dangerouslySetInnerHTML={{ __html: html }} />,
          ];
        })}
      </Dl>
    </Wrapper>
  );
}
