import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useArmyStore } from '@/store/useArmyStore';
import { renderWithProviders } from '@/test/renderWithProviders';
import { unitDomId } from '../shared/domIds';
import { ArmySummary } from './ArmySummary';

const GOBLIN_STANDS = 4;

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
    const region = screen.getByRole('complementary', { name: 'Army Composition' });

    expect(within(region).getByText('Goblins')).toBeInTheDocument();
  });

  it("lists a unit's selected upgrades as sub-lines with quantity", () => {
    const store = useArmyStore.getState();
    store.setArmy('goblin');
    store.setUnitNumber('goblins', GOBLIN_STANDS);
    store.setUnitUpgradeNumber('goblins', 'squigHerd', 2);
    renderWithProviders(<ArmySummary />);
    const region = screen.getByRole('complementary', { name: 'Army Composition' });

    expect(within(region).getByText('Squig Herd')).toBeInTheDocument();
    expect(within(region).getByText('×2')).toBeInTheDocument();
  });

  it('collapses behind a heading that shows the points total', async () => {
    const user = userEvent.setup();
    useArmyStore.getState().setArmy('goblin');
    renderWithProviders(<ArmySummary />);
    const { gameSize } = useArmyStore.getState();
    const toggle = screen.getByRole('button', { name: /Army Composition/ });

    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(within(toggle).getByText(new RegExp(`/ ${gameSize} pts`))).toBeInTheDocument();

    await user.click(toggle);

    expect(toggle).toHaveAttribute('aria-expanded', 'true');
  });

  it('jumps to a unit card when its row is clicked', async () => {
    const user = userEvent.setup();
    const scrollSpy = vi.fn();
    Element.prototype.scrollIntoView = scrollSpy;
    useArmyStore.getState().setArmy('goblin');
    renderWithProviders(
      <>
        <ArmySummary />
        <div id={unitDomId('goblins')} />
      </>,
    );
    await user.click(screen.getByRole('button', { name: /Goblins/ }));

    expect(scrollSpy).toHaveBeenCalled();
  });
});
