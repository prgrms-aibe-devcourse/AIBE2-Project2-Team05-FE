import React from 'react';
import { Route, Routes } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import Dashboard from './pages/Dashboard';
import MapTestPage from './pages/MapTestPage';
import FeedPage from './pages/FeedPage';
import MatchPage from './pages/MatchPage';
import MatchRecommendPage from './pages/MatchRecommendPage';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/MainLayout';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* 로그인이 필요 없는 페이지들 */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* 로그인이 필요한 페이지들 */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/map-test" element={<MapTestPage />} />
            <Route path="/feed" element={<FeedPage />} />
            <Route path="/match" element={<MatchPage />} />
            <Route path="/match/recommend" element={<MatchRecommendPage />} />
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
