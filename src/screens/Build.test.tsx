import { describe, it, expect, beforeEach } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { MemoryRouter } from 'react-router-dom';
import { render } from '@testing-library/react';
import { theme } from '../theme/theme';
import Build from './Build';
import { useArmyStore } from '../store/useArmyStore';

function renderBuild(path = '/build/goblin') {
  return render(
    <ThemeProvider theme={theme}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/build/:armyId" element={<Build />} />
        </Routes>
      </MemoryRouter>
    </ThemeProvider>,
  );
}

describe('Build screen', () => {
  beforeEach(() => {
    useArmyStore.getState().reset();
  });

  it('renders the army name "Goblin"', async () => {
    renderBuild('/build/goblin');
    expect(await screen.findByText('Goblin')).toBeInTheDocument();
  });

  it('renders the Goblins unit in the roster', async () => {
    renderBuild('/build/goblin');
    const matches = await screen.findAllByText('Goblins');
    expect(matches.length).toBeGreaterThan(0);
  });

  it('updates total points when a unit stepper is incremented', async () => {
    const user = userEvent.setup();
    renderBuild('/build/goblin');

    // Wait for army to load
    await screen.findByText('Goblin');

    // Scope assertions to the points bar so we don't match stepper/stat values
    const bar = screen.getByTestId('points-bar');
    const pointsTotal = within(bar).getByTestId('points-total');

    // Goblin force-includes its minimums: Warboss 80 + 8 Goblins (240) +
    // 4 Wolf Riders (240) = 560.
    expect(pointsTotal.textContent).toBe('560');

    // Add one more Goblins unit (30 pts each), taking them from 8 to 9. Goblins
    // is auto-included, so it has a stepper in both columns; use the roster one.
    const increaseBtn = screen.getAllByRole('button', { name: 'increase Goblins' })[0];
    await user.click(increaseBtn);

    expect(pointsTotal.textContent).toBe('590');

    // And another.
    await user.click(increaseBtn);
    expect(pointsTotal.textContent).toBe('620');
  });
});

describe('inline validation', () => {
  beforeEach(() => {
    useArmyStore.getState().reset();
  });

  it('shows an error on the offending unit row instead of a bottom list', async () => {
    // A 1-model Goblin Warboss carrying two mounts violates the mount cap.
    const store = useArmyStore.getState();
    store.setArmy('goblin');
    store.setUnitUpgradeNumber('Goblin Warboss', 'Wolf Chariot', 1); // Chariot Mount
    store.setUnitUpgradeNumber('Goblin Warboss', 'Wyvern', 1); // Monstrous Mount

    renderBuild('/build/goblin');
    await screen.findByText('Goblin');

    // The error renders inline (attributed to the Goblin Warboss row)...
    expect(screen.getByText(/may only have 1 mount/i)).toBeInTheDocument();
    // ...and the old detached bottom list is gone.
    expect(screen.queryByRole('list', { name: /validation errors/i })).not.toBeInTheDocument();

    // The points bar summarizes invalidity with a clickable control.
    expect(screen.getByTestId('invalid-indicator')).toBeInTheDocument();
  });

  it('shows the points-cap error globally in the points bar', async () => {
    const store = useArmyStore.getState();
    store.setArmy('goblin');
    store.setGameSize(500); // base goblin list (560) now exceeds the cap

    renderBuild('/build/goblin');
    await screen.findByText('Goblin');

    const bar = screen.getByTestId('points-bar');
    expect(within(bar).getByText(/points over the 500 cap/i)).toBeInTheDocument();
  });
});

describe('min/max in plain language', () => {
  beforeEach(() => {
    useArmyStore.getState().reset();
    localStorage.clear();
  });

  it('shows terse resolved badges with the full rule in a tooltip', async () => {
    renderBuild('/build/goblin');
    await screen.findByText('Goblin');

    // Goblins carry min 4 per 1,000 pts; at the default 2,000-pt game that's 8+.
    expect(screen.getByText('8+')).toBeInTheDocument();
    // ...with the full rule available in a tooltip bubble.
    expect(screen.getByText('min 4 per 1,000 pts (≈ 8+ at this size)')).toBeInTheDocument();
    // The Goblin Warboss is armyMin 1 / armyMax 1 → a bare "1" badge + rule.
    expect(screen.getByText('exactly 1 per army')).toBeInTheDocument();
    // The cryptic raw token form is gone.
    expect(screen.queryByText(/min\/max:/)).not.toBeInTheDocument();
  });
});

describe('roster organization', () => {
  beforeEach(() => {
    useArmyStore.getState().reset();
    localStorage.clear();
  });

  it('groups the roster under type headers', async () => {
    renderBuild('/build/goblin');
    await screen.findByText('Goblin');

    const roster = screen.getByRole('region', { name: 'Roster' });
    expect(within(roster).getByRole('heading', { name: 'Characters' })).toBeInTheDocument();
    expect(within(roster).getByRole('heading', { name: 'Monster' })).toBeInTheDocument();
  });

  it('filters units by a name search and shows a zero-result message', async () => {
    const user = userEvent.setup();
    renderBuild('/build/goblin');
    await screen.findByText('Goblin');

    await user.click(screen.getByRole('button', { name: /filters/i }));
    const box = screen.getByRole('searchbox', { name: 'Search units' });
    await user.type(box, 'giant');

    const roster = screen.getByRole('region', { name: 'Roster' });
    expect(within(roster).getByText('Giant')).toBeInTheDocument();
    expect(within(roster).queryByText('Wolf Riders')).not.toBeInTheDocument();

    await user.clear(box);
    await user.type(box, 'zzz');
    expect(within(roster).getByText(/No units match/i)).toBeInTheDocument();
  });

  it('toggles a type filter to show only that group', async () => {
    const user = userEvent.setup();
    renderBuild('/build/goblin');
    await screen.findByText('Goblin');

    const roster = screen.getByRole('region', { name: 'Roster' });
    await user.click(within(roster).getByRole('button', { name: /filters/i }));
    const cavalryChip = within(roster).getByRole('button', { name: 'Cavalry', pressed: false });
    await user.click(cavalryChip);

    // Only the Cavalry group remains.
    expect(within(roster).getByRole('heading', { name: 'Cavalry' })).toBeInTheDocument();
    expect(within(roster).queryByRole('heading', { name: 'Monster' })).not.toBeInTheDocument();
    expect(cavalryChip).toHaveAttribute('aria-pressed', 'true');

    // Toggling it off restores the full roster.
    await user.click(cavalryChip);
    expect(within(roster).getByRole('heading', { name: 'Monster' })).toBeInTheDocument();
  });
});

describe('persistence', () => {
  beforeEach(() => {
    useArmyStore.getState().reset();
    localStorage.clear();
  });

  it('restores the saved list after a store reset (simulated reload)', async () => {
    const user = userEvent.setup();
    const first = renderBuild('/build/goblin');
    await screen.findByText('Goblin');

    await user.click(screen.getAllByRole('button', { name: /increase Goblins/i })[0]);
    const afterAdd = screen.getByTestId('points-total').textContent;
    expect(afterAdd).not.toBe('0');

    first.unmount();
    useArmyStore.getState().reset();

    renderBuild('/build/goblin');
    await screen.findByText('Goblin');
    expect(screen.getByTestId('points-total').textContent).toBe(afterAdd);
  });
});
