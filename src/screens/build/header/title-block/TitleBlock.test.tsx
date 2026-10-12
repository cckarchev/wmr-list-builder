import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useArmyStore } from '@/store/useArmyStore';
import { TitleBlock } from './TitleBlock';

beforeEach(() => {
  useArmyStore.getState().reset();
});

describe('TitleBlock', () => {
  it('shows the faction emblem beside the army name', () => {
    useArmyStore.getState().setArmy('goblin');

    const { container } = render(<TitleBlock />);

    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('shows no emblem before an army is chosen', () => {
    const { container } = render(<TitleBlock />);

    expect(container.querySelector('svg')).not.toBeInTheDocument();
  });
});
