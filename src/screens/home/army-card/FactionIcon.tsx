import { FACTION_ICON_PATHS, MIRRORED_FACTION_ICONS } from './factionIcons';

/** The view box every game-icons.net icon is drawn on. */
const VIEW_BOX = '0 0 512 512';

/** Flips a path left to right across the 512-wide view box. */
const MIRROR_TRANSFORM = 'matrix(-1 0 0 1 512 0)';

interface FactionIconProps {
  armyId: string;
}

/**
 * A decorative faction emblem in currentColor that fills its container, or
 * nothing for an unknown army. The container sets the size.
 */
export const FactionIcon = ({ armyId }: FactionIconProps) => {
  const path = FACTION_ICON_PATHS[armyId];

  if (!path) {
    return null;
  }

  const transform = MIRRORED_FACTION_ICONS.has(armyId) ? MIRROR_TRANSFORM : undefined;

  return (
    <svg width="100%" height="100%" viewBox={VIEW_BOX} fill="currentColor" aria-hidden="true">
      <path d={path} transform={transform} />
    </svg>
  );
};
