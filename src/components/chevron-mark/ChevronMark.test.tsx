import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { defined } from '@/test/defined';
import { ChevronMark } from './ChevronMark';

const SIZE = 20;

describe('ChevronMark', () => {
  it('renders an aria-hidden svg containing a path', () => {
    const { container } = render(<ChevronMark size={SIZE} />);
    const svg = container.querySelector('svg');

    expect(svg).not.toBeNull();
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelector('path')).not.toBeNull();
  });

  it('applies the given size to the svg', () => {
    const { container } = render(<ChevronMark size={SIZE} />);
    const svg = defined(container.querySelector('svg'), 'svg');

    expect(svg).toHaveAttribute('width', String(SIZE));
    expect(svg).toHaveAttribute('height', String(SIZE));
  });

  it('applies an explicit stroke color to the path', () => {
    const { container } = render(<ChevronMark size={SIZE} color="#ff0000" />);

    expect(container.querySelector('path')).toHaveAttribute('stroke', '#ff0000');
  });
});
