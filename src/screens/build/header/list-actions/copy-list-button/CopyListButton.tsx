import { useState } from 'react';
import styled from 'styled-components';
import { Button } from '@/components/button/Button';
import { Icon } from '@/components/Icon';
import { usedUnits as getUsedUnits, pointsCost } from '@/core/selectors';
import { buildTextList } from '@/core/textList';
import { useArmyStore } from '@/store/useArmyStore';
import { COPIED_FEEDBACK_MS } from '../copyFeedback';

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
      setTimeout(() => setCopied(false), COPIED_FEEDBACK_MS);
    });
  };

  return (
    <Wrapper>
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
      {copied && <CopiedLabel>Copied!</CopiedLabel>}
    </Wrapper>
  );
};
