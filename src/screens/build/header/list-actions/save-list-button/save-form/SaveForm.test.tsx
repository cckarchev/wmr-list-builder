import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SaveForm } from './SaveForm';

describe('SaveForm', () => {
  it('warns that lists are kept only in this browser', () => {
    render(<SaveForm name="My List" error={null} onNameChange={vi.fn()} onSave={vi.fn()} />);

    expect(screen.getByLabelText(/list name/i)).toHaveAccessibleDescription(
      /only in this browser/i,
    );
  });
});
