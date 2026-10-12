import { fireEvent, render } from '@testing-library/react';
import { useRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { useDismissible } from './useDismissible';
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

const DismissibleProbe = () => {
  const { open, setOpen, close, ref, triggerRef } = useDismissible<HTMLDivElement>();

  return (
    <>
      <div ref={ref}>
        <button type="button" ref={triggerRef} onClick={() => setOpen(true)}>
          open
        </button>
        {open && (
          <button type="button" onClick={close}>
            done
          </button>
        )}
      </div>
      <button type="button">elsewhere</button>
    </>
  );
};

describe('useDismissible', () => {
  it('closes on Escape and returns focus to the trigger', () => {
    const { getByText, queryByText } = render(<DismissibleProbe />);

    fireEvent.click(getByText('open'));
    getByText('done').focus();
    fireEvent.keyDown(document, { key: 'Escape' });

    expect(queryByText('done')).toBeNull();
    expect(getByText('open')).toHaveFocus();
  });

  it('returns focus to the trigger when the popup closes itself', () => {
    const { getByText, queryByText } = render(<DismissibleProbe />);

    fireEvent.click(getByText('open'));
    fireEvent.click(getByText('done'));

    expect(queryByText('done')).toBeNull();
    expect(getByText('open')).toHaveFocus();
  });

  it('leaves focus alone when closed by an outside click', () => {
    const { getByText, queryByText } = render(<DismissibleProbe />);

    fireEvent.click(getByText('open'));
    getByText('elsewhere').focus();
    fireEvent.mouseDown(getByText('elsewhere'));

    expect(queryByText('done')).toBeNull();
    expect(getByText('elsewhere')).toHaveFocus();
  });
});
