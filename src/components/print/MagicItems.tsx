import { marked } from 'marked';
import { useArmyStore } from '../../store/useArmyStore';
import { magicItems } from '../../data/magicItems';
import { PrintSection, PrintHeading, DefList, DefTerm, DefDesc } from './printSection';

const MAGIC_ITEM_TYPES = new Set([
  'Magic Standard',
  'Magic Weapon',
  'Device of Power',
  'Bannière Magique',
  'Arme Magique',
  'Objet Enchanté',
]);

interface MagicItemsProps {
  used?: boolean;
}

export default function MagicItems({ used = false }: MagicItemsProps) {
  const upgrades = useArmyStore((s) => s.upgrades);
  const magic = useArmyStore((s) => s.magic);

  if (!magic) return null;

  const allMagicItems = magicItems.upgrades;

  const items = used
    ? Object.fromEntries(
        Object.entries(allMagicItems).filter(([id]) => {
          const globalUpgrade = upgrades[id];
          return globalUpgrade && globalUpgrade.number > 0 && MAGIC_ITEM_TYPES.has(globalUpgrade.type);
        }),
      )
    : allMagicItems;

  const entries = Object.entries(items);
  if (entries.length === 0) return null;

  return (
    <PrintSection>
      <PrintHeading>Magic Items{used ? ' Used' : ''}</PrintHeading>
      <DefList>
        {entries.map(([name, item]) => {
          const html = marked(item.text.join('\n')) as string;
          return (
            <>
              <DefTerm key={`dt_${name}`}>{name}</DefTerm>
              <DefDesc key={`dd_${name}`} dangerouslySetInnerHTML={{ __html: html }} />
            </>
          );
        })}
      </DefList>
    </PrintSection>
  );
}
