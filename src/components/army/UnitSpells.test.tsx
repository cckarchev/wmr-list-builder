import { describe, it, expect, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
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
    expect(dialog).toHaveTextContent(/to cast/i);
  });

  it('renders nothing for a non-Wizard unit', () => {
    useArmyStore.getState().setArmy('goblin');
    const { container } = renderWithProviders(<UnitSpells unitId="Goblins" />);
    expect(container).toBeEmptyDOMElement();
  });
});
