import { fireEvent, render } from '@testing-library/react';
import { useRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { useEscapeKey } from './useEscapeKey';
import { useOutsideClick } from './useOutsideClick';

interface ProbeProps {
  active: boolean;
  onDismiss: () => void;
}

const OutsideProbe = ({ active, onDismiss }: ProbeProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useOutsideClick(ref, active, onDismiss);

  return (
    <div>
      <div ref={ref}>inside</div>
      <span>outside</span>
    </div>
  );
};

const EscapeProbe = ({ active, onDismiss }: ProbeProps) => {
  useEscapeKey(active, onDismiss);

  return <div>probe</div>;
};

describe('useOutsideClick', () => {
  it('calls the handler on a mousedown outside the element', () => {
    const onDismiss = vi.fn();
    const { getByText } = render(<OutsideProbe active onDismiss={onDismiss} />);

    fireEvent.mouseDown(getByText('outside'));

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('ignores a mousedown inside the element', () => {
    const onDismiss = vi.fn();
    const { getByText } = render(<OutsideProbe active onDismiss={onDismiss} />);

    fireEvent.mouseDown(getByText('inside'));

    expect(onDismiss).not.toHaveBeenCalled();
  });

  it('does nothing while inactive', () => {
    const onDismiss = vi.fn();
    const { getByText } = render(<OutsideProbe active={false} onDismiss={onDismiss} />);

    fireEvent.mouseDown(getByText('outside'));

    expect(onDismiss).not.toHaveBeenCalled();
  });
});

describe('useEscapeKey', () => {
  it('calls the handler when Escape is pressed', () => {
    const onDismiss = vi.fn();
    render(<EscapeProbe active onDismiss={onDismiss} />);

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('ignores other keys', () => {
    const onDismiss = vi.fn();
    render(<EscapeProbe active onDismiss={onDismiss} />);

    fireEvent.keyDown(document, { key: 'Enter' });

    expect(onDismiss).not.toHaveBeenCalled();
  });

  it('does nothing while inactive', () => {
    const onDismiss = vi.fn();
    render(<EscapeProbe active={false} onDismiss={onDismiss} />);

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onDismiss).not.toHaveBeenCalled();
  });
});
