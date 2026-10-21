import type { CSSProperties } from "react";

/** Length of each bracket arm, in pixels. */
const SIZE = 14;

/** Line thickness of each bracket, in pixels. */
const THICKNESS = 2;

/** Offset from the card edge; negative sits the brackets over its border. */
const INSET = -1;

interface CornerBracketsProps {
  /** Bracket color, any CSS color including a var(--token). */
  accent: string;
}

export const CornerBrackets = ({ accent }: CornerBracketsProps) => {
  const base: CSSProperties = {
    position: "absolute",
    width: SIZE,
    height: SIZE,
    pointerEvents: "none",
  };
  const line = `${THICKNESS}px solid ${accent}`;

  return (
    <>
      <span
        data-testid="corner-bracket"
        aria-hidden="true"
        style={{
          ...base,
          top: INSET,
          left: INSET,
          borderTop: line,
          borderLeft: line,
        }}
      />
      <span
        data-testid="corner-bracket"
        aria-hidden="true"
        style={{
          ...base,
          top: INSET,
          right: INSET,
          borderTop: line,
          borderRight: line,
        }}
      />
      <span
        data-testid="corner-bracket"
        aria-hidden="true"
        style={{
          ...base,
          bottom: INSET,
          left: INSET,
          borderBottom: line,
          borderLeft: line,
        }}
      />
      <span
        data-testid="corner-bracket"
        aria-hidden="true"
        style={{
          ...base,
          bottom: INSET,
          right: INSET,
          borderBottom: line,
          borderRight: line,
        }}
      />
    </>
  );
};
