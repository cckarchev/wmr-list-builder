import { describe, it, expect, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { render } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { theme } from '../theme/theme';
import Print from './Print';
import { useArmyStore } from '../store/useArmyStore';

function renderPrint(path = '/print/goblin') {
  return render(
    <ThemeProvider theme={theme}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/print/:armyId" element={<Print />} />
        </Routes>
      </MemoryRouter>
    </ThemeProvider>,
  );
}

describe('Print screen', () => {
  beforeEach(() => {
    useArmyStore.getState().reset();
  });

  it('shows the faction as the document title when the list is unnamed', async () => {
    renderPrint('/print/goblin');
    expect(await screen.findByRole('heading', { level: 1, name: 'Goblin' })).toBeInTheDocument();
  });

  it('shows faction and list name in the title when the list is named', async () => {
    useArmyStore.getState().setArmy('goblin');
    useArmyStore.getState().setLabel('My List');
    renderPrint('/print/goblin');
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Goblin · My List' }),
    ).toBeInTheDocument();
  });

  it('renders a Stats section toggle', async () => {
    renderPrint('/print/goblin');
    await screen.findByRole('heading', { level: 1, name: 'Goblin' });
    expect(screen.getByRole('checkbox', { name: /stats/i })).toBeInTheDocument();
  });

  it('splits the stats into a Units table (no ruleset noise)', async () => {
    renderPrint('/print/goblin');
    await screen.findByRole('heading', { level: 1, name: 'Goblin' });
    expect(screen.getByText('Units', { selector: 'caption' })).toBeInTheDocument();
    expect(screen.queryByText(/warmaster revolution/i)).not.toBeInTheDocument();
  });

  it('offers two-column and spell-fluff print options', async () => {
    renderPrint('/print/goblin');
    await screen.findByRole('heading', { level: 1, name: 'Goblin' });
    const twoColumn = screen.getByRole('checkbox', { name: /two columns/i });
    const spellFluff = screen.getByRole('checkbox', { name: /spell fluff/i });
    expect(twoColumn).not.toBeChecked();
    expect(spellFluff).not.toBeChecked();
  });

  it('renders the spells heading for a magic army', async () => {
    renderPrint('/print/goblin');
    await screen.findByRole('heading', { level: 1, name: 'Goblin' });
    const spellsHeadings = screen.getAllByText('Spells');
    expect(spellsHeadings.some((el) => el.tagName === 'H3')).toBe(true);
  });

  it('does not render a Text List section', async () => {
    renderPrint('/print/goblin');
    await screen.findByRole('heading', { level: 1, name: 'Goblin' });
    expect(screen.queryByRole('checkbox', { name: /text list/i })).not.toBeInTheDocument();
  });
});
