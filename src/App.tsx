import React from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ErrorBoundary } from 'react-error-boundary';
import { Toaster } from 'react-hot-toast';

import { AuthProvider } from './contexts/AuthContext';
import { GlobalStyle } from './styles/GlobalStyle';

import MainLayout from './components/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorFallback from './components/common/ErrorFallback';

import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import Dashboard from './pages/Dashboard';
import MapTestPage from './pages/MapTestPage';
import FeedPage from './pages/FeedPage';
import MatchPage from './pages/MatchPage';
import MatchRecommendPage from './pages/MatchRecommendPage';
import ChatPage from './pages/ChatPage';
import ProfilePage from './pages/ProfilePage';
import MyPage from './pages/MyPage';
import NotFoundPage from './pages/NotFoundPage';
import HomePage from './pages/HomePage';
import Layout from './components/layout/Layout';
import SearchPage from './pages/SearchPage';
import NotificationPage from './pages/NotificationPage';

function App() {
  const location = useLocation();

  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => {
        window.location.reload();
      }}
    >
      <AuthProvider>
        <GlobalStyle />
        <Toaster position="top-center" reverseOrder={false} />
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            {/* 인증이 필요 없는 경로 */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            {/* 메인 레이아웃을 사용하는 경로 (인증 필요) */}
            <Route element={<ProtectedRoute />}>
              <Route element={<MainLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/map-test" element={<MapTestPage />} />
                <Route
                  path="/match/recommend"
                  element={<MatchRecommendPage />}
                />
              </Route>
            </Route>

            {/* 기본 레이아웃을 사용하는 경로 */}
            <Route element={<Layout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/notifications" element={<NotificationPage />} />
              <Route path="/feed" element={<HomePage />} />
              <Route path="/feed/:id" element={<FeedPage />} />
              <Route path="/match" element={<MatchPage />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/mypage" element={<MyPage />} />
            </Route>

            {/* 404 Not Found */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AnimatePresence>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
