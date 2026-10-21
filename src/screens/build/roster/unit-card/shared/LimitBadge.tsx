import { Tooltip } from "@/components/tooltip/Tooltip";
import type { MinMaxHint } from "@/core/limits/min-max/minMaxHint";

interface LimitBadgeProps {
  hint: MinMaxHint;
  /** Styles the badge text, which differs between a unit and an upgrade row. */
  className: string;
}

/** A troop's terse min/max badge, with the full rule in a tooltip. */
export const LimitBadge = ({ hint, className }: LimitBadgeProps) => (
  <Tooltip label={hint.rule}>
    <span className={className}>{hint.badge}</span>
  </Tooltip>
);
