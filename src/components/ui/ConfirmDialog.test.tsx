import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithTheme } from '../../test/renderWithProviders';
import ConfirmDialog from './ConfirmDialog';

const baseProps = {
  title: 'Reset army?',
  message: 'All units will be cleared.',
  onConfirm: vi.fn(),
  onCancel: vi.fn(),
};

describe('ConfirmDialog', () => {
  it('renders nothing when closed', () => {
    renderWithTheme(<ConfirmDialog open={false} {...baseProps} />);
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('shows the title and message when open', () => {
    renderWithTheme(<ConfirmDialog open {...baseProps} />);
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    expect(screen.getByText('Reset army?')).toBeInTheDocument();
    expect(screen.getByText('All units will be cleared.')).toBeInTheDocument();
  });

  it('fires onConfirm when the confirm button is clicked', async () => {
    const onConfirm = vi.fn();
    const user = userEvent.setup();
    renderWithTheme(
      <ConfirmDialog open {...baseProps} onConfirm={onConfirm} confirmLabel="Reset" />,
    );
    await user.click(screen.getByRole('button', { name: /reset/i }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('fires onCancel when the cancel button is clicked', async () => {
    const onCancel = vi.fn();
    const user = userEvent.setup();
    renderWithTheme(<ConfirmDialog open {...baseProps} onCancel={onCancel} />);
    await user.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('cancels on Escape', async () => {
    const onCancel = vi.fn();
    const user = userEvent.setup();
    renderWithTheme(<ConfirmDialog open {...baseProps} onCancel={onCancel} />);
    await user.keyboard('{Escape}');
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('cancels on backdrop click but not on card click', () => {
    const onCancel = vi.fn();
    renderWithTheme(<ConfirmDialog open {...baseProps} onCancel={onCancel} />);
    const card = screen.getByRole('alertdialog');
    fireEvent.click(card);
    expect(onCancel).not.toHaveBeenCalled();
    fireEvent.click(card.parentElement as HTMLElement);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
