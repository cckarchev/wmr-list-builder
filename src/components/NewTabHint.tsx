/** Read out after the link's name, so the new tab is not a silent context change. */
const NEW_TAB_HINT = 'Opens in a new tab';

interface NewTabHintProps {
  /** Referenced by the link's aria-describedby. */
  id: string;
}

/**
 * The accessible description of a link that opens in a new tab. Hidden from
 * view: a description can reference hidden content, so it adds nothing on
 * screen and leaves the link's name alone.
 */
export const NewTabHint = ({ id }: NewTabHintProps) => (
  <span id={id} hidden>
    {NEW_TAB_HINT}
  </span>
);
