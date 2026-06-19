import { describe, it, expect, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../test/renderWithProviders';
import UnitRules from './UnitRules';
import { useArmyStore } from '../../store/useArmyStore';

beforeEach(() => useArmyStore.getState().reset());

describe('UnitRules', () => {
  it('renders a Rules trigger for a unit that has rules and shows text on click', async () => {
    const user = userEvent.setup();
    useArmyStore.getState().setArmy('goblin');
    renderWithProviders(<UnitRules unitId="Spear Chukka" />);
    const trigger = screen.getByRole('button', { name: 'Spear Chukka special rules' });
    await user.click(trigger);
    expect(screen.getByRole('dialog')).toHaveTextContent(/Bolt Thrower/i);
  });

  it('renders nothing for a unit without special rules', () => {
    useArmyStore.getState().setArmy('goblin');
    const { container } = renderWithProviders(<UnitRules unitId="Squig Herd" />);
    expect(container).toBeEmptyDOMElement();
  });
});
