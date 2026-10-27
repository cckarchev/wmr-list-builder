import type { ComponentPropsWithRef } from "react";
import { Link, type LinkProps } from "react-router-dom";
import { classNames } from "@/core/lib/classNames";
import styles from "./Button.module.css";

type ButtonVariant = "primary" | "ghost" | "danger";

/** 'sm' is the compact size used for inline action rows. */
type ButtonSize = "md" | "sm";

interface ButtonStyleProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

type ButtonProps = ButtonStyleProps & ComponentPropsWithRef<"button">;

type ButtonLinkProps = ButtonStyleProps & LinkProps;

/**
 * Defaults to type="button", so a Button inside a form never submits it by
 * accident.
 */
export const Button = ({
  variant = "primary",
  size = "md",
  type = "button",
  className,
  ...props
}: ButtonProps) => {
  const classes = classNames(styles.button, className);

  return (
    <button
      className={classes}
      type={type}
      data-variant={variant}
      data-size={size}
      {...props}
    />
  );
};

/** A router link styled as a Button, for actions that navigate. */
export const ButtonLink = ({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonLinkProps) => {
  const classes = classNames(styles.button, className);

  return (
    <Link
      className={classes}
      data-variant={variant}
      data-size={size}
      {...props}
    />
  );
};
