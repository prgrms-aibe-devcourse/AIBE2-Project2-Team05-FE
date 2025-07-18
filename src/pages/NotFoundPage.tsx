import styled from 'styled-components';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <Wrapper>
      <ErrorCode>404</ErrorCode>
      <ErrorMessage>페이지를 찾을 수 없습니다.</ErrorMessage>
      <p>요청하신 페이지가 존재하지 않거나, 주소가 잘못되었습니다.</p>
      <HomeLink to="/">홈으로 돌아가기</HomeLink>
    </Wrapper>
  );
};

export default NotFoundPage;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: calc(100vh - 160px); /* 헤더, 푸터 높이 제외 */
  text-align: center;
`;

const ErrorCode = styled.h1`
  font-size: 120px;
  font-weight: bold;
  color: #3498db;
`;

const ErrorMessage = styled.h2`
  font-size: 32px;
  margin-bottom: 20px;
`;

const HomeLink = styled(Link)`
  margin-top: 30px;
  padding: 12px 25px;
  background-color: #3498db;
  color: white;
  text-decoration: none;
  border-radius: 50px;
  font-weight: 500;
  transition: background-color 0.3s;
  
  &:hover {
    background-color: #2980b9;
  }
`; 