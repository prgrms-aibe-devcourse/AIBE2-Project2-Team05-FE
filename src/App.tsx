import React from 'react';
import { Route, Routes } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import { Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { GlobalStyle } from './styles/GlobalStyle';
import AuthPage from './pages/AuthPage';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import FeedPage from './pages/FeedPage';
import MatchPage from './pages/MatchPage';
import ChatPage from './pages/ChatPage';
import ProfilePage from './pages/ProfilePage';
import MyPage from './pages/MyPage';
import NotFoundPage from './pages/NotFoundPage';
import SignupPage from './pages/SignupPage';
import { ErrorBoundary } from 'react-error-boundary';
import ErrorFallback from './components/common/ErrorFallback';
import { Toaster } from 'react-hot-toast';
import Dashboard from './pages/Dashboard';
import MapTestPage from './pages/MapTestPage';
import FeedPage from './pages/FeedPage';
import MatchPage from './pages/MatchPage';
import MatchRecommendPage from './pages/MatchRecommendPage';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/MainLayout';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  const location = useLocation();

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
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => {
        // 리셋 로직, 예: 상태 초기화
        window.location.reload();
      }}
    >
      <GlobalStyle />
      <Toaster position="top-center" reverseOrder={false} />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/feed" element={<HomePage />} /> {/* /feed도 홈으로 연결 */}
            <Route path="/feed/:id" element={<FeedPage />} /> {/* 상세 페이지 */}
            <Route path="/match" element={<MatchPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/mypage" element={<MyPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
          <Route path="/login" element={<AuthPage />} />
          <Route path="/signup" element={<SignupPage />} />
        </Routes>
      </AnimatePresence>
    </ErrorBoundary>
  );
}

export default App;
