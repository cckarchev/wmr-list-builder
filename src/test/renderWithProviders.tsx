import { type RenderOptions, render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { MemoryRouter, type MemoryRouterProps } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { theme } from '@/theme/theme';

interface RenderWithProvidersOptions extends Omit<RenderOptions, 'wrapper'> {
  routerProps?: MemoryRouterProps;
}

export const renderWithProviders = (
  ui: ReactElement,
  { routerProps, ...options }: RenderWithProvidersOptions = {},
) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <ThemeProvider theme={theme}>
      <MemoryRouter {...routerProps}>{children}</MemoryRouter>
    </ThemeProvider>
  );
  return render(ui, { wrapper: Wrapper, ...options });
};

/** Wrap with ThemeProvider only (no router). */
export const renderWithTheme = (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <ThemeProvider theme={theme}>{children}</ThemeProvider>
  );
  return render(ui, { wrapper: Wrapper, ...options });
};
