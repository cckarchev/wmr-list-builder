import '@testing-library/jest-dom/vitest';

// jsdom has no ResizeObserver; stub it so components that observe element size
// (e.g. the Build screen measuring its sticky header) render in tests.
if (!('ResizeObserver' in globalThis)) {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}
