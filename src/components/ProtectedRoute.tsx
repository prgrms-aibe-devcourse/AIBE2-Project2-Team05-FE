import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth();

  // 사용자가 인증되지 않았다면 로그인 페이지로 리디렉션합니다.
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 사용자가 인증되었다면 요청된 컴포넌트를 렌더링합니다.
  return <Outlet />;
};

export default ProtectedRoute; 