import { Fragment } from 'react';
import { MAGIC_ITEM_TYPES, magicItems } from '../../data/magicItems';
import { useArmyStore } from '../../store/useArmyStore';
import Markdown from '../ui/Markdown';
import { DefDesc, DefList, DefTerm, PrintHeading, PrintSection } from './printSection';

const MagicItems = () => {
  const upgrades = useArmyStore((s) => s.upgrades);
  const magic = useArmyStore((s) => s.magic);

  if (!magic) {
    return null;
  }

  const allMagicItems = magicItems.upgrades;

  const items = Object.fromEntries(
    Object.entries(allMagicItems).filter(([id]) => {
      const globalUpgrade = upgrades[id];
      return globalUpgrade && globalUpgrade.number > 0 && MAGIC_ITEM_TYPES.has(globalUpgrade.type);
    }),
  );

  const entries = Object.entries(items);
  if (entries.length === 0) {
    return null;
  }

  return (
    <PrintSection>
      <PrintHeading>Magic Items</PrintHeading>
      <DefList>
        {entries.map(([name, item]) => (
          <Fragment key={name}>
            <DefTerm>{name}</DefTerm>
            <DefDesc>
              <Markdown blocks={item.text} />
            </DefDesc>
          </Fragment>
        ))}
      </DefList>
    </PrintSection>
  );
};

export default MagicItems;
