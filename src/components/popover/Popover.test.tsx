import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { renderWithTheme } from '@/test/renderWithProviders';
import { Popover } from './Popover';

const setup = () =>
  renderWithTheme(
    <div>
      <Popover label="Goblins special rules" trigger="Rules">
        <p>Goblins are cowardly.</p>
      </Popover>
      <button type="button">outside</button>
    </div>,
  );

describe('Popover', () => {
  it('is closed initially', () => {
    setup();
    expect(screen.getByRole('button', { name: 'Goblins special rules' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens on click and shows its content', async () => {
    const user = userEvent.setup();
    setup();
    await user.click(screen.getByRole('button', { name: 'Goblins special rules' }));
    expect(screen.getByRole('dialog', { name: 'Goblins special rules' })).toBeInTheDocument();
    expect(screen.getByText('Goblins are cowardly.')).toBeInTheDocument();
  });

  it('closes on outside click', async () => {
    const user = userEvent.setup();
    setup();
    await user.click(screen.getByRole('button', { name: 'Goblins special rules' }));
    await user.click(screen.getByRole('button', { name: 'outside' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('closes on Escape', async () => {
    const user = userEvent.setup();
    setup();
    await user.click(screen.getByRole('button', { name: 'Goblins special rules' }));
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
