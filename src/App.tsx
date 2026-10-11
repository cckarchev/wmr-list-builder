import type { ReactNode } from 'react';
import { Navigate, Route, Routes, useParams, useSearchParams } from 'react-router-dom';
import { armiesById } from '@/data/armyIndex';
import { Layout } from '@/layout/Layout';
import { Build } from '@/screens/build/Build';
import { Home } from '@/screens/home/Home';
import { Print } from '@/screens/print/Print';

/** Redirect to Home when the URL names an army that does not exist. */
const RequireArmy = ({ children }: { children: ReactNode }) => {
  const { armyId } = useParams<{ armyId: string }>();

  if (!armyId || !armiesById[armyId]) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

/**
 * The embed host (cckarchev) sends query-only links: /?army=<id>&list=<encoded>.
 * Render that army's build directly from the root; otherwise show the picker.
 */
const Root = () => {
  const [searchParams] = useSearchParams();
  const armyId = searchParams.get('army');

  if (armyId && armiesById[armyId]) {
    return <Build />;
  }

  return <Home />;
};

export const App = () => (
  <Routes>
    <Route element={<Layout />}>
      <Route path="/" element={<Root />} />
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
      <Route path="*" element={<Navigate to="/" replace />} />
    </Route>
  </Routes>
);
