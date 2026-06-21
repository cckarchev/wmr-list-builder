import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../test/renderWithProviders';
import ArmySummary from './ArmySummary';
import { unitDomId } from './unitDomId';
import { useArmyStore } from '../../store/useArmyStore';

beforeEach(() => useArmyStore.getState().reset());

describe('ArmySummary', () => {
  it('shows an empty state when no units are selected', () => {
    useArmyStore.getState().setArmy('goblin');
    useArmyStore.setState({ units: {} });
    renderWithProviders(<ArmySummary />);
    expect(screen.getByText(/no units selected/i)).toBeInTheDocument();
  });

  it('lists selected units with quantity and points', () => {
    useArmyStore.getState().setArmy('goblin');
    renderWithProviders(<ArmySummary />);
    const region = screen.getByRole('complementary', { name: 'Your Army' });
    expect(within(region).getByText('Goblins')).toBeInTheDocument();
  });

  it("lists a unit's selected upgrades as sub-lines with quantity", () => {
    const store = useArmyStore.getState();
    store.setArmy('goblin');
    store.setUnitNumber('Goblins', 4);
    store.setUnitUpgradeNumber('Goblins', 'Squig Herd', 2);
    renderWithProviders(<ArmySummary />);
    const region = screen.getByRole('complementary', { name: 'Your Army' });
    expect(within(region).getByText('Squig Herd')).toBeInTheDocument();
    expect(within(region).getByText('×2')).toBeInTheDocument();
  });

  it('jumps to a unit card when its row is clicked', async () => {
    const user = userEvent.setup();
    const scrollSpy = vi.fn();
    Element.prototype.scrollIntoView = scrollSpy;
    useArmyStore.getState().setArmy('goblin');
    renderWithProviders(
      <>
        <ArmySummary />
        <div id={unitDomId('Goblins')} />
      </>,
    );
    await user.click(screen.getByRole('button', { name: /Goblins/ }));
    expect(scrollSpy).toHaveBeenCalled();
  });
});
