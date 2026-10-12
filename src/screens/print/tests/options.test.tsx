import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { findTitle, printSheet, renderPrint, resetPrintState } from './renderPrint';

const GOBLIN_SPELL_FLUFF = /summons the power of Mork/;

/** A matchMedia that answers every query with `matches`. */
const stubMatchMedia = (matches: boolean) => {
  vi.stubGlobal('matchMedia', () => ({
    matches,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
};

beforeEach(resetPrintState);

describe('print options', () => {
  it('offers two-column and spell-fluff print options, both off', async () => {
    renderPrint('/print/goblin');
    await findTitle();

    expect(screen.getByRole('checkbox', { name: /two columns/i })).not.toBeChecked();
    expect(screen.getByRole('checkbox', { name: /spell fluff/i })).not.toBeChecked();
  });

  it('hides the title with Hide list name', async () => {
    const user = userEvent.setup();
    renderPrint('/print/goblin');
    await findTitle();

    await user.click(screen.getByRole('checkbox', { name: /hide list name/i }));

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

  it('remembers the options for the next visit', async () => {
    const user = userEvent.setup();
    const { unmount } = renderPrint('/print/goblin');
    await findTitle();

    await user.click(screen.getByRole('checkbox', { name: /two columns/i }));
    unmount();
    renderPrint('/print/goblin');
    await findTitle();

    expect(screen.getByRole('checkbox', { name: /two columns/i })).toBeChecked();
  });
});

describe('print sheet styles', () => {
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
    renderPrint('/print/goblin');
    await findTitle();

    expect(printSheet()).not.toHaveAttribute('data-small-font');
    expect(printSheet()).not.toHaveAttribute('data-condensed');

    await user.click(screen.getByRole('checkbox', { name: /smaller font/i }));
    await user.click(screen.getByRole('checkbox', { name: /condensed/i }));

    expect(printSheet()).toHaveAttribute('data-small-font');
    expect(printSheet()).toHaveAttribute('data-condensed');
  });

  it('marks the sheet for the legible font and page per section styles', async () => {
    const user = userEvent.setup();
    renderPrint('/print/goblin');
    await findTitle();

    expect(printSheet()).not.toHaveAttribute('data-legible-font');
    expect(printSheet()).not.toHaveAttribute('data-page-per-section');

    await user.click(screen.getByRole('checkbox', { name: /legible font/i }));
    await user.click(screen.getByRole('checkbox', { name: /page per section/i }));

    expect(printSheet()).toHaveAttribute('data-legible-font');
    expect(printSheet()).toHaveAttribute('data-page-per-section');
  });
});

describe('print page estimate', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('estimates the page count when the preview is paper sized', async () => {
    stubMatchMedia(true);
    renderPrint('/print/goblin');
    await findTitle();

    expect(screen.getByText('≈ 1 page')).toBeInTheDocument();
  });

  it('gives no estimate when the preview is too narrow to tell', async () => {
    stubMatchMedia(false);
    renderPrint('/print/goblin');
    await findTitle();

    expect(screen.queryByText(/≈ \d+ pages?/)).not.toBeInTheDocument();
  });
});
