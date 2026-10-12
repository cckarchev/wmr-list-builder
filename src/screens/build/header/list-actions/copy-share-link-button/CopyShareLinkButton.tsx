import { encodeListFor } from '@/core/persistence/list-codec/listCodec';
import { getEmbedBase } from '@/core/share-link/embed';
import { buildShareUrl } from '@/core/share-link/shareLink';
import { useArmyStore } from '@/store/useArmyStore';
import { useListSnapshot } from '@/store/useListSnapshot';
import { CopyButton } from '../shared/copy-button/CopyButton';

export const CopyShareLinkButton = () => {
  const armyId = useArmyStore((s) => s.armyId);
  const snapshot = useListSnapshot();

  const shareUrl = () => {
    if (!armyId) {
      return undefined;
    }

    const encoded = encodeListFor(armyId, snapshot);

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
