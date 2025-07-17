import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';

/**
 * 로그인한 사용자에게 보여줄 메인 레이아웃 컴포넌트입니다.
 * 헤더와 페이지의 메인 콘텐츠를 포함합니다.
 */
const MainLayout = () => {
  return (
    <div>
      <Header />
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
