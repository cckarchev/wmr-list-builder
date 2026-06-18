import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithTheme } from '../../test/renderWithProviders';
import CornerBrackets from './CornerBrackets';

describe('CornerBrackets', () => {
  it('renders four corner spans', () => {
    renderWithTheme(<CornerBrackets />);
    expect(screen.getAllByTestId('corner-bracket')).toHaveLength(4);
  });

  it('positions each corner absolutely', () => {
    renderWithTheme(<CornerBrackets />);
    expect(screen.getAllByTestId('corner-bracket')[0]).toHaveStyle({ position: 'absolute' });
  });

  it('applies the given accent color', () => {
    renderWithTheme(<CornerBrackets accent="#ff0000" />);
    const first = screen.getAllByTestId('corner-bracket')[0];
    expect(first.getAttribute('style')).toContain('rgb(255, 0, 0)');
  });
});
