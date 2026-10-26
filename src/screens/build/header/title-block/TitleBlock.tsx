import { FactionIcon } from "@/components/faction-icon/FactionIcon";
import { hasFactionIcon } from "@/components/faction-icon/factionIcons";
import { useArmyStore } from "@/store/useArmyStore";
import { useIsDirty } from "@/store/useIsDirty";
import styles from "./TitleBlock.module.css";

/**
 * The faction emblem and army name, with the saved list's name and its unsaved
 * marker below.
 */
export const TitleBlock = () => {
  const army = useArmyStore((s) => s.army);
  const armyId = useArmyStore((s) => s.armyId);
  const listName = useArmyStore((s) => s.label);
  const isDirty = useIsDirty();

  const hasArmy = armyId !== null;
  const showEmblem = hasArmy && hasFactionIcon(armyId);

  return (
    <div className={styles.block}>
      {showEmblem && (
        <span className={styles.emblem}>
          <FactionIcon armyId={armyId} />
        </span>
      )}
      <div className={styles.text}>
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
    </div>
  );
};
