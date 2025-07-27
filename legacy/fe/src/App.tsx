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
import FeedListPage from './pages/FeedListPage'; // 새로 만든 목록 페이지
import FeedDetailPage from './pages/FeedDetailPage'; // 방금 만든 상세 페이지
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
import ReviewPage from './pages/ReviewPage';
import ReportManagementPage from './pages/ReportManagementPage';
import LikePage from './pages/LikePage';
import PlanPage from './pages/PlanPage';
import PlanWritePage from './pages/PlanWritePage';
import AdminLoginPage from './pages/AdminLoginPage';
import UserManagementPage from './pages/UserManagementPage';
import FeedManagementPage from './pages/FeedManagementPage';

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
            {/* --- 인증이 필요 없는 공용 경로 --- */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />

            {/* --- 관리자 전용 경로 (인증 필요) --- */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/admin/users" element={<UserManagementPage />} />
              <Route path="/admin/feeds" element={<FeedManagementPage />} />
              <Route path="/admin/reports" element={<ReportManagementPage />} />
            </Route>

            {/* --- 일반 사용자용 경로 (인증 필요 & 메인 레이아웃 사용) --- */}
            <Route element={<ProtectedRoute />}>
              <Route element={<MainLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/feed" element={<FeedListPage />} />
                <Route path="/feed/:id" element={<FeedDetailPage />} />
                <Route path="/match" element={<MatchPage />} />
                <Route
                  path="/match/recommend"
                  element={<MatchRecommendPage />}
                />
                <Route path="/chat" element={<ChatPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/profile/:userId" element={<ProfilePage />} />
                <Route path="/mypage" element={<MyPage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/notifications" element={<NotificationPage />} />
                <Route path="/review" element={<ReviewPage />} />
                <Route path="/report" element={<ReportManagementPage />} />
                <Route path="/map-test" element={<MapTestPage />} />
                <Route path="/likes" element={<LikePage />} />
                <Route path="/plan" element={<PlanPage />} />
                <Route path="/plan/write" element={<PlanWritePage />} />
                <Route path="/plan/edit/:id" element={<PlanWritePage />} />
              </Route>
            </Route>

            {/* --- 404 Not Found --- */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AnimatePresence>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
