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
    // Accordion header: spell name, difficulty-to-cast roll, and range.
    expect(within(dialog).getByText('Waaagh!')).toBeInTheDocument();
    expect(within(dialog).getByText('4+')).toBeInTheDocument();
    expect(within(dialog).getByText('60cm')).toBeInTheDocument();
  });

  it('toggles a spell to reveal and hide its effect text', async () => {
    const user = userEvent.setup();
    useArmyStore.getState().setArmy('goblin');
    renderWithProviders(<UnitSpells unitId="Goblin Shaman" />);
    await user.click(screen.getByRole('button', { name: 'Spells' }));

    const effect = /invigorating the greenskins/i;
    expect(screen.queryByText(effect)).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Waaagh!/ }));
    expect(screen.getByText(effect)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Waaagh!/ }));
    expect(screen.queryByText(effect)).not.toBeInTheDocument();
  });

  it('renders spells for a caster-flagged unit that is not type Wizard (Grey Seer)', async () => {
    const user = userEvent.setup();
    useArmyStore.getState().setArmy('skaven');
    renderWithProviders(<UnitSpells unitId="Grey Seer" />);
    await user.click(screen.getByRole('button', { name: 'Spells' }));
    expect(screen.getByRole('dialog', { name: 'Spells' })).toBeInTheDocument();
  });

  it('renders nothing for a non-Wizard unit', () => {
    useArmyStore.getState().setArmy('goblin');
    const { container } = renderWithProviders(<UnitSpells unitId="Goblins" />);
    expect(container).toBeEmptyDOMElement();
  });
});
