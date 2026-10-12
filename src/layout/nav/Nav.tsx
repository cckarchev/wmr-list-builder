import { Link, useLocation } from 'react-router-dom';
import { ChevronMark } from '@/components/chevron-mark/ChevronMark';
import { classNames } from '@/core/lib/classNames';
import styles from './Nav.module.css';

/** The chevron on the Back link. */
const BACK_CARET_SIZE = 10;

export const Nav = () => {
  const { pathname } = useLocation();
  const [section, armyId] = pathname.split('/').filter(Boolean);

  // The brand links home; the right-hand chip is the screen's primary nav.
  // Print goes back to that army's roster (preserving the build). On the Build
  // screen, the build Header owns the Print action, so there is no chip there.
  const backTo = section === 'print' && armyId ? `/build/${armyId}` : null;

  return (
    <header className={classNames(styles.bar, 'no-print')}>
      <Link className={styles.brand} to="/">
        Warmaster <span className={styles.brandMark}>Revolution</span>{' '}
        <span className={styles.toolName}>· List Builder</span>
      </Link>
      {backTo && (
        <Link className={styles.action} to={backTo}>
          <span className={styles.backMark}>
            <ChevronMark size={BACK_CARET_SIZE} color="currentColor" />
          </span>
          Back
        </Link>
      )}
    </header>
  );
};
