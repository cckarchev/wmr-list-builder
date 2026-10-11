import styles from './ChevronMark.module.css';

interface ChevronMarkProps {
  /** Stroke color. Defaults to the bright teal set in the stylesheet. */
  color?: string;
  size?: number;
  strokeWidth?: number;
}

export const ChevronMark = ({ color, size = 14, strokeWidth = 2.4 }: ChevronMarkProps) => {
  const stroke = color ?? 'currentColor';
  // An explicit color also overrides the class color, so 'currentColor' inherits.
  const style = color ? { color } : undefined;

  return (
    <svg
      className={styles.chevron}
      style={style}
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path d="M5 2 L11 8 L5 14" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="square" />
    </svg>
  );
};
