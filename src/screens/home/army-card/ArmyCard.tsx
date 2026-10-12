import { useId } from 'react';
import { Link } from 'react-router-dom';
import { FactionIcon } from '@/components/faction-icon/FactionIcon';
import { hasFactionIcon } from '@/components/faction-icon/factionIcons';
import styles from './ArmyCard.module.css';
import { FACTION_TAGLINES } from './factionTaglines';

interface ArmyCardProps {
  id: string;
  name: string;
}

export const ArmyCard = ({ id, name }: ArmyCardProps) => {
  const tagline = FACTION_TAGLINES[id];
  const nameId = useId();
  const taglineId = useId();

  // The link is named by the army alone; the tagline is its description, so
  // screen readers announce "Goblin" rather than the whole blurb as the name.
  const describedBy = tagline ? taglineId : undefined;

  return (
    <Link
      className={styles.card}
      to={`/build/${id}`}
      aria-labelledby={nameId}
      aria-describedby={describedBy}
    >
      {hasFactionIcon(id) && (
        <span className={styles.emblem}>
          <FactionIcon armyId={id} />
        </span>
      )}
      <span className={styles.text}>
        <span id={nameId} className={styles.name}>
          {name}
        </span>
        {tagline && (
          <span id={taglineId} className={styles.tagline}>
            {tagline}
          </span>
        )}
      </span>
    </Link>
  );
};
