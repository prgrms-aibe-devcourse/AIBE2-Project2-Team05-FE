import styled from 'styled-components';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <FooterWrapper>
      <FooterContainer>
        <FooterCol>
          <h3>트래블메이트</h3>
          <p>새로운 여행 동반자를 찾고, 특별한 여행 경험을 만들어보세요.</p>
          <SocialLinks>
            {/* 아이콘 라이브러리 추가 후 <i className="ri-instagram-line"></i> 등으로 대체 */}
            <a href="#">Insta</a>
            <a href="#">Fb</a>
            <a href="#">Twit</a>
            <a href="#">YT</a>
          </SocialLinks>
        </FooterCol>
        <FooterCol>
          <h3>서비스</h3>
          <ul>
            <li><Link to="/planning">여행 계획</Link></li>
            <li><Link to="/matching">매칭 시스템</Link></li>
            <li><Link to="/chat">채팅</Link></li>
            <li><Link to="/feed">여행 피드</Link></li>
            <li><Link to="/reviews">리뷰</Link></li>
          </ul>
        </FooterCol>
        <FooterCol>
          <h3>지원</h3>
          <ul>
            <li><Link to="/faq">자주 묻는 질문</Link></li>
            <li><Link to="/support">고객 지원</Link></li>
            <li><Link to="/safety">안전 가이드</Link></li>
            <li><Link to="/tips">매칭 팁</Link></li>
          </ul>
        </FooterCol>
        <FooterCol>
          <h3>법적 정보</h3>
          <ul>
            <li><Link to="/terms">이용약관</Link></li>
            <li><Link to="/privacy">개인정보처리방침</Link></li>
            <li><Link to="/cookies">쿠키 정책</Link></li>
            <li><Link to="/copyright-info">저작권 정보</Link></li>
          </ul>
        </FooterCol>
      </FooterContainer>
      <Copyright>
        &copy; 2024 트래블메이트. All rights reserved.
      </Copyright>
    </FooterWrapper>
  );
};

export default Footer;

const FooterWrapper = styled.footer`
  background-color: #2c3e50;
  color: #ecf0f1;
  padding: 80px 60px 20px;
  font-family: 'NotoSansHans', sans-serif;
`;

const FooterContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 40px;
  flex-wrap: wrap;
`;

const FooterCol = styled.div`
  width: 23%;
  margin-bottom: 30px;

  h3 {
    font-size: 20px;
    margin-bottom: 20px;
    color: #fff;
    font-weight: 700;
  }

  p {
    font-size: 14px;
    color: #bdc3c7;
    margin-bottom: 20px;
  }

  ul {
    list-style: none;
  }

  li {
    margin-bottom: 10px;
  }

  a {
    text-decoration: none;
    color: #bdc3c7;
    font-size: 14px;
    transition: color 0.3s;
    &:hover {
      color: #3498db;
    }
  }
`;

const SocialLinks = styled.div`
  a {
    display: inline-block;
    margin-right: 15px;
    font-size: 20px;
    color: #fff;
    &:hover {
      color: #3498db;
    }
  }
`;

const Copyright = styled.div`
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid #34495e;
  font-size: 14px;
  color: #7f8c8d;
`; 