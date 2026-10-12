import { Fragment } from 'react';
import { Markdown } from '@/components/Markdown';
import { MAGIC_ITEM_TYPES, magicItems } from '@/data/magicItems';
import { useArmyStore } from '@/store/useArmyStore';
import {
  DefDesc,
  DefList,
  DefTerm,
  PrintHeading,
  PrintSection,
} from './print-section/PrintSection';

export const MagicItems = () => {
  const upgrades = useArmyStore((s) => s.upgrades);
  const magic = useArmyStore((s) => s.magic);

  if (!magic) {
    return null;
  }

  const isTaken = (id: string) => {
    const upgrade = upgrades[id];

    return upgrade && upgrade.number > 0 && MAGIC_ITEM_TYPES.has(upgrade.type);
  };

  const entries = Object.entries(magicItems.upgrades).filter(([id]) => isTaken(id));

  if (entries.length === 0) {
    return null;
  }

  return (
    <PrintSection>
      <PrintHeading>Magic Items</PrintHeading>
      <DefList>
        {entries.map(([id, item]) => (
          <Fragment key={id}>
            <DefTerm>{item.name}</DefTerm>
            <DefDesc>
              <Markdown blocks={item.text} />
            </DefDesc>
          </Fragment>
        ))}
      </DefList>
    </PrintSection>
  );
};
