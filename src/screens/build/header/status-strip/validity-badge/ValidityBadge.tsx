import { countOf } from "@/core/lib/quantities";
import { useArmyStore } from "@/store/useArmyStore";
import { scrollToUnit } from "../../../shared/scrollToUnit";
import styles from "./ValidityBadge.module.css";

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

  // Jump to the first invalid unit shown in "Army Composition" (a used unit).
  const isUsed = (unitId: string) => units[unitId]?.number > 0;
  const firstTarget = errors.flatMap((error) => error.targets).find(isUsed);
  const issueLabel = countOf(errors.length, "issue");

  const goToFirstError = () => {
    if (!firstTarget) {
      return;
    }

    scrollToUnit(firstTarget);
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
