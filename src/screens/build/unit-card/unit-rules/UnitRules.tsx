import styled from 'styled-components';
import { Icon } from '@/components/Icon';
import { Markdown } from '@/components/Markdown';
import { Popover } from '@/components/popover/Popover';
import { resolveUnitSpecialRules } from '@/core/specialRulesForUnit';
import { useArmyStore } from '@/store/useArmyStore';

interface UnitRulesProps {
  unitId: string;
}

const Rule = styled.div`
  & + & {
    margin-top: ${({ theme }) => `${theme.space.sm}px`};
  }
`;

const RuleName = styled.h4`
  margin: 0 0 ${({ theme }) => `${theme.space.xxs}px`};
  font-family: ${({ theme }) => theme.font.display};
  font-size: ${({ theme }) => theme.fontSize.sm};
  color: ${({ theme }) => theme.color.text.strong};
`;

const RuleText = styled.div`
  font-family: ${({ theme }) => theme.font.body};
  font-size: ${({ theme }) => theme.fontSize.xs};
  color: ${({ theme }) => theme.color.text.body};
  line-height: 1.4;

  & p {
    margin: 0 0 ${({ theme }) => `${theme.space.xxs}px`};
  }
  & p:last-child {
    margin-bottom: 0;
  }
`;

export const UnitRules = ({ unitId }: UnitRulesProps) => {
  const unit = useArmyStore((s) => s.units[unitId]);
  const specialRules = useArmyStore((s) => s.specialRules);

  if (!unit) {
    return null;
  }
  const rules = resolveUnitSpecialRules(unitId, unit, specialRules);
  if (rules.length === 0) {
    return null;
  }

  return (
    <Popover
      label={`${unitId} special rules`}
      trigger={
        <>
          <Icon name="rules" size={14} />
          Rules
        </>
      }
      wide
    >
      {rules.map(({ name, rule }) => (
        <Rule key={name}>
          <RuleName>{name}</RuleName>
          <RuleText>
            <Markdown blocks={rule.text ?? []} />
          </RuleText>
        </Rule>
      ))}
    </Popover>
  );
};
