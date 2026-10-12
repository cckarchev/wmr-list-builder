import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useCopyFeedback } from './useCopyFeedback';

/** Swap `navigator.clipboard` for the given stub, or remove it with `undefined`. */
const stubClipboard = (clipboard: { writeText: (text: string) => Promise<void> } | undefined) => {
  Object.defineProperty(navigator, 'clipboard', {
    value: clipboard,
    configurable: true,
    writable: true,
  });
};

afterEach(() => {
  vi.useRealTimers();
});

describe('useCopyFeedback', () => {
  it('starts idle', () => {
    const { result } = renderHook(() => useCopyFeedback());

    expect(result.current.status).toBe('idle');
  });

  it('reports copied once the clipboard write lands', async () => {
    stubClipboard({ writeText: vi.fn().mockResolvedValue(undefined) });
    const { result } = renderHook(() => useCopyFeedback());

    act(() => {
      result.current.copy('text');
    });

    await waitFor(() => {
      expect(result.current.status).toBe('copied');
    });
  });

  it('reports failed when the clipboard write is rejected', async () => {
    stubClipboard({ writeText: vi.fn().mockRejectedValue(new Error('denied')) });
    const { result } = renderHook(() => useCopyFeedback());

    act(() => {
      result.current.copy('text');
    });

    await waitFor(() => {
      expect(result.current.status).toBe('failed');
    });
  });

  it('reports failed when the clipboard is unavailable', async () => {
    stubClipboard(undefined);
    const { result } = renderHook(() => useCopyFeedback());

    act(() => {
      result.current.copy('text');
    });

    await waitFor(() => {
      expect(result.current.status).toBe('failed');
    });
  });

  it('returns to idle after the feedback has shown', async () => {
    vi.useFakeTimers();
    stubClipboard({ writeText: vi.fn().mockResolvedValue(undefined) });
    const { result } = renderHook(() => useCopyFeedback());

    await act(async () => {
      result.current.copy('text');
    });

    expect(result.current.status).toBe('copied');

    act(() => {
      vi.runAllTimers();
    });

    expect(result.current.status).toBe('idle');
  });
});
