import type { CSSProperties } from 'react';

interface CornerBracketsProps {
  /** Bracket color, any CSS color including a var(--token). */
  accent?: string;
  size?: number;
  thickness?: number;
  inset?: number;
}

export const CornerBrackets = ({
  accent = 'var(--color-teal-bright)',
  size = 14,
  thickness = 2,
  inset = -1,
}: CornerBracketsProps) => {
  const base: CSSProperties = {
    position: 'absolute',
    width: size,
    height: size,
    pointerEvents: 'none',
  };
  const line = `${thickness}px solid ${accent}`;

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
};
