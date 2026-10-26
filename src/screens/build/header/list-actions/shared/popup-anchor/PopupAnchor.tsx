import type { ComponentPropsWithRef } from "react";
import styles from "./PopupAnchor.module.css";

type PopupAnchorProps = ComponentPropsWithRef<"span">;

/**
 * Wraps a list action so its popup or feedback bubble can sit right below it.
 */
export const PopupAnchor = (props: PopupAnchorProps) => (
  <span className={styles.anchor} {...props} />
);
