import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import styled from 'styled-components';
import Sidebar from './Sidebar';

const Layout = () => {
  const location = useLocation();
  const sidebarRoutes = ['/', '/match/recommend', '/chat', '/mypage'];
  const showSidebar = sidebarRoutes.some((route) =>
    location.pathname.startsWith(route),
  );

  return (
    <>
      {showSidebar ? <Sidebar /> : <Header />}
      <MainContent showSidebar={showSidebar}>
        <Outlet />
      </MainContent>
      {!showSidebar && <Footer />}
    </>
  );
};

export default Layout;

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
