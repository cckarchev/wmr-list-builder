import { usedUnits as getUsedUnits, pointsCost } from '@/core/selectors';
import { buildTextList } from '@/core/textList';
import { useArmyStore } from '@/store/useArmyStore';
import { CopyButton } from '../shared/copy-button/CopyButton';

export const CopyListButton = () => {
  const army = useArmyStore((s) => s.army);
  const units = useArmyStore((s) => s.units);
  const upgrades = useArmyStore((s) => s.upgrades);
  const label = useArmyStore((s) => s.label);
  const version = useArmyStore((s) => s.version);

  const listText = () => {
    if (!army) {
      return undefined;
    }

    const state = { units, upgrades };
    const points = pointsCost({ units });
    const used = getUsedUnits(state);

    return buildTextList({
      armyName: army.name,
      label,
      points,
      usedUnits: used,
      version,
    });
  };

  return (
    <CopyButton
      icon="copy"
      title="Copy list as text"
      disabled={!army}
      getText={listText}
      copiedMessage="Copied!"
    >
      Copy
    </CopyButton>
  );
};
