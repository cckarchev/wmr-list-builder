import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, MemoryRouter, Route, RouterProvider, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { useArmyStore } from '@/store/useArmyStore';
import { Print } from './Print';

const renderPrint = (path = '/print/goblin') =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/print/:armyId" element={<Print />} />
      </Routes>
    </MemoryRouter>,
  );

const GOBLIN_SPELL_FLUFF = /summons the power of Mork/;

const findTitle = () => screen.findByRole('heading', { level: 1, name: 'Goblin' });

const printDocument = (container: HTMLElement): Element | null =>
  container.querySelector('.print-document');

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

  it('splits characters and units via column headers (no ruleset noise)', async () => {
    renderPrint('/print/goblin');
    await screen.findByRole('heading', { level: 1, name: 'Goblin' });

    expect(screen.getByText('Character', { selector: 'th' })).toBeInTheDocument();
    expect(screen.getByText('Troop', { selector: 'th' })).toBeInTheDocument();
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

describe('print sections', () => {
  beforeEach(() => {
    useArmyStore.getState().reset();
  });

  it('leaves out a section when its checkbox is cleared', async () => {
    const user = userEvent.setup();
    renderPrint('/print/goblin');
    await findTitle();
    const stats = screen.getByRole('checkbox', { name: /stats/i });

    await user.click(stats);

    expect(stats).not.toBeChecked();
    expect(screen.queryByText('Character', { selector: 'th' })).not.toBeInTheDocument();

    await user.click(stats);

    expect(screen.getByText('Character', { selector: 'th' })).toBeInTheDocument();
  });

  it('selects every section again when the army changes', async () => {
    const user = userEvent.setup();
    const router = createMemoryRouter([{ path: '/print/:armyId', element: <Print /> }], {
      initialEntries: ['/print/goblin'],
    });
    render(<RouterProvider router={router} />);
    await findTitle();
    await user.click(screen.getByRole('checkbox', { name: /stats/i }));

    await act(() => router.navigate('/print/empire'));
    await screen.findByRole('heading', { level: 1, name: 'Empire' });

    expect(screen.getByRole('checkbox', { name: /stats/i })).toBeChecked();
  });
});

describe('print options', () => {
  beforeEach(() => {
    useArmyStore.getState().reset();
  });

  it('hides the title with Hide name', async () => {
    const user = userEvent.setup();
    renderPrint('/print/goblin');
    await findTitle();

    await user.click(screen.getByRole('checkbox', { name: /hide name/i }));

    expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument();
  });

  it('shows each spell’s flavor line with Spell fluff', async () => {
    const user = userEvent.setup();
    renderPrint('/print/goblin');
    await findTitle();

    expect(screen.queryByText(GOBLIN_SPELL_FLUFF)).not.toBeInTheDocument();

    await user.click(screen.getByRole('checkbox', { name: /spell fluff/i }));

    expect(screen.getByText(GOBLIN_SPELL_FLUFF)).toBeInTheDocument();
  });

  it('flows every section but the stats table into two columns', async () => {
    const user = userEvent.setup();
    const { container } = renderPrint('/print/goblin');
    await findTitle();

    await user.click(screen.getByRole('checkbox', { name: /two columns/i }));

    const sections = Array.from(container.querySelectorAll('section'));
    const statsSection = sections.find((section) => section.querySelector('table'));
    const otherSections = sections.filter((section) => section !== statsSection);

    expect(statsSection).not.toHaveAttribute('data-columns');
    expect(otherSections.length).toBeGreaterThan(0);

    for (const section of otherSections) {
      expect(section).toHaveAttribute('data-columns');
    }
  });

  it('marks the sheet for the smaller font and condensed print styles', async () => {
    const user = userEvent.setup();
    const { container } = renderPrint('/print/goblin');
    await findTitle();

    expect(printDocument(container)).not.toHaveClass('font-small', 'condensed');

    await user.click(screen.getByRole('checkbox', { name: /smaller font/i }));
    await user.click(screen.getByRole('checkbox', { name: /condensed/i }));

    expect(printDocument(container)).toHaveClass('font-small', 'condensed');
  });
});
