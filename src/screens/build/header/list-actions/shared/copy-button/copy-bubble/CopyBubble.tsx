import type { ReactNode } from "react";
import styles from "./CopyBubble.module.css";

type CopyBubbleTone = "success" | "error";

interface CopyBubbleProps {
  /** Colors the message as a confirmation or as a failure. */
  tone: CopyBubbleTone;
  children: ReactNode;
}

/** Floating feedback, "copied" or "failed", shown under a copy action. */
export const CopyBubble = ({ tone, children }: CopyBubbleProps) => (
  <span className={styles.bubble} data-tone={tone}>
    {children}
  </span>
);
