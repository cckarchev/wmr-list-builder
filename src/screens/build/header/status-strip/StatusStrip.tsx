import {
  breakPoint,
  pointsCost,
  unitCount,
} from "@/core/army-state/armyTotals";
import { globalErrors } from "@/core/validation/errorTargets";
import { useArmyStore } from "@/store/useArmyStore";
import { GameSizeStepper } from "./game-size-stepper/GameSizeStepper";
import { LoadWarning } from "./load-warning/LoadWarning";
import styles from "./StatusStrip.module.css";
import { Stat } from "./stat/Stat";
import { ValidityBadge } from "./validity-badge/ValidityBadge";

/** Game size, list totals, validity and list-wide messages. */
export const StatusStrip = () => {
  const units = useArmyStore((s) => s.units);
  const errors = useArmyStore((s) => s.errors);
  const gameSize = useArmyStore((s) => s.gameSize);

  const total = pointsCost({ units });
  const isOver = total > gameSize;

  return (
    <div className={styles.strip}>
      <GameSizeStepper />
      <Stat label="Points" value={total} over={isOver} testId="points-total" />
      <Stat label="Units" value={unitCount(units)} />
      <Stat label="Break" value={breakPoint(units)} testId="break-point" />
      <ValidityBadge />
      {globalErrors(errors).map((error) => (
        <p className={styles.globalError} key={error.message}>
          {error.message}
        </p>
      ))}
      <LoadWarning />
    </div>
  );
};
