import { Button } from '@/components/button/Button';
import { Icon } from '@/components/Icon';
import { getEmbedBase } from '@/core/embed';
import { encodeListFor } from '@/core/persistence/list-codec/listCodec';
import { snapshotOf } from '@/core/persistence/snapshot';
import { buildShareUrl } from '@/core/shareLink';
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
    const url = buildShareUrl({
      armyId,
      encoded,
      embedBase: getEmbedBase(),
      origin: window.location.origin,
    });

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
        <Icon name="share" />
        Share
      </Button>
      {status === 'copied' && <CopiedBubble>Link copied!</CopiedBubble>}
      {status === 'failed' && <CopiedBubble>Copy failed</CopiedBubble>}
    </PopupAnchor>
  );
};
