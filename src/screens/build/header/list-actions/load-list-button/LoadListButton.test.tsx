import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { saveNamedList } from '@/core/persistence/savedLists';
import { useArmyStore } from '@/store/useArmyStore';
import { markClean } from '@/test/markClean';
import { renderWithProviders } from '@/test/renderWithProviders';
import { LoadListButton } from './LoadListButton';

const SMALL_GAME = 1000;
const MID_GAME = 1500;
const ODD_GAME = 1750;

const seed = (name: string, gameSize: number) =>
  saveNamedList('bretonnia', name, { name, gameSize, units: {}, upgrades: {} });

beforeEach(() => {
  localStorage.clear();
  useArmyStore.getState().setArmy('bretonnia');
});

describe('LoadListButton', () => {
  it('shows an empty state when nothing is saved', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoadListButton />);
    await user.click(screen.getByRole('button', { name: /load/i }));

    expect(screen.getByText(/no saved lists/i)).toBeInTheDocument();
  });

  it('shows each saved list game size', async () => {
    const user = userEvent.setup();
    seed('Saved A', MID_GAME);
    renderWithProviders(<LoadListButton />);
    await user.click(screen.getByRole('button', { name: /load/i }));

    expect(screen.getByText(/1500 pts/)).toBeInTheDocument();
  });

  it('loads a saved list, replacing the current one', async () => {
    const user = userEvent.setup();
    seed('Saved A', MID_GAME);
    markClean();
    renderWithProviders(<LoadListButton />);
    await user.click(screen.getByRole('button', { name: /load/i }));
    await user.click(screen.getByRole('button', { name: /^Saved A$/ }));

    expect(useArmyStore.getState().gameSize).toBe(MID_GAME);
  });

  it('confirms before replacing a dirty list', async () => {
    const user = userEvent.setup();
    seed('Saved B', ODD_GAME);
    useArmyStore.getState().setSavedBaseline(null); // dirty
    renderWithProviders(<LoadListButton />);
    await user.click(screen.getByRole('button', { name: /load/i }));
    await user.click(screen.getByRole('button', { name: /^Saved B$/ }));

    expect(screen.getByText(/unsaved changes/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /^replace$/i }));

    expect(useArmyStore.getState().gameSize).toBe(ODD_GAME);
  });

  it('deletes a saved list after confirming', async () => {
    const user = userEvent.setup();
    seed('Saved C', SMALL_GAME);
    renderWithProviders(<LoadListButton />);
    await user.click(screen.getByRole('button', { name: /load/i }));
    await user.click(screen.getByRole('button', { name: /delete Saved C/i }));
    await user.click(screen.getByRole('button', { name: /^delete$/i }));

    expect(screen.queryByRole('button', { name: /^Saved C$/ })).not.toBeInTheDocument();
    expect(screen.getByText(/no saved lists/i)).toBeInTheDocument();
  });
});

describe('LoadListButton focus and Escape', () => {
  it('keeps focus in the panel after deleting a list', async () => {
    const user = userEvent.setup();
    seed('Saved C', SMALL_GAME);
    renderWithProviders(<LoadListButton />);
    await user.click(screen.getByRole('button', { name: /load/i }));
    await user.click(screen.getByRole('button', { name: /delete Saved C/i }));
    await user.click(screen.getByRole('button', { name: /^delete$/i }));

    expect(screen.getByRole('dialog', { name: /load list/i })).toHaveFocus();
  });

  it('closes only the confirm dialog on Escape, leaving the panel open', async () => {
    const user = userEvent.setup();
    seed('Saved C', SMALL_GAME);
    renderWithProviders(<LoadListButton />);
    await user.click(screen.getByRole('button', { name: /load/i }));
    await user.click(screen.getByRole('button', { name: /delete Saved C/i }));
    await user.keyboard('{Escape}');

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(screen.getByRole('dialog', { name: /load list/i })).toBeInTheDocument();
  });
});
