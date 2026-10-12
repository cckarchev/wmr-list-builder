import { Button } from '@/components/button/Button';
import { Icon } from '@/components/Icon';
import { getEmbedBase } from '@/core/embed';
import { encodeListFor } from '@/core/persistence/list-codec/listCodec';
import { snapshotOf } from '@/core/persistence/snapshot';
import { useArmyStore } from '@/store/useArmyStore';
import { CopiedBubble } from '../shared/copied-bubble/CopiedBubble';
import { PopupAnchor } from '../shared/popup-anchor/PopupAnchor';
import { useCopyFeedback } from '../shared/useCopyFeedback';

export const CopyShareLinkButton = () => {
  const armyId = useArmyStore((s) => s.armyId);
  const gameSize = useArmyStore((s) => s.gameSize);
  const units = useArmyStore((s) => s.units);
  const label = useArmyStore((s) => s.label);
  const { status, copy } = useCopyFeedback();

  const handleCopy = () => {
    if (!armyId) {
      return;
    }

    const encoded = encodeListFor(armyId, snapshotOf({ gameSize, units, label }));
    const base = getEmbedBase();
    let url: string;

    if (base) {
      // Embedded on the cckarchev site: share a link back to that page so the
      // recipient lands on cckarchev (which re-embeds the iframe with the list).
      const embedUrl = new URL(base);

      embedUrl.searchParams.set('army', armyId);
      embedUrl.searchParams.set('list', encoded);

      url = embedUrl.toString();
    } else {
      url = `${window.location.origin}/build/${armyId}?list=${encoded}`;
    }

    copy(url);
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
      {status === 'copied' && <CopiedBubble>Link copied!</CopiedBubble>}
      {status === 'failed' && <CopiedBubble>Copy failed</CopiedBubble>}
    </PopupAnchor>
  );
};
