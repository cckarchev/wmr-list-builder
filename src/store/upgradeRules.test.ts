import { describe, it, expect } from 'vitest';
import { resolveUpgradeRules } from './upgradeRules';
import type { UpgradeState } from './storeHelpers';

const upgrade = (partial: Partial<UpgradeState>): UpgradeState => ({
  order: 0,
  type: 'magic',
  number: 0,
  ...partial,
});

describe('resolveUpgradeRules', () => {
  it('surfaces a magic item inline text titled by the upgrade id', () => {
    const rules = resolveUpgradeRules(
      'Sword of Might',
      upgrade({ text: ['+1 Attack on one stand.'] }),
      {},
    );
    expect(rules).toEqual([
      { name: 'Sword of Might', rule: { text: ['+1 Attack on one stand.'] } },
    ]);
  });

  it('resolves army-upgrade specialRules names against the rules map', () => {
    const rules = resolveUpgradeRules('Dragon', upgrade({ specialRules: ['Dragons'] }), {
      Dragons: { order: 1, text: ['Dragons are big.'] },
    });
    expect(rules).toEqual([{ name: 'Dragons', rule: { order: 1, text: ['Dragons are big.'] } }]);
  });

  it('returns nothing when there is no inline text and no resolvable rule', () => {
    expect(resolveUpgradeRules('Plain', upgrade({ specialRules: ['Missing'] }), {})).toEqual([]);
    expect(resolveUpgradeRules('Plain', upgrade({}), {})).toEqual([]);
  });
});
