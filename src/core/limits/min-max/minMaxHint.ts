import { explainMinMax } from "./explainMinMax";
import { minMaxBadge } from "./minMaxBadge";
import type { MinMaxSource } from "./minMaxInfo";

export interface MinMaxHint {
  /** Terse form shown on the row, such as "2-12". */
  badge: string;
  /** Full rule shown in the tooltip. */
  rule: string;
}

/**
 * A troop's min/max as a badge plus its explanation, or undefined when
 * unconstrained.
 */
export const minMaxHint = (
  troop: MinMaxSource,
  gameSize: number,
): MinMaxHint | undefined => {
  const badge = minMaxBadge(troop, gameSize);
  const rule = explainMinMax(troop, gameSize);

  if (!badge || !rule) {
    return undefined;
  }

  return { badge, rule };
};
