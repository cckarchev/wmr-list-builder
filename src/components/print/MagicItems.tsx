import { marked } from 'marked';
import styled from 'styled-components';
import { useArmyStore } from '../../store/useArmyStore';
import magicItemsFile from '../../data/magic-items.revolution.json';
import type { MagicItemsFile } from '../../data/types';

const magicItems = magicItemsFile as MagicItemsFile;

const MAGIC_ITEM_TYPES = new Set([
  'Magic Standard',
  'Magic Weapon',
  'Device of Power',
  'Bannière Magique',
  'Arme Magique',
  'Objet Enchanté',
]);

const Wrapper = styled.div`
  color: ${({ theme }) => theme.color.text.body};
`;

const Heading = styled.h3`
  font-family: ${({ theme }) => theme.font.display};
  font-size: ${({ theme }) => theme.fontSize.lg};
  color: ${({ theme }) => theme.color.text.strong};
  text-align: center;
  margin-bottom: ${({ theme }) => `${theme.space[3]}px`};
`;

const Dl = styled.dl`
  font-size: ${({ theme }) => theme.fontSize.sm};
`;

const Dt = styled.dt`
  font-weight: 600;
  color: ${({ theme }) => theme.color.text.strong};
  margin-top: ${({ theme }) => `${theme.space[3]}px`};

  &:first-child {
    margin-top: 0;
  }
`;

const Dd = styled.dd`
  margin: 0;
  line-height: 1.6;
`;

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
    <Wrapper>
      <Heading>Magic Items{used ? ' Used' : ''}</Heading>
      <Dl>
        {entries.map(([name, item]) => {
          const html = marked(item.text.join('\n')) as string;
          return (
            <>
              <Dt key={`dt_${name}`}>{name}</Dt>
              <Dd key={`dd_${name}`} dangerouslySetInnerHTML={{ __html: html }} />
            </>
          );
        })}
      </Dl>
    </Wrapper>
  );
}
