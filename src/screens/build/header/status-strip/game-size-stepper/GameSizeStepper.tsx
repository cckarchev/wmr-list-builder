import type { ChangeEvent } from 'react';
import { useArmyStore } from '@/store/useArmyStore';
import styles from './GameSizeStepper.module.css';

// Game size is adjusted in fixed point increments; the −/+ buttons step by
// this much, matching the native input's `step`.
const GAME_SIZE_STEP = 500;

const INPUT_ID = 'game-size';

export const GameSizeStepper = () => {
  const gameSize = useArmyStore((s) => s.gameSize);
  const setGameSize = useArmyStore((s) => s.setGameSize);

  const decrease = () => {
    setGameSize(gameSize - GAME_SIZE_STEP);
  };

  const increase = () => {
    setGameSize(gameSize + GAME_SIZE_STEP);
  };

  const handleInput = (event: ChangeEvent<HTMLInputElement>) => {
    setGameSize(event.target.valueAsNumber);
  };

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={INPUT_ID}>
        Game Size
      </label>
      <div className={styles.stepper}>
        <button
          className={styles.step}
          type="button"
          aria-label="decrease game size"
          disabled={gameSize <= 0}
          onClick={decrease}
        >
          −
        </button>
        <input
          className={styles.input}
          id={INPUT_ID}
          data-testid="game-size"
          type="number"
          min={0}
          step={GAME_SIZE_STEP}
          value={gameSize}
          onChange={handleInput}
        />
        <button
          className={styles.step}
          type="button"
          aria-label="increase game size"
          onClick={increase}
        >
          +
        </button>
      </div>
    </div>
  );
};
