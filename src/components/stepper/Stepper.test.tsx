import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Stepper } from './Stepper';

/** A Stepper that holds its own value, so a press re-renders it like a real caller. */
const LiveStepper = ({ start, min, max }: { start: number; min?: number; max?: number }) => {
  const [value, setValue] = useState(start);

  return <Stepper value={value} onChange={setValue} min={min} max={max} label="Trolls" />;
};

describe('Stepper', () => {
  it('calls onChange with value + 1 when + is clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const value = 3;
    render(<Stepper value={value} onChange={onChange} label="Goblins" />);
    await user.click(screen.getByRole('button', { name: 'increase Goblins' }));

    expect(onChange).toHaveBeenCalledWith(value + 1);
  });

  it('calls onChange with value - 1 when − is clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Stepper value={3} onChange={onChange} label="Goblins" />);
    await user.click(screen.getByRole('button', { name: 'decrease Goblins' }));

    expect(onChange).toHaveBeenCalledWith(2);
  });

  it('disables the + button when value equals max', () => {
    const onChange = vi.fn();
    render(<Stepper value={4} onChange={onChange} max={4} label="Trolls" />);

    expect(screen.getByRole('button', { name: 'increase Trolls' })).toBeDisabled();
  });

  it('does not disable the − button when value equals max', () => {
    const onChange = vi.fn();
    render(<Stepper value={4} onChange={onChange} max={4} label="Trolls" />);

    expect(screen.getByRole('button', { name: 'decrease Trolls' })).not.toBeDisabled();
  });

  it('disables the − button when value equals min', () => {
    const onChange = vi.fn();
    render(<Stepper value={0} onChange={onChange} min={0} label="Trolls" />);

    expect(screen.getByRole('button', { name: 'decrease Trolls' })).toBeDisabled();
  });

  it('does not disable the + button when value equals min', () => {
    const onChange = vi.fn();
    render(<Stepper value={0} onChange={onChange} min={0} label="Trolls" />);

    expect(screen.getByRole('button', { name: 'increase Trolls' })).not.toBeDisabled();
  });
});

describe('Stepper maxed hint', () => {
  it('explains a spent + with the maxed hint, in a tooltip and as its description', () => {
    render(
      <Stepper value={4} onChange={vi.fn()} max={4} maxedHint="Taken by Ogres" label="Trolls" />,
    );

    expect(screen.getByRole('tooltip', { name: 'Taken by Ogres' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'increase Trolls' })).toHaveAccessibleDescription(
      'Taken by Ogres',
    );
  });

  it('keeps the maxed hint out while the + can still be pressed', () => {
    render(
      <Stepper value={3} onChange={vi.fn()} max={4} maxedHint="Taken by Ogres" label="Trolls" />,
    );

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });
});

describe('Stepper focus', () => {
  it('hands focus to − when + reaches the max, so the keyboard keeps its place', async () => {
    const user = userEvent.setup();
    render(<LiveStepper start={3} max={4} />);

    await user.click(screen.getByRole('button', { name: 'increase Trolls' }));

    expect(screen.getByRole('button', { name: 'decrease Trolls' })).toHaveFocus();
  });

  it('hands focus to + when − reaches the min', async () => {
    const user = userEvent.setup();
    render(<LiveStepper start={1} min={0} />);

    await user.click(screen.getByRole('button', { name: 'decrease Trolls' }));

    expect(screen.getByRole('button', { name: 'increase Trolls' })).toHaveFocus();
  });

  it('hands focus to the other button even when that one only enables with the new value', async () => {
    const user = userEvent.setup();
    render(<LiveStepper start={0} min={0} max={1} />);

    await user.click(screen.getByRole('button', { name: 'increase Trolls' }));

    expect(screen.getByRole('button', { name: 'decrease Trolls' })).toHaveFocus();

    await user.click(screen.getByRole('button', { name: 'decrease Trolls' }));

    expect(screen.getByRole('button', { name: 'increase Trolls' })).toHaveFocus();
  });
});
