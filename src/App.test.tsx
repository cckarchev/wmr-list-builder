import { describe, it, expect, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
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

    expect(
      screen.getByRole('heading', { name: /list builder/i }),
    ).toBeInTheDocument();
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
    expect(screen.getByRole('link', { name: 'Print' })).toHaveAttribute(
      'href',
      '/print/goblin',
    );
  });

  it('redirects an unknown army id back to Home', () => {
    renderWithProviders(<App />, {
      routerProps: { initialEntries: ['/build/does-not-exist'] },
    });

    expect(
      screen.getByRole('heading', { name: /list builder/i }),
    ).toBeInTheDocument();
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

  it('shows a back link to the army list on inner screens', async () => {
    renderWithProviders(<App />, {
      routerProps: { initialEntries: ['/build/goblin'] },
    });

    const back = screen.getByRole('link', { name: /all armies/i });
    expect(back).toHaveAttribute('href', '/');
  });
});
