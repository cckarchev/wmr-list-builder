import { ownValue } from "@/core/lib/ownValue";
import { FACTION_ICON_PATHS, MIRRORED_FACTION_ICONS } from "./factionIcons";

/** The side of the square every game-icons.net icon is drawn on. */
const ICON_SIZE = 512;

const VIEW_BOX = `0 0 ${ICON_SIZE} ${ICON_SIZE}`;

/** Flips a path left to right across the view box. */
const MIRROR_TRANSFORM = `matrix(-1 0 0 1 ${ICON_SIZE} 0)`;

interface FactionIconProps {
  armyId: string;
}

/**
 * A decorative faction emblem in currentColor that fills its container, or
 * nothing for an unknown army. The container sets the size.
 */
export const FactionIcon = ({ armyId }: FactionIconProps) => {
  const path = ownValue(FACTION_ICON_PATHS, armyId);

  if (!path) {
    return null;
  }

  const transform = MIRRORED_FACTION_ICONS.has(armyId)
    ? MIRROR_TRANSFORM
    : undefined;

  return (
    <svg
      width="100%"
      height="100%"
      viewBox={VIEW_BOX}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d={path} transform={transform} />
    </svg>
  );
};
