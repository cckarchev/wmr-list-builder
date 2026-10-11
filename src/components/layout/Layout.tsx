import { Outlet } from 'react-router-dom';
import { Nav } from './Nav';
import { ScrollToTop } from './ScrollToTop';

export const Layout = () => (
  <>
    <ScrollToTop />
    <Nav />
    <Outlet />
  </>
);
