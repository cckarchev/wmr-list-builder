import type { ReactNode } from 'react';
import { Routes, Route, Navigate, useParams, useSearchParams } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './screens/Home';
import Build from './screens/Build';
import Print from './screens/Print';
import { armiesById } from './data/armyIndex';

/** Redirect to Home when the URL names an army that does not exist. */
function RequireArmy({ children }: { children: ReactNode }) {
  const { armyId } = useParams<{ armyId: string }>();
  if (!armyId || !armiesById[armyId]) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

/**
 * The embed host (cckarchev) sends query-only links: /?army=<id>&list=<encoded>.
 * Render that army's build directly from the root; otherwise show the picker.
 */
function Root() {
  const [searchParams] = useSearchParams();
  const armyId = searchParams.get('army');
  if (armyId && armiesById[armyId]) {
    return <Build />;
  }
  return <Home />;
}

export default function App() {
  return (
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
}
