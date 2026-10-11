import { describe, expect, it } from 'vitest';
import type { UpgradeState } from './storeHelpers';
import { resolveUpgradeRules } from './upgradeRules';

const upgrade = (partial: Partial<UpgradeState>): UpgradeState => ({
  name: 'Plain',
  type: 'magic',
  number: 0,
  ...partial,
});

describe('resolveUpgradeRules', () => {
  it('surfaces a magic item inline text titled by the upgrade name', () => {
    const swordOfMight = upgrade({ name: 'Sword of Might', text: ['+1 Attack on one stand.'] });

    expect(resolveUpgradeRules('swordOfMight', swordOfMight, {})).toEqual([
      { id: 'swordOfMight', rule: { name: 'Sword of Might', text: ['+1 Attack on one stand.'] } },
    ]);
  });

  it('resolves army-upgrade specialRules ids against the rules map', () => {
    const dragons = { name: 'Dragons', order: 1, text: ['Dragons are big.'] };
    const rules = resolveUpgradeRules('dragon', upgrade({ specialRules: ['dragons'] }), {
      dragons,
    });

    expect(rules).toEqual([{ id: 'dragons', rule: dragons }]);
  });

  it('returns nothing when there is no inline text and no resolvable rule', () => {
    expect(resolveUpgradeRules('plain', upgrade({ specialRules: ['missing'] }), {})).toEqual([]);
    expect(resolveUpgradeRules('plain', upgrade({}), {})).toEqual([]);
  });
});
