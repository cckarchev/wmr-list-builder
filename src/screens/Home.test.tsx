import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import Home from './Home';
import { renderWithProviders } from '../test/renderWithProviders';
import { armyIndex } from '../data/armyIndex';

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
    const link = screen.getByRole('link', { name: goblinEntry!.name });
    expect(link).toHaveAttribute('href', '/build/goblin');
  });
});
