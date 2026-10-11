import { Fragment } from 'react';
import { Markdown } from '@/components/Markdown';
import { useArmyStore } from '@/store/useArmyStore';
import { usePrintOptions } from '../../printOptions';
import {
  DefDesc,
  DefList,
  DefTerm,
  PrintHeading,
  PrintSection,
} from '../print-section/PrintSection';
import styles from './Spells.module.css';

export const Spells = () => {
  const spells = useArmyStore((s) => s.spells);
  const { spellFluff } = usePrintOptions();

  if (!spells || spells.length === 0) {
    return null;
  }

  return (
    <PrintSection>
      <PrintHeading>Spells</PrintHeading>
      <DefList>
        {spells.map((spell) => {
          const blocks = spellFluff ? [`*${spell.fluff}*`, ...spell.text] : spell.text;
          const header = `${spell.name.toUpperCase()} · ${spell.roll}+ to cast · Range ${
            spell.range ?? 'N/A'
          }`;

          return (
            <Fragment key={spell.name}>
              <DefTerm>{header}</DefTerm>
              <DefDesc className={styles.text}>
                <Markdown blocks={blocks} />
              </DefDesc>
            </Fragment>
          );
        })}
      </DefList>
    </PrintSection>
  );
};
