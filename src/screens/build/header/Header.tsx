import { classNames } from '@/core/classNames';
import { breakPoint, globalErrors, pointsCost, unitCount } from '@/core/selectors';
import { useArmyStore } from '@/store/useArmyStore';
import { useIsDirty } from '@/store/useIsDirty';
import { unitDomId } from '../shared/unitDomId';
import { GameSizeStepper } from './game-size-stepper/GameSizeStepper';
import styles from './Header.module.css';
import { ListActions } from './list-actions/ListActions';

export const Header = () => {
  const army = useArmyStore((s) => s.army);
  const units = useArmyStore((s) => s.units);
  const errors = useArmyStore((s) => s.errors);
  const loadWarning = useArmyStore((s) => s.loadWarning);
  const setLoadWarning = useArmyStore((s) => s.setLoadWarning);
  const gameSize = useArmyStore((s) => s.gameSize);
  const listName = useArmyStore((s) => s.label);
  const isDirty = useIsDirty();

  const total = pointsCost({ units });
  const count = unitCount(units);
  const breaks = breakPoint(units);
  const isValid = errors.length === 0;
  const over = total > gameSize;
  const globals = globalErrors(errors);

  // Jump to the first invalid unit shown in "Your Army" (a used unit).
  const firstTarget = errors.flatMap((e) => e.targets).find((id) => units[id]?.number > 0);
  const issueLabel = `${errors.length} issue${errors.length === 1 ? '' : 's'}`;

  const goToFirstError = () => {
    if (!firstTarget) {
      return;
    }

    const target = document.getElementById(unitDomId(firstTarget));
    target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const dismissWarning = () => {
    setLoadWarning(null);
  };

  return (
    <header className={classNames(styles.bar, 'no-print')} data-testid="points-bar">
      <div className={styles.titleZone}>
        <div className={styles.titleBlock}>
          <h1 className={styles.armyName}>{army?.name}</h1>
          <span className={styles.listName}>
            {listName ? (
              <>
                <span className={styles.listNameText}>{listName}</span>
                {isDirty && (
                  <span
                    className={styles.unsavedDot}
                    data-testid="unsaved-marker"
                    role="img"
                    aria-label="unsaved changes"
                  >
                    •
                  </span>
                )}
              </>
            ) : (
              <span className={styles.placeholder}>Unsaved</span>
            )}
          </span>
        </div>
        <div className={styles.actions} data-layout="inline" data-testid="actions-inline">
          <ListActions />
        </div>
        <div className={styles.actions} data-layout="menu" data-testid="actions-menu">
          <ListActions />
        </div>
      </div>
      <div className={styles.strip}>
        <GameSizeStepper />
        <div className={styles.stat}>
          <span className={styles.statLabel}>Points</span>
          <span
            className={styles.statValue}
            data-over={over || undefined}
            data-testid="points-total"
          >
            {total}
          </span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Units</span>
          <span className={styles.statValue}>{count}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Break</span>
          <span className={styles.statValue} data-testid="break-point">
            {breaks}
          </span>
        </div>
        {isValid ? (
          <span className={styles.valid} data-testid="valid-indicator">
            Valid
          </span>
        ) : (
          <button
            className={styles.invalid}
            type="button"
            onClick={goToFirstError}
            data-testid="invalid-indicator"
            aria-label={`${issueLabel}, go to first`}
          >
            {issueLabel}
          </button>
        )}
        {globals.map((e) => (
          <p className={styles.globalError} key={e.message}>
            {e.message}
          </p>
        ))}
        {loadWarning && (
          <div className={styles.warning} role="alert">
            {loadWarning}
            <button
              className={styles.warningDismiss}
              type="button"
              aria-label="Dismiss warning"
              onClick={dismissWarning}
            >
              ✕
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
