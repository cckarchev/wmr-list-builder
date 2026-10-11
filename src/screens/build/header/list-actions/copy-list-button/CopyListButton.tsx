import { useState } from 'react';
import { Button } from '@/components/button/Button';
import { Icon } from '@/components/Icon';
import { usedUnits as getUsedUnits, pointsCost } from '@/core/selectors';
import { buildTextList } from '@/core/textList';
import { useArmyStore } from '@/store/useArmyStore';
import { CopiedBubble } from '../shared/copied-bubble/CopiedBubble';
import { COPIED_FEEDBACK_MS } from '../shared/copyFeedback';
import { PopupAnchor } from '../shared/popup-anchor/PopupAnchor';

export const CopyListButton = () => {
  const [copied, setCopied] = useState(false);

  const army = useArmyStore((s) => s.army);
  const units = useArmyStore((s) => s.units);
  const upgrades = useArmyStore((s) => s.upgrades);
  const label = useArmyStore((s) => s.label);
  const version = useArmyStore((s) => s.version);

  const handleCopy = () => {
    if (!army) {
      return;
    }

    const state = { units, upgrades };
    const points = pointsCost({ units });
    const used = getUsedUnits(state);

    const text = buildTextList({
      armyName: army.name,
      label,
      points,
      usedUnits: used,
      version,
    });

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, COPIED_FEEDBACK_MS);
    });
  };

  return (
    <PopupAnchor>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleCopy}
        disabled={!army}
        title="Copy list as text"
      >
        <Icon name="copy" size={16} />
        Copy
      </Button>
      {copied && <CopiedBubble>Copied!</CopiedBubble>}
    </PopupAnchor>
  );
};
