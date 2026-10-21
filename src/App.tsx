import type { ReactNode } from 'react';
import { Navigate, Route, Routes, useParams } from 'react-router-dom';
import { findArmy } from '@/data/armyIndex';
import { Layout } from '@/layout/Layout';
import { About } from '@/screens/about/About';
import { Build } from '@/screens/build/Build';
import { Home } from '@/screens/home/Home';
import { Print } from '@/screens/print/Print';

/** Redirect to Home when the URL names an army that does not exist. */
const RequireArmy = ({ children }: { children: ReactNode }) => {
  const { armyId } = useParams<{ armyId: string }>();

  if (!armyId || !findArmy(armyId)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export const App = () => (
  <Routes>
    <Route element={<Layout />}>
      <Route path="/" element={<Home />} />
      <Route
        path="/build/:armyId"
        element={
          <RequireArmy>
            <Build />
          </RequireArmy>
        }
      />
      <Route
        path="/print/:armyId"
        element={
          <RequireArmy>
            <Print />
          </RequireArmy>
        }
      />
      <Route path="/about" element={<About />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Route>
  </Routes>
);
