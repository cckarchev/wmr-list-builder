import { Outlet } from 'react-router-dom';
import { Nav } from './nav/Nav';
import { ScrollToTop } from './ScrollToTop';

export const Layout = () => (
  <>
    <ScrollToTop />
    <Nav />
    <Outlet />
  </>
);
