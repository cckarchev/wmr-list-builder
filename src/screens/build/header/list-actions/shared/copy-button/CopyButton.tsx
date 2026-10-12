import type { ReactNode } from 'react';
import { Button } from '@/components/button/Button';
import { Icon, type IconName } from '@/components/Icon';
import { CopyBubble } from '../copy-bubble/CopyBubble';
import { PopupAnchor } from '../popup-anchor/PopupAnchor';
import { useCopyFeedback } from '../useCopyFeedback';

interface CopyButtonProps {
  icon: IconName;
  /** Tooltip naming what gets copied. */
  title: string;
  disabled: boolean;
  /** Builds the text to copy, or returns undefined when there is nothing to copy yet. */
  getText: () => string | undefined;
  /** Bubble shown once the copy succeeds. */
  copiedMessage: string;
  /** Visible button label. */
  children: ReactNode;
}

/** A list action that copies text to the clipboard and confirms it with a bubble. */
export const CopyButton = ({
  icon,
  title,
  disabled,
  getText,
  copiedMessage,
  children,
}: CopyButtonProps) => {
  const { status, copy } = useCopyFeedback();

  const handleCopy = () => {
    const text = getText();

    if (text === undefined) {
      return;
    }

    copy(text);
  };

  return (
    <PopupAnchor>
      <Button variant="ghost" size="sm" onClick={handleCopy} disabled={disabled} title={title}>
        <Icon name={icon} />
        {children}
      </Button>
      {status === 'copied' && <CopyBubble tone="success">{copiedMessage}</CopyBubble>}
      {status === 'failed' && <CopyBubble tone="error">Copy failed</CopyBubble>}
    </PopupAnchor>
  );
};
