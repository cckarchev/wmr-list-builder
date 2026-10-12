import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { armyIndex } from '@/data/armyIndex';
import { defined } from '@/test/defined';
import { renderWithProviders } from '@/test/renderWithProviders';
import { FACTION_TAGLINES } from './army-card/factionTaglines';
import { Home } from './Home';

/** Dark Elves, High Elves and Wood Elves. */
const ELF_ARMY_COUNT = 3;

const searchBox = () => screen.getByRole('searchbox', { name: 'Search armies' });

describe('Home', () => {
  it('renders one link per army', () => {
    renderWithProviders(<Home />);
    const links = screen.getAllByRole('link');

    expect(links).toHaveLength(armyIndex.length);
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

  it('describes each army link with its tagline', () => {
    renderWithProviders(<Home />);

    const link = screen.getByRole('link', { name: 'Goblin' });

    expect(link).toHaveAccessibleDescription(FACTION_TAGLINES.goblin);
  });

  it('filters the armies by the search query', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Home />);

    await user.type(searchBox(), 'elves');

    expect(screen.getAllByRole('link')).toHaveLength(ELF_ARMY_COUNT);
    expect(screen.getByRole('link', { name: 'Dark Elves' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Empire' })).not.toBeInTheDocument();
  });

  it('shows an empty state that clears the search', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Home />);

    await user.type(searchBox(), 'zzz');

    expect(screen.queryAllByRole('link')).toHaveLength(0);
    expect(screen.getByText(/No army matches/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Clear search' }));

    expect(searchBox()).toHaveValue('');
    expect(screen.getAllByRole('link')).toHaveLength(armyIndex.length);
  });
});
