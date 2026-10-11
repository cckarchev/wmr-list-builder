import { Link } from 'react-router-dom';
import { armyIndex } from '@/data/armyIndex';
import styles from './Home.module.css';

export const Home = () => (
  <main className={styles.page}>
    <h1 className={styles.heading}>Choose Your Army</h1>
    <ul className={styles.grid}>
      {armyIndex.map(({ id, name }) => (
        <li key={id}>
          <Link className={styles.card} to={`/build/${id}`}>
            {name}
          </Link>
        </li>
      ))}
    </ul>
  </main>
);
