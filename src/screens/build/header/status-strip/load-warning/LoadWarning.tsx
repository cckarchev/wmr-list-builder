import { useArmyStore } from "@/store/useArmyStore";
import styles from "./LoadWarning.module.css";

/** Dismissible notice shown when a list could not be restored. */
export const LoadWarning = () => {
  const loadWarning = useArmyStore((s) => s.loadWarning);
  const setLoadWarning = useArmyStore((s) => s.setLoadWarning);

  if (!loadWarning) {
    return null;
  }

  const dismiss = () => {
    setLoadWarning(null);
  };

  return (
    <div className={styles.warning} role="alert">
      {loadWarning}
      <button
        className={styles.dismiss}
        type="button"
        aria-label="Dismiss warning"
        onClick={dismiss}
      >
        ✕
      </button>
    </div>
  );
};
