import { describe, it, expect, beforeEach } from 'vitest';
import { useArmyStore } from '../../store/useArmyStore';
import { pointsCost, usedUnits as getUsedUnits } from '../../store/selectors';
import { buildTextList } from './textList';

beforeEach(() => {
  useArmyStore.getState().reset();
});

describe('buildTextList', () => {
  it('produces the correct plain-text roster for a goblin army with two unit types', () => {
    const store = useArmyStore.getState();
    store.setArmy('goblin');
    store.setUnitNumber('Goblins', 2); // 2 × 30 = 60 pts
    store.setUnitNumber('Wolf Riders', 1); // 1 × 60 = 60 pts

    const state = useArmyStore.getState();
    const points = pointsCost(state); // 120
    const used = getUsedUnits(state);

    const result = buildTextList({
      armyName: state.army!.name,
      label: state.label,
      points,
      usedUnits: used,
      version: state.version,
    });

    const expected =
      'Goblin, 120 points\n' +
      'Warmaster Revolution\n' +
      '--------------------------------\n' +
      ' 60 - 2 Goblins\n' +
      ' 60 - 1 Wolf Riders\n' +
      '--------------------------------\n' +
      '120 - 3/2';

    expect(result).toBe(expected);
  });

  it('includes the label when set', () => {
    const store = useArmyStore.getState();
    store.setArmy('goblin');
    store.setUnitNumber('Goblins', 1);
    store.setLabel('My Test List');

    const state = useArmyStore.getState();
    const points = pointsCost(state);
    const used = getUsedUnits(state);

    const result = buildTextList({
      armyName: state.army!.name,
      label: state.label,
      points,
      usedUnits: used,
      version: state.version,
    });

    expect(result.startsWith('My Test List\n')).toBe(true);
  });

  it('includes upgrade lines when upgrades are used', () => {
    const store = useArmyStore.getState();
    store.setArmy('goblin');
    store.setUnitNumber('Goblins', 2);
    store.setUnitUpgradeNumber('Goblins', 'Squig Herd', 1); // +0 pts

    const state = useArmyStore.getState();
    const points = pointsCost(state);
    const used = getUsedUnits(state);

    const result = buildTextList({
      armyName: state.army!.name,
      label: state.label,
      points,
      usedUnits: used,
      version: state.version,
    });

    expect(result).toContain('Squig Herd');
  });

  it('omits the label line when label is empty', () => {
    const store = useArmyStore.getState();
    store.setArmy('goblin');
    store.setUnitNumber('Goblins', 1);

    const state = useArmyStore.getState();
    const points = pointsCost(state);
    const used = getUsedUnits(state);

    const result = buildTextList({
      armyName: state.army!.name,
      label: state.label,
      points,
      usedUnits: used,
      version: state.version,
    });

    expect(result.startsWith('Goblin,')).toBe(true);
  });
});
