import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { encodeListFor } from '@/core/persistence/list-codec/listCodec';
import { useArmyStore } from '@/store/useArmyStore';
import { renderWithProviders } from '@/test/renderWithProviders';
import { App } from './App';

const HOME_TITLE = 'Warmaster Revolution Armies';

beforeEach(() => {
  useArmyStore.getState().reset();
  // Build auto-saves to localStorage; clear it so a list applied in one test
  // doesn't leak into the next via loadList().
  localStorage.clear();
});

describe('App routing from the root', () => {
  it('shows the Home army picker at "/"', () => {
    renderWithProviders(<App />, { routerProps: { initialEntries: ['/'] } });

    expect(screen.getByRole('heading', { name: HOME_TITLE })).toBeInTheDocument();
    // The Goblin army card links to its build route.
    const link = screen.getByRole('link', { name: 'Goblin' });
    expect(link).toHaveAttribute('href', '/build/goblin');
  });

  it('renders Build directly at root when ?army= names a valid army', async () => {
    renderWithProviders(<App />, { routerProps: { initialEntries: ['/?army=goblin'] } });

    // Build screen (not the picker) is shown for the named army.
    expect(await screen.findByTestId('points-bar')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: HOME_TITLE })).not.toBeInTheDocument();
  });

  it('loads a shared list from root query params', async () => {
    // Encode a goblin list with Goblins bumped to 9 (force-min 8 + 1 = 590pts),
    // matching the standalone Print round-trip assertion above.
    const encoded = encodeListFor('goblin', {
      name: '',
      gameSize: 2000,
      units: { goblins: 9 },
      upgrades: {},
    });

    renderWithProviders(<App />, {
      routerProps: { initialEntries: [`/?army=goblin&list=${encoded}`] },
    });

    const bar = await screen.findByTestId('points-bar');
    expect(within(bar).getByTestId('points-total').textContent).toBe('590');
  });

  it('shows the army picker at root when ?army= is unknown', () => {
    renderWithProviders(<App />, {
      routerProps: { initialEntries: ['/?army=does-not-exist'] },
    });

    expect(screen.getByRole('heading', { name: HOME_TITLE })).toBeInTheDocument();
  });

  it('shows the army picker at root when ?army= names an inherited object key', () => {
    renderWithProviders(<App />, {
      routerProps: { initialEntries: ['/?army=constructor'] },
    });

    expect(screen.getByRole('heading', { name: HOME_TITLE })).toBeInTheDocument();
  });

  it('navigates Home → Build when an army is chosen', async () => {
    const user = userEvent.setup();
    renderWithProviders(<App />, { routerProps: { initialEntries: ['/'] } });

    await user.click(screen.getByRole('link', { name: 'Goblin' }));

    // Build screen shows the points bar and a Print action (under the More menu).
    expect(await screen.findByTestId('points-bar')).toBeInTheDocument();
    const inline = within(screen.getByTestId('actions-inline'));
    await user.click(inline.getByRole('button', { name: /more/i }));
    expect(
      within(inline.getByRole('group', { name: /more list actions/i })).getByRole('link', {
        name: 'Print',
      }),
    ).toHaveAttribute('href', '/print/goblin');
  });
});

describe('App routing for build and print', () => {
  it('redirects an unknown army id back to Home', () => {
    renderWithProviders(<App />, {
      routerProps: { initialEntries: ['/build/does-not-exist'] },
    });

    expect(screen.getByRole('heading', { name: HOME_TITLE })).toBeInTheDocument();
  });

  it('redirects an army id that is an inherited object key back to Home', () => {
    renderWithProviders(<App />, {
      routerProps: { initialEntries: ['/build/constructor'] },
    });

    expect(screen.getByRole('heading', { name: HOME_TITLE })).toBeInTheDocument();
  });

  it('renders the Print screen for a valid army', async () => {
    renderWithProviders(<App />, {
      routerProps: { initialEntries: ['/print/goblin'] },
    });

    // The print controls expose a Print button.
    await screen.findByRole('heading', { level: 1, name: 'Goblin' });
    expect(screen.getByRole('button', { name: 'Print' })).toBeInTheDocument();
  });

  it('preserves the roster when returning to Build from Print', async () => {
    const user = userEvent.setup();
    renderWithProviders(<App />, { routerProps: { initialEntries: ['/build/goblin'] } });

    await screen.findByText('Goblin');
    // Goblins auto-includes, so it has a stepper in both columns; use the roster one.
    await user.click(screen.getAllByRole('button', { name: 'increase Goblins' })[0]);
    // Force-included goblin base (560) + 30 for taking Goblins from 8 to 9 = 590.
    expect(within(screen.getByTestId('points-bar')).getByTestId('points-total').textContent).toBe(
      '590',
    );

    // Go to Print (under the More menu), then back to the roster via the nav "Back" chip.
    const inline = within(screen.getByTestId('actions-inline'));
    await user.click(inline.getByRole('button', { name: /more/i }));
    await user.click(
      within(inline.getByRole('group', { name: /more list actions/i })).getByRole('link', {
        name: 'Print',
      }),
    );
    await screen.findByRole('button', { name: 'Print' });
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

describe('App routing to About', () => {
  it('shows the About page at "/about", reachable from the footer', async () => {
    const user = userEvent.setup();
    renderWithProviders(<App />, { routerProps: { initialEntries: ['/'] } });

    await user.click(screen.getByRole('link', { name: 'About' }));

    expect(screen.getByRole('heading', { name: 'About', level: 1 })).toBeInTheDocument();
  });
});
