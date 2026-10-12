import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useArmyStore } from '@/store/useArmyStore';
import { Spells } from './Spells';

const renderSpells = () => render(<Spells />);

describe('Spells print section', () => {
  beforeEach(() => {
    useArmyStore.getState().reset();
  });

  it('renders each spell as a single header line with roll and range', () => {
    useArmyStore.getState().setArmy('goblin');
    renderSpells();
    // Header lines combine name, cast roll, and range on one line.
    const headers = screen.getAllByText(/· \d+\+ to cast · Range /);

    expect(headers.length).toBeGreaterThan(0);
  });

  it('does not render the italic flavor line as emphasized text', () => {
    useArmyStore.getState().setArmy('goblin');
    const { container } = renderSpells();
    // The leading `*...*` flavor line would render as <em>; it must be stripped.
    expect(container.querySelector('em')).toBeNull();
  });
});
