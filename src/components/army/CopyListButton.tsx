import { useState } from 'react';
import styled from 'styled-components';
import Button from '../ui/Button';
import Icon from '../ui/Icon';
import { useArmyStore } from '../../store/useArmyStore';
import { pointsCost, usedUnits as getUsedUnits } from '../../store/selectors';
import { buildTextList } from './textList';

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
