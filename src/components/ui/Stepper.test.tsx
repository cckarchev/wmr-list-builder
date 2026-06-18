import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Stepper from './Stepper';
import { renderWithTheme } from '../../test/renderWithProviders';

describe('Stepper', () => {
  it('calls onChange with value + 1 when + is clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderWithTheme(<Stepper value={3} onChange={onChange} label="Goblins" />);
    await user.click(screen.getByRole('button', { name: 'increase Goblins' }));
    expect(onChange).toHaveBeenCalledWith(4);
  });

  it('calls onChange with value - 1 when − is clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderWithTheme(<Stepper value={3} onChange={onChange} label="Goblins" />);
    await user.click(screen.getByRole('button', { name: 'decrease Goblins' }));
    expect(onChange).toHaveBeenCalledWith(2);
  });

  it('disables the + button when value equals max', () => {
    const onChange = vi.fn();
    renderWithTheme(<Stepper value={4} onChange={onChange} max={4} label="Trolls" />);
    expect(screen.getByRole('button', { name: 'increase Trolls' })).toBeDisabled();
  });

  it('does not disable the − button when value equals max', () => {
    const onChange = vi.fn();
    renderWithTheme(<Stepper value={4} onChange={onChange} max={4} label="Trolls" />);
    expect(screen.getByRole('button', { name: 'decrease Trolls' })).not.toBeDisabled();
  });

  it('disables the − button when value equals min', () => {
    const onChange = vi.fn();
    renderWithTheme(<Stepper value={0} onChange={onChange} min={0} label="Trolls" />);
    expect(screen.getByRole('button', { name: 'decrease Trolls' })).toBeDisabled();
  });

  it('does not disable the + button when value equals min', () => {
    const onChange = vi.fn();
    renderWithTheme(<Stepper value={0} onChange={onChange} min={0} label="Trolls" />);
    expect(screen.getByRole('button', { name: 'increase Trolls' })).not.toBeDisabled();
  });
});
