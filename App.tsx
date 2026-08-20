import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Navigate, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';

const Home = lazy(() => import('./src/pages/Home'));
const Admin = lazy(() => import('./src/pages/Admin'));
const ClientPortal = lazy(() => import('./src/pages/ClientPortal'));
const Legal = lazy(() => import('./src/pages/Legal'));

function App() {
  return (
    <Router>
      <Toaster position="top-right" theme="dark" />
      <Suspense fallback={<div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">Chargement...</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/portal" element={<ClientPortal />} />
          <Route path="/careers" element={<Navigate to="/" replace />} />
          <Route path="/mentions-legales" element={<Legal type="legal" />} />
          <Route path="/confidentialite" element={<Legal type="privacy" />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
