import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ConfirmDialog } from './ConfirmDialog';

const baseProps = {
  title: 'Reset army?',
  message: 'All units will be cleared.',
  onConfirm: vi.fn(),
  onCancel: vi.fn(),
};

describe('ConfirmDialog', () => {
  it('renders nothing when closed', () => {
    render(<ConfirmDialog open={false} {...baseProps} />);

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('shows the title and message when open', () => {
    render(<ConfirmDialog open {...baseProps} />);

    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    expect(screen.getByText('Reset army?')).toBeInTheDocument();
    expect(screen.getByText('All units will be cleared.')).toBeInTheDocument();
  });

  it('fires onConfirm when the confirm button is clicked', async () => {
    const onConfirm = vi.fn();
    const user = userEvent.setup();
    render(<ConfirmDialog open {...baseProps} onConfirm={onConfirm} confirmLabel="Reset" />);
    await user.click(screen.getByRole('button', { name: /reset/i }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('fires onCancel when the cancel button is clicked', async () => {
    const onCancel = vi.fn();
    const user = userEvent.setup();
    render(<ConfirmDialog open {...baseProps} onCancel={onCancel} />);
    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('cancels on Escape', async () => {
    const onCancel = vi.fn();
    const user = userEvent.setup();
    render(<ConfirmDialog open {...baseProps} onCancel={onCancel} />);
    await user.keyboard('{Escape}');

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('cancels on backdrop click but not on card click', () => {
    const onCancel = vi.fn();
    render(<ConfirmDialog open {...baseProps} onCancel={onCancel} />);
    const card = screen.getByRole('alertdialog');
    fireEvent.click(card);

    expect(onCancel).not.toHaveBeenCalled();

    fireEvent.click(card.parentElement as HTMLElement);

    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});

describe('ConfirmDialog focus', () => {
  it('keeps Tab and Shift+Tab inside the dialog', async () => {
    const user = userEvent.setup();
    render(<ConfirmDialog open {...baseProps} confirmLabel="Reset" />);
    const cancel = screen.getByRole('button', { name: /cancel/i });
    const confirm = screen.getByRole('button', { name: /reset/i });

    expect(confirm).toHaveFocus();

    await user.tab();

    expect(cancel).toHaveFocus();

    await user.tab({ shift: true });

    expect(confirm).toHaveFocus();
  });

  it('returns focus to what had it before opening', () => {
    const Host = ({ open }: { open: boolean }) => (
      <>
        <button type="button">opener</button>
        <ConfirmDialog open={open} {...baseProps} />
      </>
    );
    const { rerender } = render(<Host open={false} />);
    const opener = screen.getByRole('button', { name: 'opener' });
    opener.focus();

    rerender(<Host open />);

    expect(opener).not.toHaveFocus();

    rerender(<Host open={false} />);

    expect(opener).toHaveFocus();
  });
});
