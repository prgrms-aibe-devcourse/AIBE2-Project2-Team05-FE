import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * 보호된 라우트 컴포넌트
 * 인증된 사용자만 접근할 수 있으며, 인증되지 않은 사용자는 로그인 페이지로 리디렉션됩니다.
 */
const ProtectedRoute = () => {
  const { isAuthenticated, user, isLoading } = useAuth();

  // 디버깅을 위한 로그 출력
  console.log('ProtectedRoute - isLoading:', isLoading);
  console.log('ProtectedRoute - isAuthenticated:', isAuthenticated);
  console.log('ProtectedRoute - user:', user);
  console.log(
    'ProtectedRoute - localStorage token:',
    localStorage.getItem('accessToken'),
  );

  // 로딩 중일 때는 로딩 화면 표시
  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontSize: '18px',
        }}
      >
        로딩 중...
      </div>
    );
  }

  // 사용자가 인증되지 않았다면 로그인 페이지로 리디렉션
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 사용자가 인증되었다면 요청된 컴포넌트를 렌더링
  return <Outlet />;
};

export default ProtectedRoute;
