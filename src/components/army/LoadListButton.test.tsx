import { describe, it, expect, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../test/renderWithProviders';
import LoadListButton from './LoadListButton';
import { useArmyStore } from '../../store/useArmyStore';
import { saveNamedList, encodeList, buildCodeMaps } from '../../store/persistence';
import { snapshotOf } from '../../store/snapshot';
import { loadArmy } from '../../data/loadArmy';

const seed = (name: string, gameSize: number) =>
  saveNamedList('bretonnia', name, { name, gameSize, units: {}, upgrades: {} });

// Encode the current store state so the list reads as clean (no dirty-confirm).
const markClean = () => {
  const { armyId, gameSize, units, label } = useArmyStore.getState();
  const maps = buildCodeMaps(loadArmy(armyId!));
  useArmyStore
    .getState()
    .setSavedBaseline(encodeList(snapshotOf({ gameSize, units, label }), maps));
};

describe('LoadListButton', () => {
  beforeEach(() => {
    localStorage.clear();
    useArmyStore.getState().setArmy('bretonnia');
  });

  it('shows an empty state when nothing is saved', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoadListButton />);
    await user.click(screen.getByRole('button', { name: /load/i }));
    expect(screen.getByText(/no saved lists/i)).toBeInTheDocument();
  });

  it('shows each saved list game size', async () => {
    const user = userEvent.setup();
    seed('Saved A', 1500);
    renderWithProviders(<LoadListButton />);
    await user.click(screen.getByRole('button', { name: /load/i }));
    expect(screen.getByText(/1500 pts/)).toBeInTheDocument();
  });

  it('loads a saved list, replacing the current one', async () => {
    const user = userEvent.setup();
    seed('Saved A', 1500);
    markClean();
    renderWithProviders(<LoadListButton />);
    await user.click(screen.getByRole('button', { name: /load/i }));
    await user.click(screen.getByRole('button', { name: /^Saved A$/ }));
    expect(useArmyStore.getState().gameSize).toBe(1500);
  });

  it('confirms before replacing a dirty list', async () => {
    const user = userEvent.setup();
    seed('Saved B', 1750);
    useArmyStore.getState().setSavedBaseline(null); // dirty
    renderWithProviders(<LoadListButton />);
    await user.click(screen.getByRole('button', { name: /load/i }));
    await user.click(screen.getByRole('button', { name: /^Saved B$/ }));
    expect(screen.getByText(/unsaved changes/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /replace/i }));
    expect(useArmyStore.getState().gameSize).toBe(1750);
  });

  it('deletes a saved list after confirming', async () => {
    const user = userEvent.setup();
    seed('Saved C', 1000);
    renderWithProviders(<LoadListButton />);
    await user.click(screen.getByRole('button', { name: /load/i }));
    await user.click(screen.getByRole('button', { name: /delete Saved C/i }));
    await user.click(screen.getByRole('button', { name: /confirm delete/i }));
    expect(screen.queryByRole('button', { name: /^Saved C$/ })).not.toBeInTheDocument();
    expect(screen.getByText(/no saved lists/i)).toBeInTheDocument();
  });
});
