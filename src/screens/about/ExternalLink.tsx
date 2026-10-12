import { type ReactNode, useId } from 'react';

interface ExternalLinkProps {
  href: string;
  children: ReactNode;
}

/** Read out after the link's name, so the new tab is not a silent context change. */
const NEW_TAB_HINT = 'Opens in a new tab';

/** A link off the site, opened in a new tab so the builder (often embedded) stays put. */
export const ExternalLink = ({ href, children }: ExternalLinkProps) => {
  const hintId = useId();

  return (
    <a href={href} target="_blank" rel="noreferrer" aria-describedby={hintId}>
      {children}
      <span id={hintId} hidden>
        {NEW_TAB_HINT}
      </span>
    </a>
  );
};
