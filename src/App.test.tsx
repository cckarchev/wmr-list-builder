import { describe, it, expect, beforeEach } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from './test/renderWithProviders';
import App from './App';
import { useArmyStore } from './store/useArmyStore';

beforeEach(() => {
  useArmyStore.getState().reset();
});

describe('App routing', () => {
  it('shows the Home army picker at "/"', () => {
    renderWithProviders(<App />, { routerProps: { initialEntries: ['/'] } });

    expect(screen.getByRole('heading', { name: /choose your army/i })).toBeInTheDocument();
    // The Goblin army card links to its build route.
    const link = screen.getByRole('link', { name: 'Goblin' });
    expect(link).toHaveAttribute('href', '/build/goblin');
  });

  it('navigates Home → Build when an army is chosen', async () => {
    const user = userEvent.setup();
    renderWithProviders(<App />, { routerProps: { initialEntries: ['/'] } });

    await user.click(screen.getByRole('link', { name: 'Goblin' }));

    // Build screen shows the points bar and a Print action.
    expect(await screen.findByTestId('points-bar')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Print' })).toHaveAttribute('href', '/print/goblin');
  });

  it('redirects an unknown army id back to Home', () => {
    renderWithProviders(<App />, {
      routerProps: { initialEntries: ['/build/does-not-exist'] },
    });

    expect(screen.getByRole('heading', { name: /choose your army/i })).toBeInTheDocument();
  });

  it('renders the Print screen for a valid army', async () => {
    renderWithProviders(<App />, {
      routerProps: { initialEntries: ['/print/goblin'] },
    });

    // The print controls expose a Print button.
    const controls = await screen.findByText(/check the sections you want/i);
    expect(controls).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Print' })).toBeInTheDocument();
  });

  it('preserves the roster when returning to Build from Print', async () => {
    const user = userEvent.setup();
    renderWithProviders(<App />, { routerProps: { initialEntries: ['/build/goblin'] } });

    await screen.findByText('Goblin');
    // Goblins auto-includes, so it has a stepper in both columns; use the roster one.
    await user.click(screen.getAllByRole('button', { name: 'increase Goblins' })[0]);
    // Force-included goblin base (560) + 30 for taking Goblins from 8 to 9 = 590.
    expect(
      within(screen.getByTestId('points-bar')).getByTestId('points-total').textContent,
    ).toBe('590');

    // Go to Print, then back to the roster via the nav "Back" chip.
    await user.click(screen.getByRole('link', { name: 'Print' }));
    await screen.findByText(/check the sections/i);
    await user.click(screen.getByRole('link', { name: /back/i }));

    // The selection must survive the round trip.
    const bar = await screen.findByTestId('points-bar');
    expect(within(bar).getByTestId('points-total').textContent).toBe('590');
  });

  it('uses the brand as the home link on Build, with no redundant army-list link', () => {
    renderWithProviders(<App />, {
      routerProps: { initialEntries: ['/build/goblin'] },
    });

    expect(screen.getByRole('link', { name: /warmaster revolution/i })).toHaveAttribute(
      'href',
      '/',
    );
    expect(screen.queryByRole('link', { name: /all armies/i })).not.toBeInTheDocument();
  });

  it('shows a prominent back-to-roster link on the print sheet', () => {
    renderWithProviders(<App />, {
      routerProps: { initialEntries: ['/print/goblin'] },
    });

    expect(screen.getByRole('link', { name: /back/i })).toHaveAttribute('href', '/build/goblin');
  });
});
