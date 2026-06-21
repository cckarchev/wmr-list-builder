import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { theme } from '../../theme/theme';
import Spells from './Spells';
import { useArmyStore } from '../../store/useArmyStore';

function renderSpells() {
  return render(
    <ThemeProvider theme={theme}>
      <Spells />
    </ThemeProvider>,
  );
}

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
