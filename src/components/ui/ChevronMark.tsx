import { useTheme } from 'styled-components';

interface ChevronMarkProps {
  color?: string;
  size?: number;
  strokeWidth?: number;
}

export default function ChevronMark({ color, size = 14, strokeWidth = 2.4 }: ChevronMarkProps) {
  const theme = useTheme();
  const stroke = color ?? theme.color.tealBright;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}
      aria-hidden="true"
    >
      <path d="M5 2 L11 8 L5 14" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="square" />
    </svg>
  );
}
