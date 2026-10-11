import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { useArmyStore } from '@/store/useArmyStore';
import { renderWithProviders } from '@/test/renderWithProviders';
import { UnitCard } from './UnitCard';

beforeEach(() => useArmyStore.getState().reset());

describe('UnitCard', () => {
  it('renders the unit name and a stepper when unselected', () => {
    useArmyStore.getState().setArmy('goblin');
    useArmyStore.getState().setUnitNumber('squigHerd', 0);
    renderWithProviders(<UnitCard unitId="squigHerd" />);
    expect(screen.getByText('Squig Herd')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'increase Squig Herd' })).toBeInTheDocument();
    // No upgrades disclosure or points cost while unselected.
    expect(screen.queryByRole('button', { name: /upgrades/i })).not.toBeInTheDocument();
  });

  it('shows points cost and an Upgrades disclosure when selected', async () => {
    const user = userEvent.setup();
    useArmyStore.getState().setArmy('goblin');
    useArmyStore.getState().setUnitNumber('goblins', 2);
    renderWithProviders(<UnitCard unitId="goblins" />);
    expect(screen.getByText(/pts$/)).toBeInTheDocument();
    const toggle = screen.getByRole('button', { name: /upgrades/i });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
  });

  it('exposes a Rules trigger when the unit has special rules', () => {
    useArmyStore.getState().setArmy('goblin');
    renderWithProviders(<UnitCard unitId="spearChukka" />);
    expect(screen.getByRole('button', { name: 'Spear Chukka special rules' })).toBeInTheDocument();
  });

  it('exposes a Spells trigger for a Wizard only', () => {
    useArmyStore.getState().setArmy('goblin');
    const { rerender } = renderWithProviders(<UnitCard unitId="goblinShaman" />);
    expect(screen.getByRole('button', { name: 'Spells' })).toBeInTheDocument();
    rerender(<UnitCard unitId="goblins" />);
    expect(screen.queryByRole('button', { name: 'Spells' })).not.toBeInTheDocument();
  });

  it('renders inline errors on an invalid selected unit', () => {
    const store = useArmyStore.getState();
    store.setArmy('goblin');
    store.setUnitUpgradeNumber('goblinWarboss', 'wolfChariot', 1);
    store.setUnitUpgradeNumber('goblinWarboss', 'wyvern', 1);
    renderWithProviders(<UnitCard unitId="goblinWarboss" />);
    expect(screen.getByText(/may only have 1 mount/i)).toBeInTheDocument();
  });
});
