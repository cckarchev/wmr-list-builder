import { FACTION_ICON_PATHS } from './factionIcons';

/** The view box every game-icons.net icon is drawn on. */
const VIEW_BOX = '0 0 512 512';

interface FactionIconProps {
  armyId: string;
  size: number;
}

/** A decorative faction emblem in currentColor, or nothing for an unknown army. */
export const FactionIcon = ({ armyId, size }: FactionIconProps) => {
  const path = FACTION_ICON_PATHS[armyId];

  if (!path) {
    return null;
  }

  return (
    <svg width={size} height={size} viewBox={VIEW_BOX} fill="currentColor" aria-hidden="true">
      <path d={path} />
    </svg>
  );
};
