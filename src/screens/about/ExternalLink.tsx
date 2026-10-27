import { type ReactNode, useId } from "react";
import { NewTabHint } from "@/components/NewTabHint";

interface ExternalLinkProps {
  href: string;
  children: ReactNode;
}

/** A link off the site, opened in a new tab so the builder stays put. */
export const ExternalLink = ({ href, children }: ExternalLinkProps) => {
  const hintId = useId();

  return (
    <a href={href} target="_blank" rel="noreferrer" aria-describedby={hintId}>
      {children}
      <NewTabHint id={hintId} />
    </a>
  );
};
