import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// jsdom has no ResizeObserver; stub it so components that observe element size
// (e.g. the Build screen measuring its sticky header) render in tests.
if (!('ResizeObserver' in globalThis)) {
  globalThis.ResizeObserver = class {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
  };
}
