import { describe, it, expect, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { within } from '@testing-library/react';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../test/renderWithProviders';
import BuildHeader from './BuildHeader';
import { useArmyStore } from '../../store/useArmyStore';
import { breakPoint } from '../../store/selectors';

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
