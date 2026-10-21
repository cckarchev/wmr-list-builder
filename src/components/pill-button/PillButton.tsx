import type { ComponentPropsWithRef } from "react";
import { classNames } from "@/core/lib/classNames";
import styles from "./PillButton.module.css";

type PillButtonProps = ComponentPropsWithRef<"button">;

/** Small outlined action control, used for popover triggers and disclosures. */
export const PillButton = ({
  className,
  type = "button",
  ...props
}: PillButtonProps) => {
  const classes = classNames(styles.pill, className);

  return <button className={classes} type={type} {...props} />;
};
