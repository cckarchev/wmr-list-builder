import { useState } from 'react';
import { ChevronMark } from '@/components/chevron-mark/ChevronMark';
import { Icon, INLINE_ICON_SIZE } from '@/components/Icon';
import { Markdown } from '@/components/Markdown';
import { Popover } from '@/components/popover/Popover';
import { toggleMember } from '@/core/lib/sets';
import { isCaster } from '@/core/selectors';
import { useArmyStore } from '@/store/useArmyStore';
import styles from './UnitSpells.module.css';

/** Shown in the range column for spells without a range. */
const NO_RANGE = '–';

const CARET_SIZE = 11;

interface UnitSpellsProps {
  unitId: string;
}

export const UnitSpells = ({ unitId }: UnitSpellsProps) => {
  const unit = useArmyStore((s) => s.units[unitId]);
  const spells = useArmyStore((s) => s.spells);
  const [open, setOpen] = useState<Set<number>>(new Set());

  if (!unit || !isCaster(unit) || !spells || spells.length === 0) {
    return null;
  }

  const toggle = (i: number) => {
    setOpen((previous) => toggleMember(previous, i));
  };

  return (
    <Popover
      label="Spells"
      trigger={
        <>
          <Icon name="magic" size={INLINE_ICON_SIZE} />
          Spells
        </>
      }
      wide
    >
      <div className={styles.list}>
        {spells.map((spell, i) => {
          const isOpen = open.has(i);

          return (
            <div className={styles.spell} key={spell.name}>
              <button
                className={styles.header}
                type="button"
                aria-expanded={isOpen}
                onClick={() => toggle(i)}
              >
                <span className={styles.caret}>
                  <ChevronMark size={CARET_SIZE} color="currentColor" />
                </span>
                <span className={styles.name}>{spell.name}</span>
                <span className={styles.roll}>{spell.roll}+</span>
                <span className={styles.range}>{spell.range ?? NO_RANGE}</span>
              </button>
              {isOpen && (
                <div className={styles.effect}>
                  <Markdown blocks={[`*${spell.fluff}*`, ...spell.text]} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Popover>
  );
};
