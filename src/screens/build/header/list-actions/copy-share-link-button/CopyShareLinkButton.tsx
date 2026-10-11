import { useState } from 'react';
import { Button } from '@/components/button/Button';
import { Icon } from '@/components/Icon';
import { getEmbedBase } from '@/core/embed';
import { buildCodeMaps } from '@/core/persistence/codeMaps';
import { encodeList } from '@/core/persistence/list-codec/listCodec';
import { snapshotOf } from '@/core/persistence/snapshot';
import { loadArmy } from '@/data/loadArmy';
import { useArmyStore } from '@/store/useArmyStore';
import { CopiedBubble } from '../shared/copied-bubble/CopiedBubble';
import { COPIED_FEEDBACK_MS } from '../shared/copyFeedback';
import { PopupAnchor } from '../shared/popup-anchor/PopupAnchor';

export const CopyShareLinkButton = () => {
  const armyId = useArmyStore((s) => s.armyId);
  const gameSize = useArmyStore((s) => s.gameSize);
  const units = useArmyStore((s) => s.units);
  const label = useArmyStore((s) => s.label);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!armyId) {
      return;
    }

    const maps = buildCodeMaps(loadArmy(armyId));
    const encoded = encodeList(snapshotOf({ gameSize, units, label }), maps);
    const base = getEmbedBase();
    let url: string;

    if (base) {
      // Embedded on the cckarchev site: share a link back to that page so the
      // recipient lands on cckarchev (which re-embeds the iframe with the list).
      const u = new URL(base);
      u.searchParams.set('army', armyId);
      u.searchParams.set('list', encoded);
      url = u.toString();
    } else {
      url = `${window.location.origin}/build/${armyId}?list=${encoded}`;
    }

    navigator.clipboard.writeText(url).then(() => {
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
        disabled={!armyId}
        title="Copy share link"
      >
        <Icon name="share" size={16} />
        Share
      </Button>
      {copied && <CopiedBubble>Link copied!</CopiedBubble>}
    </PopupAnchor>
  );
};
