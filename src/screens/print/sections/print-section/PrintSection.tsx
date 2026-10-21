import type { ReactNode } from "react";
import { classNames } from "@/core/lib/classNames";
import styles from "./PrintSection.module.css";

// Shared building blocks for the print-sheet sections (Army Rules, Special
// Rules, Magic Items, Spells).

interface BlockProps {
  children: ReactNode;
}

interface StyledBlockProps extends BlockProps {
  className?: string;
}

/** Outer block for a print sheet section. */
export const PrintSection = ({ children }: BlockProps) => (
  <div className={styles.section}>{children}</div>
);

/** Centered section title. */
export const PrintHeading = ({ children }: BlockProps) => (
  <h3 className={styles.heading}>{children}</h3>
);

/** Definition list of name/description entries. */
export const DefList = ({ children }: BlockProps) => (
  <dl className={styles.list}>{children}</dl>
);

/** Definition term (entry name). */
export const DefTerm = ({ children }: BlockProps) => (
  <dt className={styles.term}>{children}</dt>
);

/** Definition description (entry body). */
export const DefDesc = ({ className, children }: StyledBlockProps) => (
  <dd className={classNames(styles.desc, className)}>{children}</dd>
);
