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
});

describe('BuildHeader inline actions', () => {
  it('shows Save and Load inline; Share, Copy, Print, Reset live under More', async () => {
    const user = userEvent.setup();
    useArmyStore.getState().setArmy('goblin');
    renderWithProviders(<BuildHeader />);
    const inline = within(screen.getByTestId('actions-inline'));
    expect(inline.getByRole('button', { name: 'Save' })).toBeInTheDocument();
    expect(inline.getByRole('button', { name: 'Load' })).toBeInTheDocument();
    // Share/Copy/Print/Reset are not visible until the More menu is opened.
    expect(inline.queryByRole('button', { name: 'Share' })).not.toBeInTheDocument();
    expect(inline.queryByRole('button', { name: 'Copy' })).not.toBeInTheDocument();
    expect(inline.queryByRole('link', { name: /print/i })).not.toBeInTheDocument();

    await user.click(inline.getByRole('button', { name: /more/i }));
    const menu = within(inline.getByRole('menu'));
    expect(menu.getByRole('button', { name: 'Share' })).toBeInTheDocument();
    expect(menu.getByRole('button', { name: 'Copy' })).toBeInTheDocument();
    expect(menu.getByRole('link', { name: /print/i })).toBeInTheDocument();
    expect(menu.getByRole('button', { name: /reset/i })).toBeInTheDocument();
  });
});

describe('BuildHeader mobile menu', () => {
  it('opens a More menu containing Share, Copy, Print, and Reset', async () => {
    const user = userEvent.setup();
    useArmyStore.getState().setArmy('goblin');
    renderWithProviders(<BuildHeader />);

    const actions = within(screen.getByTestId('actions-menu'));
    expect(actions.getByRole('button', { name: 'Save' })).toBeInTheDocument();
    expect(actions.getByRole('button', { name: 'Load' })).toBeInTheDocument();

    const toggle = actions.getByRole('button', { name: /more/i });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');

    const menu = within(actions.getByRole('menu'));
    expect(menu.getByRole('button', { name: 'Share' })).toBeInTheDocument();
    expect(menu.getByRole('button', { name: 'Copy' })).toBeInTheDocument();
    expect(menu.getByRole('link', { name: /print/i })).toBeInTheDocument();
    expect(menu.getByRole('button', { name: /reset/i })).toBeInTheDocument();
  });

  it('closes the More menu when clicking outside', async () => {
    const user = userEvent.setup();
    useArmyStore.getState().setArmy('goblin');
    renderWithProviders(<BuildHeader />);

    const actions = within(screen.getByTestId('actions-menu'));
    const toggle = actions.getByRole('button', { name: /more/i });
    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await user.click(document.body);
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });
});

describe('BuildHeader list name', () => {
  it('shows the list name next to the faction when set', () => {
    useArmyStore.getState().setArmy('bretonnia');
    useArmyStore.getState().setLabel('Tourney List');
    renderWithProviders(<BuildHeader />);
    expect(screen.getByText('Tourney List')).toBeInTheDocument();
  });

  it('shows an "Unsaved" placeholder when the list has no name', () => {
    useArmyStore.getState().setArmy('bretonnia');
    renderWithProviders(<BuildHeader />);
    expect(screen.getByText('Unsaved')).toBeInTheDocument();
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
