import { describe, it, expect, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../test/renderWithProviders';
import UnitCard from './UnitCard';
import { useArmyStore } from '../../store/useArmyStore';

beforeEach(() => useArmyStore.getState().reset());

describe('UnitCard', () => {
  it('renders the unit name and a stepper when unselected', () => {
    useArmyStore.getState().setArmy('goblin');
    useArmyStore.getState().setUnitNumber('Squig Herd', 0);
    renderWithProviders(<UnitCard unitId="Squig Herd" />);
    expect(screen.getByText('Squig Herd')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'increase Squig Herd' })).toBeInTheDocument();
    // No upgrades disclosure or points cost while unselected.
    expect(screen.queryByRole('button', { name: /upgrades/i })).not.toBeInTheDocument();
  });

  it('shows points cost and an Upgrades disclosure when selected', async () => {
    const user = userEvent.setup();
    useArmyStore.getState().setArmy('goblin');
    useArmyStore.getState().setUnitNumber('Goblins', 2);
    renderWithProviders(<UnitCard unitId="Goblins" />);
    expect(screen.getByText(/pts$/)).toBeInTheDocument();
    const toggle = screen.getByRole('button', { name: /upgrades/i });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
  });

  it('exposes a Rules trigger when the unit has special rules', () => {
    useArmyStore.getState().setArmy('goblin');
    renderWithProviders(<UnitCard unitId="Spear Chukka" />);
    expect(screen.getByRole('button', { name: 'Spear Chukka special rules' })).toBeInTheDocument();
  });

  it('exposes a Spells trigger for a Wizard only', () => {
    useArmyStore.getState().setArmy('goblin');
    const { rerender } = renderWithProviders(<UnitCard unitId="Goblin Shaman" />);
    expect(screen.getByRole('button', { name: 'Spells' })).toBeInTheDocument();
    rerender(<UnitCard unitId="Goblins" />);
    expect(screen.queryByRole('button', { name: 'Spells' })).not.toBeInTheDocument();
  });

  it('renders inline errors on an invalid selected unit', () => {
    const store = useArmyStore.getState();
    store.setArmy('goblin');
    store.setUnitUpgradeNumber('Goblin Warboss', 'Wolf Chariot', 1);
    store.setUnitUpgradeNumber('Goblin Warboss', 'Wyvern', 1);
    renderWithProviders(<UnitCard unitId="Goblin Warboss" />);
    expect(screen.getByText(/may only have 1 mount/i)).toBeInTheDocument();
  });
});
