import { type RenderOptions, render } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import { MemoryRouter, type MemoryRouterProps } from 'react-router-dom';

interface RenderWithProvidersOptions extends Omit<RenderOptions, 'wrapper'> {
  routerProps?: MemoryRouterProps;
}

/** Renders inside a MemoryRouter, for components that use router hooks or links. */
export const renderWithProviders = (
  ui: ReactElement,
  { routerProps, ...options }: RenderWithProvidersOptions = {},
) => {
  // biome-ignore lint/correctness/noComponentHookFactories: RTL reuses this wrapper across rerenders, so state survives.
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <MemoryRouter {...routerProps}>{children}</MemoryRouter>
  );

  return render(ui, { wrapper: Wrapper, ...options });
};
