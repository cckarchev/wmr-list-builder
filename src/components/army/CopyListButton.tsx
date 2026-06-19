import { useState } from 'react';
import styled from 'styled-components';
import Button from '../ui/Button';
import Icon from '../ui/Icon';
import { useArmyStore } from '../../store/useArmyStore';
import { pointsCost, usedUnits as getUsedUnits } from '../../store/selectors';
import { buildTextList } from './textList';

const Wrapper = styled.span`
  position: relative;
  display: inline-flex;
  align-items: center;
`;

// A transient confirmation bubble. Positioned absolutely so it floats over the
// layout instead of pushing the neighbouring action buttons aside.
const CopiedLabel = styled.span`
  position: absolute;
  top: calc(100% + ${({ theme }) => `${theme.space[1]}px`});
  left: 50%;
  transform: translateX(-50%);
  z-index: 30;
  white-space: nowrap;
  padding: ${({ theme }) => `${theme.space[1]}px ${theme.space[2]}px`};
  background: ${({ theme }) => theme.color.bg.surface};
  border: 1px solid ${({ theme }) => theme.color.border.default};
  border-radius: ${({ theme }) => theme.radius.sm};
  box-shadow: ${({ theme }) => theme.shadow.panel};
  font-size: ${({ theme }) => theme.fontSize.xs};
  color: ${({ theme }) => theme.color.semantic.success};
  font-weight: 500;
`;

export default function CopyListButton() {
  const [copied, setCopied] = useState(false);

  const army = useArmyStore((s) => s.army);
  const units = useArmyStore((s) => s.units);
  const upgrades = useArmyStore((s) => s.upgrades);
  const label = useArmyStore((s) => s.label);
  const version = useArmyStore((s) => s.version);

  const handleCopy = () => {
    if (!army) return;

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
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <Wrapper>
      <Button
        $variant="ghost"
        $size="sm"
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
}
