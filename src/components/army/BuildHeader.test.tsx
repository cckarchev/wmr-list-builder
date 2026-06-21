import { describe, it, expect, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { within } from '@testing-library/react';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../test/renderWithProviders';
import BuildHeader from './BuildHeader';
import { useArmyStore } from '../../store/useArmyStore';
import { breakPoint } from '../../store/selectors';
import { snapshotOf } from '../../store/snapshot';
import { encodeList, buildCodeMaps } from '../../store/persistence';
import { loadArmy } from '../../data/loadArmy';

beforeEach(() => {
  useArmyStore.getState().reset();
});

describe('BuildHeader', () => {
  it('renders the faction name as a heading', () => {
    useArmyStore.getState().setArmy('goblin');
    renderWithProviders(<BuildHeader />);
    expect(screen.getByRole('heading', { name: /goblin/i })).toBeInTheDocument();
  });

  it('shows a break-point stat equal to ceil(units / 2)', () => {
    useArmyStore.getState().setArmy('goblin');
    useArmyStore.getState().setUnitNumber('Goblins', 5);
    const expected = breakPoint(useArmyStore.getState().units);
    expect(expected).toBeGreaterThan(0);
    renderWithProviders(<BuildHeader />);
    const stat = screen.getByTestId('break-point');
    expect(stat).toHaveTextContent(String(expected));
  });

  it('renders Copy, Share, and Print inline actions', () => {
    useArmyStore.getState().setArmy('goblin');
    renderWithProviders(<BuildHeader />);
    const inline = within(screen.getByTestId('actions-inline'));
    expect(inline.getByRole('button', { name: 'Copy' })).toBeInTheDocument();
    expect(inline.getByRole('button', { name: 'Share' })).toBeInTheDocument();
    expect(inline.getByRole('link', { name: /print/i })).toBeInTheDocument();
  });
});

describe('BuildHeader export menu', () => {
  it('toggles a menu containing Copy, Share, and Print', async () => {
    const user = userEvent.setup();
    useArmyStore.getState().setArmy('goblin');
    renderWithProviders(<BuildHeader />);

    const menu = within(screen.getByTestId('actions-menu'));
    const toggle = menu.getByRole('button', { name: /export/i });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');

    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(menu.getByRole('button', { name: 'Copy' })).toBeInTheDocument();
    expect(menu.getByRole('button', { name: 'Share' })).toBeInTheDocument();
    expect(menu.getByRole('link', { name: /print/i })).toBeInTheDocument();
  });

  it('closes when clicking outside the menu', async () => {
    const user = userEvent.setup();
    useArmyStore.getState().setArmy('goblin');
    renderWithProviders(<BuildHeader />);

    const menu = within(screen.getByTestId('actions-menu'));
    const toggle = menu.getByRole('button', { name: /export/i });

    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');

    await user.click(document.body);
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(menu.queryByRole('menu')).not.toBeInTheDocument();
  });
});

describe('BuildHeader list name', () => {
  it('shows the list name next to the faction when set', () => {
    useArmyStore.getState().setArmy('bretonnia');
    useArmyStore.getState().setLabel('Tourney List');
    renderWithProviders(<BuildHeader />);
    expect(screen.getByText('Tourney List')).toBeInTheDocument();
  });

  it('renders Save and Load actions', () => {
    useArmyStore.getState().setArmy('bretonnia');
    renderWithProviders(<BuildHeader />);
    expect(screen.getAllByRole('button', { name: /save/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('button', { name: /load/i }).length).toBeGreaterThan(0);
  });

  it('marks the list unsaved when it diverges from the saved baseline', () => {
    useArmyStore.getState().setArmy('bretonnia');
    useArmyStore.getState().setLabel('Tourney List');
    useArmyStore.getState().setSavedBaseline(null); // no baseline => dirty
    renderWithProviders(<BuildHeader />);
    expect(screen.getByTestId('unsaved-marker')).toBeInTheDocument();
  });

  it('hides the unsaved marker when the list matches the baseline', () => {
    useArmyStore.getState().setArmy('bretonnia');
    useArmyStore.getState().setLabel('Tourney List');
    const { armyId, gameSize, units, label } = useArmyStore.getState();
    const maps = buildCodeMaps(loadArmy(armyId!));
    useArmyStore
      .getState()
      .setSavedBaseline(encodeList(snapshotOf({ gameSize, units, label }), maps));
    renderWithProviders(<BuildHeader />);
    expect(screen.queryByTestId('unsaved-marker')).not.toBeInTheDocument();
  });
});
