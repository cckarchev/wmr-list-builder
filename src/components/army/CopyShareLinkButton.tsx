import { useState } from 'react';
import styled from 'styled-components';
import { loadArmy } from '../../data/loadArmy';
import { getEmbedBase } from '../../store/embed';
import { buildCodeMaps, encodeList } from '../../store/persistence';
import { snapshotOf } from '../../store/snapshot';
import { useArmyStore } from '../../store/useArmyStore';
import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';
import { COPIED_FEEDBACK_MS } from './copyFeedback';

const Wrapper = styled.span`
  position: relative;
  display: inline-flex;
  align-items: center;
`;

// A transient confirmation bubble. Positioned absolutely so it floats over the
// layout instead of pushing the neighbouring action buttons aside.
const CopiedLabel = styled.span`
  position: absolute;
  top: calc(100% + ${({ theme }) => `${theme.space.xxs}px`});
  left: 50%;
  transform: translateX(-50%);
  z-index: 30;
  white-space: nowrap;
  padding: ${({ theme }) => `${theme.space.xxs}px ${theme.space.xs}px`};
  background: ${({ theme }) => theme.color.bg.surface};
  border: 1px solid ${({ theme }) => theme.color.border.default};
  border-radius: ${({ theme }) => theme.radius.sm};
  box-shadow: ${({ theme }) => theme.shadow.panel};
  font-size: ${({ theme }) => theme.fontSize.xs};
  color: ${({ theme }) => theme.color.semantic.success};
  font-weight: 500;
`;

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
      setTimeout(() => setCopied(false), COPIED_FEEDBACK_MS);
    });
  };

  return (
    <Wrapper>
      <Button
        $variant="ghost"
        $size="sm"
        onClick={handleCopy}
        disabled={!armyId}
        title="Copy share link"
      >
        <Icon name="share" size={16} />
        Share
      </Button>
      {copied && <CopiedLabel>Link copied!</CopiedLabel>}
    </Wrapper>
  );
};
