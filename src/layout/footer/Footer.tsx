import { Link } from 'react-router-dom';
import { classNames } from '@/core/lib/classNames';
import { WMR_EDITION } from '@/data/wmrEdition';
import styles from './Footer.module.css';

/** The rules edition the lists follow, a link to About and the short disclaimer. */
export const Footer = () => {
  const { compendiumVersion, armiesVersion } = WMR_EDITION;

  return (
    <footer className={classNames(styles.bar, 'no-print')}>
      <div className={styles.inner}>
        <div className={styles.text}>
          <p className={styles.edition}>
            Warmaster Revolution · Compendium {compendiumVersion} · Armies {armiesVersion}
          </p>
          <p>Unofficial fan tool, not endorsed by Games Workshop.</p>
        </div>
        <Link className={styles.about} to="/about">
          About
        </Link>
      </div>
    </footer>
  );
};
