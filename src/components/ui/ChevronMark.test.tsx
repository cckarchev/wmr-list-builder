import { describe, it, expect } from 'vitest';
import { renderWithTheme } from '../../test/renderWithProviders';
import ChevronMark from './ChevronMark';

describe('ChevronMark', () => {
  it('renders an aria-hidden svg containing a path', () => {
    const { container } = renderWithTheme(<ChevronMark />);
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelector('path')).not.toBeNull();
  });

  it('applies the given size to the svg', () => {
    const { container } = renderWithTheme(<ChevronMark size={20} />);
    const svg = container.querySelector('svg')!;
    expect(svg).toHaveAttribute('width', '20');
    expect(svg).toHaveAttribute('height', '20');
  });

  it('applies an explicit stroke color to the path', () => {
    const { container } = renderWithTheme(<ChevronMark color="#ff0000" />);
    expect(container.querySelector('path')).toHaveAttribute('stroke', '#ff0000');
  });
});
