import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../test/renderWithProviders';
import CopyShareLinkButton from './CopyShareLinkButton';
import { useArmyStore } from '../../store/useArmyStore';

describe('CopyShareLinkButton', () => {
  beforeEach(() => useArmyStore.getState().reset());

  it('copies a standalone link with the encoded list', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    useArmyStore.getState().setArmy('empire');

    renderWithProviders(<CopyShareLinkButton />);
    await userEvent.click(screen.getByRole('button', { name: /share/i }));

    expect(writeText).toHaveBeenCalledWith(expect.stringMatching(/\/build\/empire\?list=.+/));
  });
});
