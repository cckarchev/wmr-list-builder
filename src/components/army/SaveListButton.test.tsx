import { describe, it, expect, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../test/renderWithProviders';
import SaveListButton from './SaveListButton';
import { useArmyStore } from '../../store/useArmyStore';
import { listSavedNames } from '../../store/persistence';

describe('SaveListButton', () => {
  beforeEach(() => {
    localStorage.clear();
    useArmyStore.getState().setArmy('bretonnia');
  });

  it('saves under a typed name and marks the list clean', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SaveListButton />);
    await user.click(screen.getByRole('button', { name: /save/i }));
    const input = screen.getByLabelText(/list name/i);
    await user.clear(input);
    await user.type(input, 'My Tourney List');
    await user.click(screen.getByRole('button', { name: /^save list$/i }));
    expect(listSavedNames('bretonnia')).toEqual(['My Tourney List']);
    expect(useArmyStore.getState().label).toBe('My Tourney List');
    expect(useArmyStore.getState().savedBaseline).not.toBeNull();
  });

  it('blocks saving an empty name', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SaveListButton />);
    await user.click(screen.getByRole('button', { name: /save/i }));
    await user.clear(screen.getByLabelText(/list name/i));
    await user.click(screen.getByRole('button', { name: /^save list$/i }));
    expect(listSavedNames('bretonnia')).toEqual([]);
    expect(screen.getByText(/enter a name/i)).toBeInTheDocument();
  });

  it('asks to confirm before overwriting an existing name', async () => {
    const user = userEvent.setup();
    useArmyStore.getState().setLabel('Existing');
    renderWithProviders(<SaveListButton />);
    // first save creates "Existing"
    await user.click(screen.getByRole('button', { name: /save/i }));
    await user.click(screen.getByRole('button', { name: /^save list$/i }));
    // second save of the same name should prompt to overwrite
    await user.click(screen.getByRole('button', { name: /save/i }));
    await user.click(screen.getByRole('button', { name: /^save list$/i }));
    expect(screen.getByText(/already exists/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /overwrite/i }));
    expect(listSavedNames('bretonnia')).toEqual(['Existing']);
  });
});
