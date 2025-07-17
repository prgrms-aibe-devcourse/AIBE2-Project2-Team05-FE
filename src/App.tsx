import React from 'react';
import { Route, Routes } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import MapTestPage from './pages/MapTestPage';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header'; // Header 컴포넌트 import
import { AuthProvider } from './contexts/AuthContext'; // AuthProvider import

function App() {
  return (
    <AuthProvider>
      <Header />
      <Routes>
        <Route path="/login" element={<AuthPage />} />
        <Route path="/map-test" element={<MapTestPage />} />
        <Route path="/" element={<ProtectedRoute />}>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
