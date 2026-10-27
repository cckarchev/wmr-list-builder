import { marked } from "marked";

interface MarkdownProps {
  /** Markdown paragraphs, rendered as separate blocks. */
  blocks: string[];
}

const BLOCK_SEPARATOR = "\n\n";

export const Markdown = ({ blocks }: MarkdownProps) => {
  const html = marked(blocks.join(BLOCK_SEPARATOR), { async: false });

  // biome-ignore lint/security/noDangerouslySetInnerHtml: renders the bundled army data, never user input
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
};
