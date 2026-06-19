import { marked } from 'marked';
import styled from 'styled-components';
import { useArmyStore } from '../../store/useArmyStore';
import { resolveUnitSpecialRules } from '../../store/specialRulesForUnit';
import Popover from '../ui/Popover';
import Icon from '../ui/Icon';

interface UnitRulesProps {
  unitId: string;
}

const Rule = styled.div`
  & + & {
    margin-top: ${({ theme }) => `${theme.space[3]}px`};
  }
`;

const RuleName = styled.h4`
  margin: 0 0 ${({ theme }) => `${theme.space[1]}px`};
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
    margin: 0 0 ${({ theme }) => `${theme.space[1]}px`};
  }
  & p:last-child {
    margin-bottom: 0;
  }
`;

export default function UnitRules({ unitId }: UnitRulesProps) {
  const unit = useArmyStore((s) => s.units[unitId]);
  const specialRules = useArmyStore((s) => s.specialRules);

  if (!unit) return null;
  const rules = resolveUnitSpecialRules(unitId, unit, specialRules);
  if (rules.length === 0) return null;

  return (
    <Popover label={`${unitId} special rules`} trigger={<Icon name="rules" size={16} />} wide>
      {rules.map(({ name, rule }) => (
        <Rule key={name}>
          <RuleName>{name}</RuleName>
          <RuleText
            dangerouslySetInnerHTML={{ __html: marked(rule.text?.join('\n') ?? '') as string }}
          />
        </Rule>
      ))}
    </Popover>
  );
}
