/** Query param carrying an encoded list in a share link. */
export const LIST_PARAM = "list";

interface ShareUrlInput {
  armyId: string;
  /** The list, already encoded for a share link. */
  encoded: string;
  /** This app's own origin, such as window.location.origin. */
  origin: string;
}

/**
 * The link the Share button copies: this app's build route carrying the list.
 */
export const buildShareUrl = ({
  armyId,
  encoded,
  origin,
}: ShareUrlInput): string =>
  `${origin}/build/${armyId}?${LIST_PARAM}=${encoded}`;
