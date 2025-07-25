import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Sidebar from './layout/Sidebar';
import styled, { keyframes } from 'styled-components';

// --- 추가: 페이드 인 애니메이션 정의 ---
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

/**
 * 로그인한 사용자에게 보여줄 메인 레이아웃 컴포넌트입니다.
 * 헤더와 페이지의 메인 콘텐츠를 포함합니다.
 */
const MainLayout = () => {
  const location = useLocation();
  const sidebarRoutes = [
    '/',
    '/match/recommend',
    '/chat',
    '/mypage',
    '/search',
    '/notifications',
    '/profile',
    '/likes',
  ];
  const showSidebar = sidebarRoutes.some((route) =>
    location.pathname.startsWith(route),
  );

  return (
    <div>
      {showSidebar ? <Sidebar /> : <Header />}
      {/* --- 수정: key 속성을 추가합니다 --- */}
      <MainContent key={location.pathname} showSidebar={showSidebar}>
        <Outlet />
      </MainContent>
    </div>
  );
};

export default MainLayout;

const MainContent = styled.main<{ showSidebar: boolean }>`
  margin-left: ${(props) => (props.showSidebar ? '220px' : '0')};
  min-height: 100vh;
  transition: all 0.3s ease;

  // --- 수정: 애니메이션 지속 시간을 0.3s로 변경 ---
  animation: ${fadeIn} 0.3s ease-in-out;
`;
