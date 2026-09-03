import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';

export default function App() {
  return (
    <Router basename="/Sports-performance-analytics-dashboard/">
      <div className="min-h-screen bg-slate-950 text-slate-50">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}
