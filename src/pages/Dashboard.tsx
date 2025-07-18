import React from 'react';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';

/**
 * 대시보드 페이지 - 인증된 사용자만 접근 가능
 */
const Dashboard = () => {
  const { user, logout } = useAuth();

  return (
    <Container>
      <Header>
        <h1>대시보드</h1>
        <p>안녕하세요, {user?.nickname || '사용자'}님!</p>
      </Header>

      <Content>
        <WelcomeSection>
          <h2>트래블메이트에 오신 것을 환영합니다!</h2>
          <p>이곳은 인증된 사용자만 접근할 수 있는 보호된 페이지입니다.</p>
        </WelcomeSection>

        <ActionSection>
          <ActionButton onClick={logout}>로그아웃</ActionButton>
        </ActionSection>
      </Content>
    </Container>
  );
};

// 스타일 컴포넌트
const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
`;

const Header = styled.header`
  text-align: center;
  color: white;
  margin-bottom: 40px;

  h1 {
    font-size: 2.5rem;
    margin-bottom: 10px;
  }

  p {
    font-size: 1.2rem;
    opacity: 0.9;
  }
`;

const Content = styled.main`
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 10px;
  padding: 40px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
`;

const WelcomeSection = styled.section`
  text-align: center;
  margin-bottom: 40px;

  h2 {
    color: #333;
    margin-bottom: 20px;
  }

  p {
    color: #666;
    font-size: 1.1rem;
    line-height: 1.6;
  }
`;

const ActionSection = styled.section`
  text-align: center;
`;

const ActionButton = styled.button`
  background: #ff6b6b;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 5px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.3s;

  &:hover {
    background: #ff5252;
  }
`;

export default Dashboard;
