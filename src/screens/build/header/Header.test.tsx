import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { breakPoint } from '@/core/selectors';
import { useArmyStore } from '@/store/useArmyStore';
import { markClean } from '@/test/markClean';
import { renderWithProviders } from '@/test/renderWithProviders';
import { Header } from './Header';

/** An odd count, so the break point has to round up. */
const GOBLIN_STANDS = 5;

beforeEach(() => {
  useArmyStore.getState().reset();
});

describe('Header', () => {
  it('renders the faction name as a heading', () => {
    useArmyStore.getState().setArmy('goblin');
    renderWithProviders(<Header />);

    expect(screen.getByRole('heading', { name: /goblin/i })).toBeInTheDocument();
  });

  it('shows a break-point stat equal to ceil(units / 2)', () => {
    useArmyStore.getState().setArmy('goblin');
    useArmyStore.getState().setUnitNumber('Goblins', GOBLIN_STANDS);
    const expected = breakPoint(useArmyStore.getState().units);

    expect(expected).toBeGreaterThan(0);

    renderWithProviders(<Header />);
    const stat = screen.getByTestId('break-point');

    expect(stat).toHaveTextContent(String(expected));
  });
});

describe('Header inline actions', () => {
  it('shows Save and Load inline; Share, Copy, Print, Reset live under More', async () => {
    const user = userEvent.setup();
    useArmyStore.getState().setArmy('goblin');
    renderWithProviders(<Header />);
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

describe('Header mobile menu', () => {
  it('opens a More menu containing Share, Copy, Print, and Reset', async () => {
    const user = userEvent.setup();
    useArmyStore.getState().setArmy('goblin');
    renderWithProviders(<Header />);

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
    renderWithProviders(<Header />);

    const actions = within(screen.getByTestId('actions-menu'));
    const toggle = actions.getByRole('button', { name: /more/i });
    await user.click(toggle);

    expect(toggle).toHaveAttribute('aria-expanded', 'true');

    await user.click(document.body);

    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });
});

describe('Header list name', () => {
  it('shows the list name next to the faction when set', () => {
    useArmyStore.getState().setArmy('bretonnia');
    useArmyStore.getState().setLabel('Tourney List');
    renderWithProviders(<Header />);

    expect(screen.getByText('Tourney List')).toBeInTheDocument();
  });

  it('shows an "Unsaved" placeholder when the list has no name', () => {
    useArmyStore.getState().setArmy('bretonnia');
    renderWithProviders(<Header />);

    expect(screen.getByText('Unsaved')).toBeInTheDocument();
  });

  it('renders Save and Load actions', () => {
    useArmyStore.getState().setArmy('bretonnia');
    renderWithProviders(<Header />);

    expect(screen.getAllByRole('button', { name: /save/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('button', { name: /load/i }).length).toBeGreaterThan(0);
  });

  it('marks the list unsaved when it diverges from the saved baseline', () => {
    useArmyStore.getState().setArmy('bretonnia');
    useArmyStore.getState().setLabel('Tourney List');
    useArmyStore.getState().setSavedBaseline(null); // no baseline => dirty
    renderWithProviders(<Header />);

    expect(screen.getByTestId('unsaved-marker')).toBeInTheDocument();
  });

  it('hides the unsaved marker when the list matches the baseline', () => {
    useArmyStore.getState().setArmy('bretonnia');
    useArmyStore.getState().setLabel('Tourney List');
    markClean();
    renderWithProviders(<Header />);

    expect(screen.queryByTestId('unsaved-marker')).not.toBeInTheDocument();
  });
});
