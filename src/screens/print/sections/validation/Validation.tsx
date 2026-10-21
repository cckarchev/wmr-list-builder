import { countOf, formatPoints } from "@/core/lib/quantities";
import { errorKey } from "@/core/validation/errorTargets";
import { useArmyStore } from "@/store/useArmyStore";
import { PrintHeading, PrintSection } from "../print-section/PrintSection";
import styles from "./Validation.module.css";

/** Whether the list is legal at its game size, and what is wrong when it is not. */
export const Validation = () => {
  const errors = useArmyStore((s) => s.errors);
  const gameSize = useArmyStore((s) => s.gameSize);

  const points = `${formatPoints(gameSize)} points`;

  if (errors.length === 0) {
    return (
      <PrintSection>
        <PrintHeading>Validation</PrintHeading>
        <p className={styles.summary}>The list is valid at {points}.</p>
      </PrintSection>
    );
  }

  return (
    <PrintSection>
      <PrintHeading>Validation</PrintHeading>
      <p className={styles.summary}>
        {countOf(errors.length, "issue")} at {points}:
      </p>
      <ul className={styles.issues}>
        {errors.map((error) => (
          <li key={errorKey(error)}>{error.message}</li>
        ))}
      </ul>
    </PrintSection>
  );
};
