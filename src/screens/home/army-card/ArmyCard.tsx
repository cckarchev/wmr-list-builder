import { Link } from 'react-router-dom';
import { initials } from '@/core/lib/initials';
import styles from './ArmyCard.module.css';

interface ArmyCardProps {
  id: string;
  name: string;
}

export const ArmyCard = ({ id, name }: ArmyCardProps) => (
  <Link className={styles.card} to={`/build/${id}`}>
    <span className={styles.monogram} aria-hidden="true">
      {initials(name)}
    </span>
    <span className={styles.name}>{name}</span>
  </Link>
);
