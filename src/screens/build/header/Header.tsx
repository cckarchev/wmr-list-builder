import type { Ref } from 'react';
import { classNames } from '@/core/classNames';
import styles from './Header.module.css';
import { ListActions } from './list-actions/ListActions';
import { StatusStrip } from './status-strip/StatusStrip';
import { TitleBlock } from './title-block/TitleBlock';

interface HeaderProps {
  ref?: Ref<HTMLElement>;
}

export const Header = ({ ref }: HeaderProps) => (
  <header ref={ref} className={classNames(styles.bar, 'no-print')} data-testid="points-bar">
    <div className={styles.titleZone}>
      <TitleBlock />
      <div className={styles.actions} data-layout="inline" data-testid="actions-inline">
        <ListActions />
      </div>
      <div className={styles.actions} data-layout="menu" data-testid="actions-menu">
        <ListActions />
      </div>
    </div>
    <StatusStrip />
  </header>
);
