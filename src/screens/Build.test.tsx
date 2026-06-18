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

    expect(pointsTotal).toHaveTextContent('0');

    // Add one Goblins unit (30 pts each)
    const increaseBtn = screen.getByRole('button', { name: 'increase Goblins' });
    await user.click(increaseBtn);

    expect(pointsTotal).toHaveTextContent('30');

    // Add another Goblins unit (60 pts total)
    await user.click(increaseBtn);
    expect(pointsTotal).toHaveTextContent('60');
  });
});
