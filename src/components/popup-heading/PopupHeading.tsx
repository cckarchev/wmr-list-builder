import { Icon, INLINE_ICON_SIZE } from "@/components/Icon";
import styles from "./PopupHeading.module.css";

interface PopupHeadingProps {
  /** Visible title of the popup. */
  children: string;
  onClose: () => void;
}

/**
 * The title bar at the top of a popup, with a close button on the right. Tapping
 * outside or pressing Escape also closes a popup, but neither is obvious on a
 * phone, so the button makes the way out visible.
 */
export const PopupHeading = ({ children, onClose }: PopupHeadingProps) => (
  <div className={styles.bar}>
    <p className={styles.title}>{children}</p>
    <button
      className={styles.close}
      type="button"
      aria-label="Close"
      onClick={onClose}
    >
      <Icon name="close" size={INLINE_ICON_SIZE} />
    </button>
  </div>
);
