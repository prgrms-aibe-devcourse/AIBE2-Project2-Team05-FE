import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';
import {
  AiOutlineSearch,
  AiOutlineHeart,
  AiOutlineMessage,
  AiOutlineUser,
} from 'react-icons/ai';
import { FaRegCompass } from 'react-icons/fa';

const Sidebar = () => {
  return (
    <SidebarContainer>
      <Logo>
        <Link to="/">TravelMate</Link>
      </Logo>
      <Nav>
        <StyledNavLink to="/search">
          <AiOutlineSearch /> <span>검색</span>
        </StyledNavLink>
        <StyledNavLink to="/notifications">
          <AiOutlineHeart /> <span>알림</span>
        </StyledNavLink>
        <StyledNavLink to="/match/recommend">
          <FaRegCompass /> <span>여행 메이트 찾기</span>
        </StyledNavLink>
        <StyledNavLink to="/chat">
          <AiOutlineMessage /> <span>채팅</span>
        </StyledNavLink>
      </Nav>
      <Footer>
        <ProfileLink to="/profile">
          <AiOutlineUser />
          <span>프로필</span>
        </ProfileLink>
      </Footer>
    </SidebarContainer>
  );
};

export default Sidebar;

const SidebarContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 240px;
  height: 100vh;
  background-color: #ffffff;
  border-right: 1px solid #dbdbdb;
  padding: 20px;
  position: fixed;
  left: 0;
  top: 0;
`;

const Logo = styled.div`
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 40px;
  padding: 10px 0;

  a {
    text-decoration: none;
    color: #3498db;
  }
`;

const Nav = styled.nav`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`;

const StyledNavLink = styled(NavLink)`
  text-decoration: none;
  color: #2c3e50;
  font-size: 16px;
  font-weight: 500;
  padding: 15px 10px;
  border-radius: 8px;
  margin-bottom: 10px;
  transition:
    background-color 0.2s,
    color 0.2s;
  display: flex;
  align-items: center;

  svg {
    font-size: 24px;
    margin-right: 15px;
  }

  &:hover {
    background-color: #f0f2f5;
  }

  &.active {
    background-color: #e8f0fe;
    color: #3498db;
    font-weight: bold;
  }

  span {
    font-size: 16px;
  }
`;

const Footer = styled.div`
  margin-top: auto;
  border-top: 1px solid #f0f0f0;
  padding-top: 15px;
`;

const ProfileLink = styled(NavLink)`
  display: flex;
  align-items: center;
  text-decoration: none;
  padding: 10px;
  border-radius: 8px;
  color: #2c3e50;
  font-weight: 500;

  svg {
    font-size: 24px;
    margin-right: 15px;
  }

  &:hover {
    background-color: #f0f2f5;
  }

  &.active {
    background-color: #e8f0fe;
    color: #3498db;
  }

  span {
    margin-left: 0;
  }
`;

const ProfileIcon = styled.div`
  font-size: 24px;
`;

const LogoutButton = styled.button`
  width: 100%;
  padding: 12px;
  border: none;
  background-color: #e74c3c;
  color: white;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;

  &:hover {
    background-color: #c0392b;
  }
`;
