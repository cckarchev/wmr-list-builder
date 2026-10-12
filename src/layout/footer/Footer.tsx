import { useId } from 'react';
import { Link } from 'react-router-dom';
import { NewTabHint } from '@/components/NewTabHint';
import { classNames } from '@/core/lib/classNames';
import { getEmbedBase } from '@/core/share-link/embed';
import { WMR_EDITION } from '@/data/wmrEdition';
import styles from './Footer.module.css';

/** The rules edition the lists follow, a link to About and the short disclaimer. */
export const Footer = () => {
  const { compendiumVersion, armiesVersion } = WMR_EDITION;
  const hintId = useId();

  // Inside the host site's iframe, About opens in a new tab: navigating the
  // frame would leave the build with no way back to it but the browser's back.
  const isEmbedded = getEmbedBase() !== null;

  return (
    <footer className={classNames(styles.bar, 'no-print')}>
      <div className={styles.inner}>
        <div className={styles.text}>
          <p className={styles.edition}>
            Warmaster Revolution · Compendium {compendiumVersion} · Armies {armiesVersion}
          </p>
          <p>Unofficial fan tool, not endorsed by Games Workshop.</p>
        </div>
        {isEmbedded ? (
          <Link
            className={styles.about}
            to="/about"
            target="_blank"
            rel="noreferrer"
            aria-describedby={hintId}
          >
            About
            <NewTabHint id={hintId} />
          </Link>
        ) : (
          <Link className={styles.about} to="/about">
            About
          </Link>
        )}
      </div>
    </footer>
  );
};
