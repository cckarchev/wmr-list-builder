import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { initEmbed } from '../../store/embed';
import { useArmyStore } from '../../store/useArmyStore';
import { renderWithProviders } from '../../test/renderWithProviders';
import CopyShareLinkButton from './CopyShareLinkButton';

describe('CopyShareLinkButton', () => {
  beforeEach(() => {
    useArmyStore.getState().reset();
    initEmbed(''); // default: not embedded
  });

  it('copies a standalone link with the encoded list', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    useArmyStore.getState().setArmy('empire');

    renderWithProviders(<CopyShareLinkButton />);
    await userEvent.click(screen.getByRole('button', { name: /share/i }));

    expect(writeText).toHaveBeenCalledWith(expect.stringMatching(/\/build\/empire\?list=.+/));
  });

  it('copies a cckarchev link when embedded', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    initEmbed(
      `?embed=${encodeURIComponent('https://www.cckarchev.ar/juegos/warmaster/list-builder/')}`,
    );
    useArmyStore.getState().setArmy('empire');

    renderWithProviders(<CopyShareLinkButton />);
    await userEvent.click(screen.getByRole('button', { name: /share/i }));

    const url = writeText.mock.calls[0][0] as string;
    const parsed = new URL(url);
    expect(parsed.origin + parsed.pathname).toBe(
      'https://www.cckarchev.ar/juegos/warmaster/list-builder/',
    );
    expect(parsed.searchParams.get('army')).toBe('empire');
    expect(parsed.searchParams.get('list')).toBeTruthy();
  });
});
