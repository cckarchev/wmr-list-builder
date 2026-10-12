import { getEmbedBase } from '@/core/embed';
import { encodeListFor } from '@/core/persistence/list-codec/listCodec';
import { snapshotOf } from '@/core/persistence/snapshot';
import { buildShareUrl } from '@/core/shareLink';
import { useArmyStore } from '@/store/useArmyStore';
import { CopyButton } from '../shared/copy-button/CopyButton';

export const CopyShareLinkButton = () => {
  const armyId = useArmyStore((s) => s.armyId);
  const gameSize = useArmyStore((s) => s.gameSize);
  const units = useArmyStore((s) => s.units);
  const label = useArmyStore((s) => s.label);

  const shareUrl = () => {
    if (!armyId) {
      return undefined;
    }

    const encoded = encodeListFor(armyId, snapshotOf({ gameSize, units, label }));

    return buildShareUrl({
      armyId,
      encoded,
      embedBase: getEmbedBase(),
      origin: window.location.origin,
    });
  };

  return (
    <CopyButton
      icon="share"
      title="Copy share link"
      disabled={!armyId}
      getText={shareUrl}
      copiedMessage="Link copied!"
    >
      Share
    </CopyButton>
  );
};
