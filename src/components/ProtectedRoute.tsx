import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * 보호된 라우트 컴포넌트
 * 인증된 사용자만 접근할 수 있으며, 인증되지 않은 사용자는 로그인 페이지로 리디렉션됩니다.
 */
const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth();

  // 사용자가 인증되지 않았다면 로그인 페이지로 리디렉션
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 사용자가 인증되었다면 요청된 컴포넌트를 렌더링
  return <Outlet />;
};

export default ProtectedRoute;
