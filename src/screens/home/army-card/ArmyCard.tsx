import { Link } from 'react-router-dom';
import styles from './ArmyCard.module.css';
import { FactionIcon } from './FactionIcon';

/** Icon size inside the 48px emblem badge, leaving room for the border and padding. */
const EMBLEM_ICON_SIZE = 32;

interface ArmyCardProps {
  id: string;
  name: string;
}

export const ArmyCard = ({ id, name }: ArmyCardProps) => (
  <Link className={styles.card} to={`/build/${id}`}>
    <span className={styles.emblem} aria-hidden="true">
      <FactionIcon armyId={id} size={EMBLEM_ICON_SIZE} />
    </span>
    <span className={styles.name}>{name}</span>
  </Link>
);
