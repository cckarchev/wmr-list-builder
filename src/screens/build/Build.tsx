import type { CSSProperties } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { ARMY_PARAM, LIST_PARAM } from '@/core/share-link/shareLink';
import { useElementHeight } from '@/hooks/useElementHeight';
import { useArmyStore } from '@/store/useArmyStore';
import { ArmySummary } from './army-summary/ArmySummary';
import styles from './Build.module.css';
import { Header } from './header/Header';
import { Roster } from './roster/Roster';
import { usePersistedList } from './usePersistedList';

export const Build = () => {
  const { armyId: paramArmyId } = useParams<{ armyId: string }>();
  const [searchParams] = useSearchParams();
  const army = useArmyStore((s) => s.army);

  // Embedded query-only links (/?army=<id>) carry the army in the query string;
  // the /build/:armyId route carries it in the path. Accept either.
  const armyId = paramArmyId ?? searchParams.get(ARMY_PARAM) ?? undefined;

  usePersistedList(armyId, searchParams.get(LIST_PARAM));

  // The sticky header grows and shrinks (e.g. when global errors appear), so
  // keep measuring it. It is observed directly, not through a wrapper, so no
  // containing block breaks its own `position: sticky`.
  const { ref: headerRef, height: headerHeight } = useElementHeight<HTMLElement>();

  if (!army) {
    return null;
  }

  // Parks the desktop summary rail just below the sticky header.
  const summaryOffset = { '--header-height': `${headerHeight}px` } as CSSProperties;

  return (
    <main className={styles.page}>
      <Header ref={headerRef} />
      <div className={styles.summaryMobile}>
        <ArmySummary />
      </div>
      <div className={styles.grid}>
        <Roster />
        <div className={styles.summaryDesktop} style={summaryOffset}>
          <ArmySummary />
        </div>
      </div>
    </main>
  );
};
