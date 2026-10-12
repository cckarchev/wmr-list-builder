import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { initEmbed } from '@/core/share-link/embed';
import { WMR_EDITION } from '@/data/wmrEdition';
import { renderWithProviders } from '@/test/renderWithProviders';
import { Footer } from './Footer';

const EMBED_SEARCH = `?embed=${encodeURIComponent('https://cckarchev.ar/warmaster')}`;

beforeEach(() => {
  initEmbed('');
});

describe('Footer', () => {
  it('names the rules edition the army lists follow', () => {
    renderWithProviders(<Footer />);

    const footer = screen.getByRole('contentinfo');

    expect(footer).toHaveTextContent(`Compendium ${WMR_EDITION.compendiumVersion}`);
    expect(footer).toHaveTextContent(`Armies ${WMR_EDITION.armiesVersion}`);
  });

  it('links to the About page', () => {
    renderWithProviders(<Footer />);

    expect(screen.getByRole('link', { name: 'About' })).toHaveAttribute('href', '/about');
  });

  it('opens About in place when the builder is not embedded', () => {
    renderWithProviders(<Footer />);

    expect(screen.getByRole('link', { name: 'About' })).not.toHaveAttribute('target');
  });

  it('opens About in a new tab when embedded, so the build stays put', () => {
    initEmbed(EMBED_SEARCH);
    renderWithProviders(<Footer />);

    const link = screen.getByRole('link', { name: 'About' });

    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noreferrer');
    expect(link).toHaveAccessibleDescription('Opens in a new tab');
  });

  it('says the tool is unofficial', () => {
    renderWithProviders(<Footer />);

    expect(screen.getByRole('contentinfo')).toHaveTextContent('not endorsed by Games Workshop');
  });

  it('is left off the printed page', () => {
    renderWithProviders(<Footer />);

    expect(screen.getByRole('contentinfo')).toHaveClass('no-print');
  });
});
