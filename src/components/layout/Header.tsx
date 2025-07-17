import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
// import { RiMenuLine, RiCloseLine } from 'react-icons/ri'; // 아이콘 라이브러리 필요 시

const Header = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <Navbar>
      <Logo onClick={() => navigate('/')}>
        Travel<span>Mate</span>
      </Logo>
      <NavLinks className={isMenuOpen ? 'open' : ''}>
        <li>
          <Link to="/feed" onClick={toggleMenu}>
            피드
          </Link>
        </li>
        <li>
          <Link to="/match" onClick={toggleMenu}>
            여행 메이트 찾기
          </Link>
        </li>
        <li>
          <Link to="/chat" onClick={toggleMenu}>
            채팅
          </Link>
        </li>
        <li>
          <Link to="/profile" onClick={toggleMenu}>
            마이페이지
          </Link>
        </li>
        <AuthButtonsMobile>
          <LoginButton onClick={() => navigate('/login')}>로그인</LoginButton>
          <SignupButton onClick={() => navigate('/signup')}>회원가입</SignupButton>
        </AuthButtonsMobile>
        <ThemeToggleButtonMobile onClick={toggleTheme}>
          {theme === 'light' ? 'Dark' : 'Light'} Mode
        </ThemeToggleButtonMobile>
      </NavLinks>
      <DesktopActionButtons>
        <ThemeToggleButton onClick={toggleTheme}>
          {theme === 'light' ? 'Dark' : 'Light'} Mode
        </ThemeToggleButton>
        <AuthButtons>
          <LoginButton onClick={() => navigate('/login')}>로그인</LoginButton>
          <SignupButton onClick={() => navigate('/signup')}>회원가입</SignupButton>
        </AuthButtons>
      </DesktopActionButtons>
      <MenuIcon onClick={toggleMenu}>
        {/* {isMenuOpen ? <RiCloseLine /> : <RiMenuLine />} */}
        <span>☰</span>
      </MenuIcon>
    </Navbar>
  );
};

export default Header;

const Navbar = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 60px;
  background-color: #fff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 1000;
  font-family: 'NotoSansHans', sans-serif;
`;

const Logo = styled.div`
  font-size: 28px;
  font-weight: 700;
  color: #3498db;
  cursor: pointer;

  span {
    color: #2c3e50;
  }
`;

const NavLinks = styled.ul`
  display: flex;
  list-style: none;

  li {
    margin-left: 40px;
  }

  a {
    text-decoration: none;
    color: #2c3e50;
    font-weight: 500;
    font-size: 16px;
    transition: color 0.3s;

    &:hover {
      color: #3498db;
    }
  }

  @media (max-width: 1024px) {
    display: none;
    flex-direction: column;
    position: absolute;
    top: 80px;
    left: 0;
    width: 100%;
    background-color: #fff;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    
    &.open {
      display: flex;
    }

    li {
      margin: 0;
      width: 100%;
    }

    a {
      display: block;
      padding: 15px 20px;
      width: 100%;
      text-align: center;
      border-bottom: 1px solid #f0f0f0;
    }
  }
`;

const AuthButtons = styled.div`
  display: flex;
  align-items: center;

  @media (max-width: 1024px) {
    display: none;
  }
`;

const AuthButtonsMobile = styled.div`
  display: none;
  padding: 20px;
  
  @media (max-width: 1024px) {
    display: flex;
    justify-content: center;
  }
`;

const AuthButton = styled.button`
  padding: 10px 20px;
  border-radius: 50px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s;
  font-family: 'NotoSansHans', sans-serif;
`;

const LoginButton = styled(AuthButton)`
  background: none;
  border: 1px solid #3498db;
  color: #3498db;
  margin-right: 15px;

  &:hover {
    background: rgba(52, 152, 219, 0.1);
  }
`;

const SignupButton = styled(AuthButton)`
  background: #3498db;
  border: none;
  color: white;

  &:hover {
    background: #2980b9;
  }
`;

const MenuIcon = styled.div`
  display: none;
  font-size: 28px;
  cursor: pointer;

  @media (max-width: 1024px) {
    display: block;
  }
`; 

const ActionButtons = styled.div`
  display: flex;
  align-items: center;
`;

const ThemeToggleButton = styled.button`
  background: none;
  border: 1px solid #ccc;
  padding: 8px 12px;
  border-radius: 20px;
  cursor: pointer;
  margin-right: 20px;
`; 

const ThemeToggleButtonMobile = styled(ThemeToggleButton)`
  display: none;
  margin: 10px auto;
  @media (max-width: 1024px) {
    display: block;
  }
`;

const DesktopActionButtons = styled.div`
  display: flex;
  align-items: center;
  @media (max-width: 1024px) {
    display: none;
  }
`; 