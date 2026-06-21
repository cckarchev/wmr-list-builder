import { Fragment } from 'react';
import { marked } from 'marked';
import { useArmyStore } from '../../store/useArmyStore';
import { magicItems, MAGIC_ITEM_TYPES } from '../../data/magicItems';
import { PrintSection, PrintHeading, DefList, DefTerm, DefDesc } from './printSection';

export default function MagicItems() {
  const upgrades = useArmyStore((s) => s.upgrades);
  const magic = useArmyStore((s) => s.magic);

  if (!magic) return null;

  const allMagicItems = magicItems.upgrades;

  const items = Object.fromEntries(
    Object.entries(allMagicItems).filter(([id]) => {
      const globalUpgrade = upgrades[id];
      return globalUpgrade && globalUpgrade.number > 0 && MAGIC_ITEM_TYPES.has(globalUpgrade.type);
    }),
  );

  const entries = Object.entries(items);
  if (entries.length === 0) return null;

  return (
    <PrintSection>
      <PrintHeading>Magic Items</PrintHeading>
      <DefList>
        {entries.map(([name, item]) => {
          const html = marked(item.text.join('\n')) as string;
          return (
            <Fragment key={name}>
              <DefTerm>{name}</DefTerm>
              <DefDesc dangerouslySetInnerHTML={{ __html: html }} />
            </Fragment>
          );
        })}
      </DefList>
    </PrintSection>
  );
}
