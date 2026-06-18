import { type ReactElement } from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { MemoryRouter, type MemoryRouterProps } from 'react-router-dom';
import { theme } from '../theme/theme';

interface RenderWithProvidersOptions extends Omit<RenderOptions, 'wrapper'> {
  routerProps?: MemoryRouterProps;
}

export function renderWithProviders(
  ui: ReactElement,
  { routerProps, ...options }: RenderWithProvidersOptions = {},
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <ThemeProvider theme={theme}>
        <MemoryRouter {...routerProps}>{children}</MemoryRouter>
      </ThemeProvider>
    );
  }
  return render(ui, { wrapper: Wrapper, ...options });
}

/** Wrap with ThemeProvider only (no router). */
export function renderWithTheme(ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
  }
  return render(ui, { wrapper: Wrapper, ...options });
}
