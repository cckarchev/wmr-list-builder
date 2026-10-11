import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithTheme } from '../../test/renderWithProviders';
import Button from './Button';

describe('Button', () => {
  it('renders a danger variant as a button', () => {
    renderWithTheme(<Button $variant="danger">Reset</Button>);
    expect(screen.getByRole('button', { name: 'Reset' })).toBeInTheDocument();
  });
});
