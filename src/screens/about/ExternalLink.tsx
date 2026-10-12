import type { ReactNode } from 'react';

interface ExternalLinkProps {
  href: string;
  children: ReactNode;
}

/** A link off the site, opened in a new tab so the builder (often embedded) stays put. */
export const ExternalLink = ({ href, children }: ExternalLinkProps) => (
  <a href={href} target="_blank" rel="noreferrer">
    {children}
  </a>
);
