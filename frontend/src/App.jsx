import Dashboard from './Dashboard';
import React, { useEffect } from 'react';
import { useNavigate, useLocation, Route, Routes } from 'react-router-dom';
import Forgetpass from './Forgetpass';
import ProtectedRoute from './ProtectedRoute';
import AuthPage from './AuthPage';

function App() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token && location.pathname === '/') {
      navigate('/Dashboard');
    }
  }, [navigate, location.pathname]);  

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {location.pathname !== '/Dashboard' && location.pathname !== '/Forgetpass' && (
        <AuthPage />
      )}
      <Routes>
        <Route path="/" element={<></>} />
        <Route element={<ProtectedRoute />}>
          <Route path="/Dashboard" element={<Dashboard />} />
        </Route>
        <Route path="/Forgetpass" element={<Forgetpass />} />
      </Routes>
    </div>
  );
}

export default App;
