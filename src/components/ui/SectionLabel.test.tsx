import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithTheme } from '../../test/renderWithProviders';
import SectionLabel from './SectionLabel';

describe('SectionLabel', () => {
  it('renders the label text', () => {
    renderWithTheme(<SectionLabel label="Choose your army" />);
    expect(screen.getByText('Choose your army')).toBeInTheDocument();
  });

  it('prefixes the number when provided', () => {
    renderWithTheme(<SectionLabel label="Roster" number="01" />);
    expect(screen.getByText('01: Roster')).toBeInTheDocument();
  });

  it('renders a chevron mark alongside the label', () => {
    const { container } = renderWithTheme(<SectionLabel label="Anything" />);
    expect(container.querySelector('svg')).not.toBeNull();
  });
});
