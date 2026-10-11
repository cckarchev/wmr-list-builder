import { useArmyStore } from '@/store/useArmyStore';
import { unitDomId } from '../../../shared/domIds';
import styles from './ValidityBadge.module.css';

const SCROLL_TO_UNIT: ScrollIntoViewOptions = { behavior: 'smooth', block: 'center' };

/** "Valid", or the issue count as a button that jumps to the first bad unit. */
export const ValidityBadge = () => {
  const units = useArmyStore((s) => s.units);
  const errors = useArmyStore((s) => s.errors);

  if (errors.length === 0) {
    return (
      <span className={styles.valid} data-testid="valid-indicator">
        Valid
      </span>
    );
  }

  // Jump to the first invalid unit shown in "Your Army" (a used unit).
  const isUsed = (unitId: string) => units[unitId]?.number > 0;
  const firstTarget = errors.flatMap((error) => error.targets).find(isUsed);
  const plural = errors.length === 1 ? '' : 's';
  const issueLabel = `${errors.length} issue${plural}`;

  const goToFirstError = () => {
    if (!firstTarget) {
      return;
    }

    const target = document.getElementById(unitDomId(firstTarget));

    target?.scrollIntoView(SCROLL_TO_UNIT);
  };

  return (
    <button
      className={styles.invalid}
      type="button"
      onClick={goToFirstError}
      data-testid="invalid-indicator"
      aria-label={`${issueLabel}, go to first`}
    >
      {issueLabel}
    </button>
  );
};
