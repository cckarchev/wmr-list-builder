import { Outlet } from 'react-router-dom';
import { Footer } from './footer/Footer';
import styles from './Layout.module.css';
import { Nav } from './nav/Nav';
import { ScrollToTop } from './ScrollToTop';

export const Layout = () => (
  <div className={styles.shell}>
    <ScrollToTop />
    <Nav />
    <Outlet />
    <Footer />
  </div>
);
