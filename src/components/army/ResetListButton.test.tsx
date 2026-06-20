import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';

import { theme } from '../../theme/theme';
import ResetListButton from './ResetListButton';
import { useArmyStore } from '../../store/useArmyStore';

function LocationProbe() {
  const { search } = useLocation();
  return <div data-testid="search">{search}</div>;
}

function renderReset(path: string) {
  return render(
    <ThemeProvider theme={theme}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route
            path="/build/:armyId"
            element={
              <>
                <ResetListButton />
                <LocationProbe />
              </>
            }
          />
        </Routes>
      </MemoryRouter>
    </ThemeProvider>,
  );
}

describe('ResetListButton', () => {
  beforeEach(() => {
    useArmyStore.getState().setArmy('goblin');
    vi.spyOn(window, 'confirm').mockReturnValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    useArmyStore.getState().reset();
  });

  it('clears the ?list= param on reset', async () => {
    const user = userEvent.setup();
    renderReset('/build/goblin?list=abc123');

    expect(screen.getByTestId('search').textContent).toBe('?list=abc123');

    await user.click(screen.getByRole('button', { name: /reset/i }));

    expect(screen.getByTestId('search').textContent).toBe('');
  });

  it('does nothing to the URL when confirm is cancelled', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    const user = userEvent.setup();
    renderReset('/build/goblin?list=abc123');

    await user.click(screen.getByRole('button', { name: /reset/i }));

    expect(screen.getByTestId('search').textContent).toBe('?list=abc123');
  });
});
