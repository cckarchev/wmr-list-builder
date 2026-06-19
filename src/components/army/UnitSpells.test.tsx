import { describe, it, expect, beforeEach } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../test/renderWithProviders';
import UnitSpells from './UnitSpells';
import { useArmyStore } from '../../store/useArmyStore';

beforeEach(() => useArmyStore.getState().reset());

describe('UnitSpells', () => {
  it('renders a Spells trigger for a Wizard and lists spells on click', async () => {
    const user = userEvent.setup();
    useArmyStore.getState().setArmy('goblin');
    renderWithProviders(<UnitSpells unitId="Goblin Shaman" />);
    await user.click(screen.getByRole('button', { name: 'Spells' }));
    const dialog = screen.getByRole('dialog', { name: 'Spells' });
    // Compact grid: spell name, difficulty-to-cast roll, and range.
    expect(within(dialog).getByText('Waaagh!')).toBeInTheDocument();
    expect(within(dialog).getByText('4+')).toBeInTheDocument();
    expect(within(dialog).getByText('60cm')).toBeInTheDocument();
  });

  it('renders nothing for a non-Wizard unit', () => {
    useArmyStore.getState().setArmy('goblin');
    const { container } = renderWithProviders(<UnitSpells unitId="Goblins" />);
    expect(container).toBeEmptyDOMElement();
  });
});
