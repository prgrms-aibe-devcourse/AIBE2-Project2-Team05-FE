import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import styled from 'styled-components';

const HeaderContainer = styled.header`
  padding: 1rem 2rem;
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled(Link)`
  font-size: 1.5rem;
  font-weight: bold;
  text-decoration: none;
  color: #343a40;
`;

const Nav = styled.nav`
  display: flex;
  gap: 1rem;
`;

const NavLink = styled(Link)`
  text-decoration: none;
  color: #495057;
  &:hover {
    color: #212529;
  }
`;

const AuthActions = styled.div`
  display: flex;
  gap: 1rem;
`;

const LogoutButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #495057;
  &:hover {
    color: #212529;
  }
`;

/**
 * 헤더 컴포넌트
 * 로고, 네비게이션 링크, 인증 상태에 따른 UI를 표시합니다.
 */
const Header = () => {
  const { isAuthenticated, logout, user } = useAuth();

  return (
    <HeaderContainer>
      <Logo to="/">Trip'mate</Logo>
      <Nav>
        <NavLink to="/feed">피드</NavLink>
        <NavLink to="/map-test">여행 계획</NavLink>
        <NavLink to="/match">동행 찾기</NavLink>
      </Nav>
      <AuthActions>
        {isAuthenticated ? (
          <>
            <span>{user?.nickname}님 환영합니다!</span>
            <LogoutButton onClick={logout}>로그아웃</LogoutButton>
          </>
        ) : (
          <>
            <NavLink to="/login">로그인</NavLink>
          </>
        )}
      </AuthActions>
    </HeaderContainer>
  );
};

export default Header;
