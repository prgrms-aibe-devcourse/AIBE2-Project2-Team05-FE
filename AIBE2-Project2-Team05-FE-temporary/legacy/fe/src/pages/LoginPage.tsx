import React from 'react';
import styled from 'styled-components';
import LoginForm from '../components/LoginForm';

const LoginPage: React.FC = () => {
  return (
    <Container>
      <MainContent>
        <ImageSection>
          <ImageOverlay />
          <TravelIllustration>
            <i className="ri-plane-line travel-icon"></i>
          </TravelIllustration>
          <ImageText>
            <h2>다시, 여행의 설렘 속으로</h2>
            <p>
              트래블메이트와 함께 떠났던 여행의 추억을 이어가보세요. 새로운
              동행이 당신을 기다립니다.
            </p>
          </ImageText>
        </ImageSection>
        <FormSection>
          <FormContainer>
            <FormHeader>
              <h1>로그인</h1>
              <p>여행의 다음 챕터를 시작해보세요.</p>
            </FormHeader>
            <LoginForm />
          </FormContainer>
        </FormSection>
      </MainContent>
    </Container>
  );
};

export default LoginPage;

// AuthPage.tsx의 스타일 컴포넌트들을 그대로 가져와서 사용합니다.
// (코드의 재사용성을 위해 별도의 스타일 파일로 분리하는 것을 고려할 수 있습니다.)

const Container = styled.div`
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
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
`;

const FormContainer = styled.div`
  width: 100%;
  max-width: 500px;
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
