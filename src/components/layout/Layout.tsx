import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import * as S from './Layout.style';

const Layout = () => {
  return (
    <S.Wrapper>
      <Header />
      <S.Main>
        <Outlet />
      </S.Main>
      <Footer />
    </S.Wrapper>
  );
};

export default Layout; 