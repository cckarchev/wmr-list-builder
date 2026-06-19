import { describe, it, expect, beforeEach } from 'vitest';
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
    expect(inline.getByRole('button', { name: 'Copy List' })).toBeInTheDocument();
    expect(inline.getByRole('button', { name: 'Copy share link' })).toBeInTheDocument();
    expect(inline.getByRole('link', { name: /print/i })).toBeInTheDocument();
  });
});
