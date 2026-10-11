import { Markdown } from '@/components/Markdown';
import type { ResolvedRule } from '@/core/special-rules/specialRulesForUnit';
import styles from './RuleList.module.css';

interface RuleListProps {
  rules: ResolvedRule[];
}

/** Special rules rendered as name and text pairs, for the rules popovers. */
export const RuleList = ({ rules }: RuleListProps) => (
  <>
    {rules.map(({ id, rule }) => (
      <div className={styles.rule} key={id}>
        <h4 className={styles.name}>{rule.name}</h4>
        <div className={styles.text}>
          <Markdown blocks={rule.text ?? []} />
        </div>
      </div>
    ))}
  </>
);
