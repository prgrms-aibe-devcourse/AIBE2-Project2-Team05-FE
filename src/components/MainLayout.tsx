import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Sidebar from './layout/Sidebar';
import styled from 'styled-components';

/**
 * 로그인한 사용자에게 보여줄 메인 레이아웃 컴포넌트입니다.
 * 헤더와 페이지의 메인 콘텐츠를 포함합니다.
 */
const MainLayout = () => {
  const location = useLocation();
  const sidebarRoutes = ['/match/recommend', '/chat', '/mypage'];
  const showSidebar = sidebarRoutes.some((route) =>
    location.pathname.startsWith(route),
  );

  return (
    <div>
      {showSidebar ? <Sidebar /> : <Header />}
      <MainContent showSidebar={showSidebar}>
        <Outlet />
      </MainContent>
    </div>
  );
};

export default MainLayout;

const MainContent = styled.main<{ showSidebar: boolean }>`
  padding-top: ${(props) => (props.showSidebar ? '40px' : '80px')};
  padding-left: ${(props) =>
    props.showSidebar
      ? '300px'
      : '60px'}; /* Sidebar 240px + Content Padding 60px */
  padding-right: 60px;
  min-height: 100vh;
  transition: all 0.3s ease;
`;
