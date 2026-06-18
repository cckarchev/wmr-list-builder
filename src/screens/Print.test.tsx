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

  it('loads goblin army and renders the stats section with "Goblins"', async () => {
    renderPrint('/print/goblin');
    const matches = await screen.findAllByText('Goblins');
    expect(matches.length).toBeGreaterThan(0);
  });

  it('renders section checkboxes for the available print items', async () => {
    renderPrint('/print/goblin');
    // Wait for army to load
    await screen.findAllByText('Goblins');

    // Text List checkbox should be present
    const checkbox = screen.getByRole('checkbox', { name: /text list/i });
    expect(checkbox).toBeInTheDocument();
  });

  it('renders the Stats (all) section with army name in caption', async () => {
    renderPrint('/print/goblin');
    await screen.findAllByText('Goblins');
    // The Stats caption should include the army name
    expect(screen.getByText(/goblin — warmaster revolution/i)).toBeInTheDocument();
  });

  it('renders the TextList section with army name and version', async () => {
    // Seed with a unit selected so text list shows something
    useArmyStore.getState().setArmy('goblin');
    useArmyStore.getState().setUnitNumber('Goblins', 2);

    renderPrint('/print/goblin');
    await screen.findAllByText('Goblins');

    // The pre element should contain the army name
    const preEls = await screen.findAllByText(/goblin, \d+ points/i);
    expect(preEls.length).toBeGreaterThan(0);
  });

  it('renders spells heading for a magic army', async () => {
    renderPrint('/print/goblin');
    await screen.findAllByText('Goblins');
    // Goblin army has spells — look for the h3 heading specifically
    const spellsHeadings = screen.getAllByText('Spells');
    // At least one should be an h3 (the section heading)
    expect(spellsHeadings.some((el) => el.tagName === 'H3')).toBe(true);
  });
});
