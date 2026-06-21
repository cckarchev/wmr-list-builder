import { describe, it, expect, beforeEach } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../test/renderWithProviders';
import UpgradeRow from './UpgradeRow';
import { useArmyStore } from '../../store/useArmyStore';

beforeEach(() => useArmyStore.getState().reset());

describe('UpgradeRow', () => {
  it('disables the increase button once an army-wide upgrade (armyMax) is used up elsewhere', () => {
    const store = useArmyStore.getState();
    store.setArmy('empire');
    // Battle Banner is a Magic Standard: armyMax 1 per army. Spend it on one unit.
    store.setUnitNumber('Halberdiers', 5);
    store.setUnitUpgradeNumber('Halberdiers', 'Battle Banner', 1);
    // A second eligible unit has stands free, but the army-wide allowance is gone.
    store.setUnitNumber('Knights', 2);

    renderWithProviders(<UpgradeRow unitId="Knights" upgradeId="Battle Banner" />);

    expect(
      screen.getByRole('button', { name: 'increase Battle Banner for Knights' }),
    ).toBeDisabled();
  });

  it('allows increasing a per-unit upgrade up to the unit number', () => {
    const store = useArmyStore.getState();
    store.setArmy('empire');
    store.setUnitNumber('Knights', 2);

    renderWithProviders(<UpgradeRow unitId="Knights" upgradeId="Battle Banner" />);

    // Nothing of this army-wide upgrade is used yet, so it can still be added.
    expect(
      screen.getByRole('button', { name: 'increase Battle Banner for Knights' }),
    ).not.toBeDisabled();
  });

  it('shows a special-rules popover for an upgrade that has rule text', async () => {
    const user = userEvent.setup();
    const store = useArmyStore.getState();
    store.setArmy('empire');
    store.setUnitNumber('Knights', 2);

    renderWithProviders(<UpgradeRow unitId="Knights" upgradeId="Battle Banner" />);

    await user.click(screen.getByRole('button', { name: 'Battle Banner special rules' }));
    const dialog = screen.getByRole('dialog', { name: 'Battle Banner special rules' });
    expect(within(dialog).getByText(/increases the Attacks value/i)).toBeInTheDocument();
  });
});
