import { useState } from 'react';

/** How long a copy button shows its "Copied" confirmation before resetting. */
const COPIED_FEEDBACK_MS = 1500;

/**
 * Copies text to the clipboard and raises `copied` for a moment once it
 * lands, so the button can show its confirmation bubble.
 */
export const useCopyFeedback = () => {
  const [copied, setCopied] = useState(false);

  const copy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, COPIED_FEEDBACK_MS);
    });
  };

  return { copied, copy };
};
