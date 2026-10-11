import { Outlet } from 'react-router-dom';
import Nav from './Nav';
import ScrollToTop from './ScrollToTop';

const Layout = () => (
  <>
    <ScrollToTop />
    <Nav />
    <Outlet />
  </>
);

export default Layout;
