import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Football from './pages/Football';
import F1 from './pages/F1';
import MotoGP from './pages/MotoGP';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userPreferences, setUserPreferences] = useState({
    footballTeam: '',
    f1Team: '',
    motogpTeam: ''
  });

  return (
    <Router>
      <div className="min-h-screen bg-slate-950 text-slate-50">
        <Routes>
          <Route 
            path="/login" 
            element={<Login setIsAuthenticated={setIsAuthenticated} setUserPreferences={setUserPreferences} />} 
          />
          <Route 
            path="/" 
            element={isAuthenticated ? <Home /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/football" 
            element={isAuthenticated ? <Football /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/f1" 
            element={isAuthenticated ? <F1 /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/motogp" 
            element={isAuthenticated ? <MotoGP /> : <Navigate to="/login" />} 
          />
        </Routes>
      </div>
    </Router>
  );
}
