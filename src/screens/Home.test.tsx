import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { armyIndex } from '../data/armyIndex';
import { defined } from '../test/defined';
import { renderWithProviders } from '../test/renderWithProviders';
import Home from './Home';

describe('Home', () => {
  it('renders all 25 army links', () => {
    renderWithProviders(<Home />);
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(armyIndex.length);
    expect(armyIndex).toHaveLength(25);
  });

  it('includes a link for each army by name', () => {
    renderWithProviders(<Home />);
    for (const { name } of armyIndex) {
      expect(screen.getByRole('link', { name })).toBeInTheDocument();
    }
  });

  it('links point to /build/:id', () => {
    renderWithProviders(<Home />);
    const goblinEntry = armyIndex.find((a) => a.id === 'goblin');
    expect(goblinEntry).toBeDefined();
    const link = screen.getByRole('link', { name: defined(goblinEntry, 'goblinEntry').name });
    expect(link).toHaveAttribute('href', '/build/goblin');
  });
});
