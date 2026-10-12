import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '@/test/renderWithProviders';
import { OverflowMenu } from './OverflowMenu';

const renderMenu = () =>
  renderWithProviders(
    <OverflowMenu>
      <button type="button">Child Action</button>
    </OverflowMenu>,
  );

describe('OverflowMenu', () => {
  it('toggles open and shows its children in a panel', async () => {
    const user = userEvent.setup();
    renderMenu();
    const trigger = screen.getByRole('button', { name: /more/i });

    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await user.click(trigger);

    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('group', { name: /more list actions/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Child Action' })).toBeInTheDocument();
  });

  it('closes on Escape and returns focus to the trigger', async () => {
    const user = userEvent.setup();
    renderMenu();
    const trigger = screen.getByRole('button', { name: /more/i });
    await user.click(trigger);
    await user.click(screen.getByRole('button', { name: 'Child Action' }));

    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    await user.keyboard('{Escape}');

    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveFocus();
  });

  it('closes when clicking outside', async () => {
    const user = userEvent.setup();
    renderMenu();
    const trigger = screen.getByRole('button', { name: /more/i });
    await user.click(trigger);

    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    await user.click(document.body);

    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });
});
