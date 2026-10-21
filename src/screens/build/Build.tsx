import type { CSSProperties } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { LIST_PARAM } from '@/core/share-link/shareLink';
import { useElementHeight } from '@/hooks/useElementHeight';
import { usePersistedList } from '@/hooks/usePersistedList';
import { useArmyStore } from '@/store/useArmyStore';
import { ArmySummary } from './army-summary/ArmySummary';
import styles from './Build.module.css';
import { Header } from './header/Header';
import { Roster } from './roster/Roster';

export const Build = () => {
  const { armyId } = useParams<{ armyId: string }>();
  const [searchParams] = useSearchParams();
  const army = useArmyStore((s) => s.army);

  usePersistedList(armyId, searchParams.get(LIST_PARAM));

  // The sticky header grows and shrinks (e.g. when global errors appear), so
  // keep measuring it. It is observed directly, not through a wrapper, so no
  // containing block breaks its own `position: sticky`.
  const { ref: headerRef, height: headerHeight } = useElementHeight<HTMLElement>();

  if (!army) {
    return null;
  }

  // Parks the desktop summary rail just below the sticky header, and tells
  // tooltips how much of the top of the screen the header covers.
  const headerOffset = { '--header-height': `${headerHeight}px` } as CSSProperties;

  return (
    <main className={styles.page} style={headerOffset}>
      <Header ref={headerRef} />
      <div className={styles.summaryMobile}>
        <ArmySummary />
      </div>
      <div className={styles.grid}>
        <Roster />
        <div className={styles.summaryDesktop}>
          <ArmySummary />
        </div>
      </div>
    </main>
  );
};
