import type { CSSProperties } from 'react';
import { useTheme } from 'styled-components';

interface CornerBracketsProps {
  accent?: string;
  size?: number;
  thickness?: number;
  inset?: number;
}

export default function CornerBrackets({
  accent,
  size = 14,
  thickness = 2,
  inset = -1,
}: CornerBracketsProps) {
  const theme = useTheme();
  const color = accent ?? theme.color.tealBright;
  const base: CSSProperties = {
    position: 'absolute',
    width: size,
    height: size,
    pointerEvents: 'none',
  };
  const line = `${thickness}px solid ${color}`;
  return (
    <>
      <span
        data-testid="corner-bracket"
        aria-hidden="true"
        style={{ ...base, top: inset, left: inset, borderTop: line, borderLeft: line }}
      />
      <span
        data-testid="corner-bracket"
        aria-hidden="true"
        style={{ ...base, top: inset, right: inset, borderTop: line, borderRight: line }}
      />
      <span
        data-testid="corner-bracket"
        aria-hidden="true"
        style={{ ...base, bottom: inset, left: inset, borderBottom: line, borderLeft: line }}
      />
      <span
        data-testid="corner-bracket"
        aria-hidden="true"
        style={{ ...base, bottom: inset, right: inset, borderBottom: line, borderRight: line }}
      />
    </>
  );
}
