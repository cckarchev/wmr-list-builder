import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { useArmyStore } from '@/store/useArmyStore';
import { renderWithProviders } from '@/test/renderWithProviders';
import { UpgradeRow } from './UpgradeRow';

const HALBERDIER_STANDS = 5;

beforeEach(() => useArmyStore.getState().reset());

describe('UpgradeRow', () => {
  it('disables the increase button once an army-wide upgrade (armyMax) is used up elsewhere', () => {
    const store = useArmyStore.getState();
    store.setArmy('empire');
    // Battle Banner is a Magic Standard: armyMax 1 per army. Spend it on one unit.
    store.setUnitNumber('halberdiers', HALBERDIER_STANDS);
    store.setUnitUpgradeNumber('halberdiers', 'battleBanner', 1);
    // A second eligible unit has stands free, but the army-wide allowance is gone.
    store.setUnitNumber('knights', 2);

    renderWithProviders(<UpgradeRow unitId="knights" upgradeId="battleBanner" />);

    expect(
      screen.getByRole('button', { name: 'increase Battle Banner for Knights' }),
    ).toBeDisabled();
  });

  it('names the unit that already carries an army-wide upgrade', () => {
    const store = useArmyStore.getState();
    store.setArmy('empire');
    store.setUnitNumber('halberdiers', HALBERDIER_STANDS);
    store.setUnitUpgradeNumber('halberdiers', 'battleBanner', 1);
    store.setUnitNumber('knights', 2);

    renderWithProviders(<UpgradeRow unitId="knights" upgradeId="battleBanner" />);

    expect(screen.getByRole('tooltip', { name: 'Taken by Halberdiers' })).toBeInTheDocument();
  });

  it('disables a magic item once the unit carries as many as it has stands, and says so', () => {
    const store = useArmyStore.getState();
    store.setArmy('empire');
    // A 1-stand General has room for one magic item, and the Crown takes it.
    store.setUnitNumber('general', 1);
    store.setUnitUpgradeNumber('general', 'crownOfCommand', 1);

    renderWithProviders(<UpgradeRow unitId="general" upgradeId="swordOfDestruction" />);

    expect(
      screen.getByRole('button', { name: 'increase Sword of Destruction for General' }),
    ).toBeDisabled();
    expect(
      screen.getByRole('tooltip', { name: 'Already carries 1 magic item' }),
    ).toBeInTheDocument();
  });

  it('allows increasing a per-unit upgrade up to the unit number', () => {
    const store = useArmyStore.getState();
    store.setArmy('empire');
    store.setUnitNumber('knights', 2);

    renderWithProviders(<UpgradeRow unitId="knights" upgradeId="battleBanner" />);

    // Nothing of this army-wide upgrade is used yet, so it can still be added.
    expect(
      screen.getByRole('button', { name: 'increase Battle Banner for Knights' }),
    ).not.toBeDisabled();
  });

  it('shows a special-rules popover for an upgrade that has rule text', async () => {
    const user = userEvent.setup();
    const store = useArmyStore.getState();
    store.setArmy('empire');
    store.setUnitNumber('knights', 2);

    renderWithProviders(<UpgradeRow unitId="knights" upgradeId="battleBanner" />);

    await user.click(screen.getByRole('button', { name: 'Battle Banner special rules' }));
    const dialog = screen.getByRole('dialog', { name: 'Battle Banner special rules' });

    expect(within(dialog).getByText(/increases the Attacks value/i)).toBeInTheDocument();
  });
});
