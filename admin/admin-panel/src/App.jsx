// Update your App.jsx to include all pages
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './components/layouts/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import Events from './pages/admin/Event';
import Teams from './pages/admin/Team';
import Matches from './pages/admin/Matches';
import Settings from './pages/admin/Settings';
// import ManualRegister from './pages/admin/ManualRegister';

function App() {
  return (
    <Router>
      <Routes>
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="events" element={<Events />} />
          <Route path="teams" element={<Teams />} />
          <Route path="matches" element={<Matches />} />
          {/* <Route path="register" element={<ManualRegister />} /> */}
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Redirect to admin dashboard */}
        <Route path="/" element={<Navigate to="/admin" replace />} />
        
        {/* 404 Route */}
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </Router>
  );
}

export default App;