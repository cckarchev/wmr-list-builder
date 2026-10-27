import { Icon, INLINE_ICON_SIZE } from "@/components/Icon";
import styles from "./SavedListItem.module.css";

interface SavedListItemProps {
  name: string;
  gameSize: number;
  onLoad: (name: string) => void;
  onDelete: (name: string) => void;
}

/** One saved list in the Load panel: load it by name, or delete it. */
export const SavedListItem = ({
  name,
  gameSize,
  onLoad,
  onDelete,
}: SavedListItemProps) => (
  <div className={styles.item}>
    <div className={styles.row}>
      <button
        className={styles.name}
        type="button"
        onClick={() => onLoad(name)}
      >
        <span className={styles.title}>{name}</span>
        <span className={styles.size} aria-hidden="true">
          {gameSize} pts
        </span>
      </button>
      <button
        className={styles.delete}
        type="button"
        aria-label={`delete ${name}`}
        onClick={() => onDelete(name)}
      >
        <Icon name="trash" size={INLINE_ICON_SIZE} />
      </button>
    </div>
  </div>
);
