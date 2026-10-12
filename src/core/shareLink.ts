/** Query param carrying the army id in embedded, query-only links. */
export const ARMY_PARAM = 'army';

/** Query param carrying an encoded list in a share link. */
export const LIST_PARAM = 'list';

interface ShareUrlInput {
  armyId: string;
  /** The list, already encoded for a share link. */
  encoded: string;
  /** The embedding page's base URL, or null when the builder runs standalone. */
  embedBase: string | null;
  /** This app's own origin, such as window.location.origin. */
  origin: string;
}

/**
 * The link the Share button copies. Embedded on the cckarchev site, it points
 * back to that page so the recipient lands on cckarchev, which re-embeds the
 * iframe with the list. Standalone, it points at this app's build route.
 */
export const buildShareUrl = ({ armyId, encoded, embedBase, origin }: ShareUrlInput): string => {
  if (!embedBase) {
    return `${origin}/build/${armyId}?${LIST_PARAM}=${encoded}`;
  }

  const embedUrl = new URL(embedBase);

  embedUrl.searchParams.set(ARMY_PARAM, armyId);
  embedUrl.searchParams.set(LIST_PARAM, encoded);

  return embedUrl.toString();
};
