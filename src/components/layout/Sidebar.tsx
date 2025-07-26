import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';
import {
  AiOutlineHeart,
  AiOutlineMessage,
  AiOutlineUser,
} from 'react-icons/ai';
import { FaRegCompass, FaRegCalendarPlus } from 'react-icons/fa';

// 아이콘 컴포넌트 타입 에러를 방지하기 위한 래퍼 함수들
// @ts-ignore
const HeartIcon = () => <AiOutlineHeart />;
// @ts-ignore
const MessageIcon = () => <AiOutlineMessage />;
// @ts-ignore
const UserIcon = () => <AiOutlineUser />;
// @ts-ignore
const CompassIcon = () => <FaRegCompass />;
// @ts-ignore
const CalendarIcon = () => <FaRegCalendarPlus />;

const Sidebar = () => {
  const { user } = useAuth();

  // 프로필 링크 결정: 닉네임이 있으면 닉네임으로, 없으면 기본 프로필로
  const profileLink = user?.nickname ? `/profile/${user.nickname}` : '/profile';

  return (
    <SidebarContainer>
      <Logo>
        <Link to="/">TravelMate</Link>
      </Logo>
      <Nav>
        <StyledNavLink to="/plan/write">
          <CalendarIcon /> <span>여행 플랜 만들기</span>
        </StyledNavLink>
        <StyledNavLink to="/match/recommend">
          <CompassIcon /> <span>여행 메이트 찾기</span>
        </StyledNavLink>
        <StyledNavLink to="/notifications">
          <HeartIcon /> <span>알림</span>
        </StyledNavLink>
        <StyledNavLink to="/chat">
          <MessageIcon /> <span>채팅</span>
        </StyledNavLink>
      </Nav>
      <Footer>
        <ProfileLink to={profileLink}>
          <UserIcon />
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
  width: 200px; /* 다시 200px로 */
  height: 100vh;
  background-color: #ffffff;
  border-right: 1px solid #dbdbdb;
  padding: 20px 20px 20px 25px; /* 왼쪽 25px, 오른쪽 20px으로 여백 확보 */
  position: fixed;
  left: 0;
  top: 0;
`;

const Logo = styled.div`
  font-size: 22px; /* 원래대로 복구 */
  font-weight: bold;
  margin-bottom: 30px; /* 원래대로 복구 */
  padding: 8px 0; /* 원래대로 복구 */

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
  font-size: 15px; /* 원래대로 복구 */
  font-weight: 500;
  padding: 12px 8px; /* 원래대로 복구 */
  border-radius: 8px;
  margin-bottom: 8px; /* 원래대로 복구 */
  transition:
    background-color 0.2s,
    color 0.2s;
  display: flex;
  align-items: center;

  svg {
    font-size: 22px; /* 원래대로 복구 */
    margin-right: 12px; /* 원래대로 복구 */
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
    font-size: 15px; /* 원래대로 복구 */
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

// 사용되지 않는 styled components 제거됨 (경고 해결)
