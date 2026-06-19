import { useState } from 'react';
import styled from 'styled-components';
import Button from '../ui/Button';
import Icon from '../ui/Icon';
import { useArmyStore } from '../../store/useArmyStore';
import { encodeList } from '../../store/persistence';
import { snapshotOf } from '../../store/snapshot';

const Wrapper = styled.span`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => `${theme.space[2]}px`};
`;

const CopiedLabel = styled.span`
  font-size: ${({ theme }) => theme.fontSize.xs};
  color: ${({ theme }) => theme.color.semantic.success};
  font-weight: 500;
`;

export default function CopyShareLinkButton() {
  const armyId = useArmyStore((s) => s.armyId);
  const gameSize = useArmyStore((s) => s.gameSize);
  const units = useArmyStore((s) => s.units);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!armyId) return;
    const encoded = encodeList(snapshotOf({ gameSize, units }));
    const url = `${window.location.origin}/build/${armyId}?list=${encoded}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
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
}
