import React, { useState } from 'react';
import styled from 'styled-components';
import LoginForm from '../components/LoginForm';
import SignupForm from '../components/SignupForm';
import { Link } from 'react-router-dom';

const AuthPage = () => {
  const [activeTab, setActiveTab] = useState('login');

  return (
    <Container>
      <Navbar>
        <Logo to="/">
          <i className="ri-earth-line"></i>
          트래블메이트
        </Logo>
        <NavLinks>
          <Link to="/">홈</Link>
          <Link to="/matching">여행 매칭</Link>
          <Link to="/info">여행지 정보</Link>
          <Link to="/support">고객센터</Link>
        </NavLinks>
      </Navbar>
      <MainContent>
        <ImageSection>
          <ImageOverlay />
          <TravelIllustration>
            <i className="ri-plane-line travel-icon"></i>
          </TravelIllustration>
          <ImageText>
            <h2>새로운 여행의 시작</h2>
            <p>
              트래블메이트와 함께 나에게 딱 맞는 여행 친구를 찾고, 잊지 못할
              추억을 만들어보세요. 전 세계 어디서든 당신의 여행을 더 특별하게
              만들어 드립니다.
            </p>
          </ImageText>
        </ImageSection>
        <FormSection>
          <FormContainer>
            <FormHeader>
              <h1>트래블메이트에 오신 것을 환영합니다</h1>
              <p>계정에 로그인하거나 새 계정을 만들어보세요</p>
            </FormHeader>
            <Tabs>
              <Tab
                active={activeTab === 'login'}
                onClick={() => setActiveTab('login')}
              >
                로그인
              </Tab>
              <Tab
                active={activeTab === 'signup'}
                onClick={() => setActiveTab('signup')}
              >
                회원가입
              </Tab>
            </Tabs>
            {activeTab === 'login' ? <LoginForm /> : <SignupForm />}
          </FormContainer>
        </FormSection>
      </MainContent>
      <Footer>
        <FooterLinks>
          <Link to="/terms">이용약관</Link>
          <Link to="/privacy">개인정보처리방침</Link>
          <Link to="/about">회사소개</Link>
          <Link to="/support">고객센터</Link>
        </FooterLinks>
        <FooterText>© 2023 트래블메이트. All rights reserved.</FooterText>
      </Footer>
    </Container>
  );
};

export default AuthPage;

const Container = styled.div`
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const Navbar = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 40px;
  background-color: #ffffff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  position: relative;
  z-index: 10;
`;

const Logo = styled(Link)`
  font-size: 24px;
  font-weight: bold;
  color: #3498db;
  text-decoration: none;
  display: flex;
  align-items: center;
  i {
    margin-right: 8px;
    font-size: 28px;
  }
`;

const NavLinks = styled.div`
  a,
  & > a {
    margin-left: 20px;
    text-decoration: none;
    color: #555;
    font-weight: 500;
    transition: color 0.3s;
    &:hover {
      color: #3498db;
    }
  }
`;

const MainContent = styled.div`
  display: flex;
  flex: 1;
`;

const ImageSection = styled.div`
  width: 50%;
  background: linear-gradient(135deg, #3498db, #1abc9c);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 40px;
  color: white;
  position: relative;
  overflow: hidden;
`;

const ImageOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.2);
  z-index: 1;
`;

const TravelIllustration = styled.div`
  width: 100%;
  height: 400px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  margin-bottom: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  z-index: 2;
  .travel-icon {
    font-size: 180px;
    color: rgba(255, 255, 255, 0.9);
  }
`;

const ImageText = styled.div`
  text-align: center;
  z-index: 2;
  h2 {
    font-size: 36px;
    margin-bottom: 15px;
    font-weight: bold;
  }
  p {
    font-size: 18px;
    line-height: 1.6;
    max-width: 80%;
    margin: 0 auto;
  }
`;

const FormSection = styled.div`
  width: 50%;
  padding: 60px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #ffffff;
  min-height: calc(100vh - 140px); /* 네비게이션과 푸터 높이 제외 */
`;

const FormContainer = styled.div`
  width: 100%;
  max-width: 500px;
  min-height: 650px; /* 충분한 높이 보장 */
  display: flex;
  flex-direction: column;
  justify-content: flex-start; /* 상단 정렬로 변경 */
`;

const FormHeader = styled.div`
  text-align: center;
  margin-bottom: 40px;
  h1 {
    font-size: 32px;
    color: #333;
    margin-bottom: 10px;
  }
  p {
    color: #777;
    font-size: 16px;
  }
`;

const Tabs = styled.div`
  display: flex;
  margin-bottom: 30px;
  border-bottom: 1px solid #eee;
`;

const Tab = styled.div<{ active: boolean }>`
  padding: 15px 30px;
  font-size: 18px;
  font-weight: 500;
  color: ${(props) => (props.active ? '#3498db' : '#777')};
  cursor: pointer;
  position: relative;
  transition: all 0.3s;
  &::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    width: 100%;
    height: 3px;
    background-color: ${(props) => (props.active ? '#3498db' : 'transparent')};
  }
`;

const Footer = styled.footer`
  background-color: #f8f9fa;
  padding: 20px 40px;
  text-align: center;
  border-top: 1px solid #eee;
`;

const FooterLinks = styled.div`
  margin-bottom: 10px;
  a,
  & > a {
    color: #777;
    text-decoration: none;
    margin: 0 10px;
    font-size: 14px;
  }
`;

const FooterText = styled.p`
  color: #999;
  font-size: 12px;
`;
