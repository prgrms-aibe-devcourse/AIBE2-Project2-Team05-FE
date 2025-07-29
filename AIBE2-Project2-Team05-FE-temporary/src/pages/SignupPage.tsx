import React from 'react';
import styled from 'styled-components';
import SignupForm from '../components/SignupForm';

const SignupPage: React.FC = () => {
  return (
    <Container>
      <MainContent>
        <ImageSection>
          <ImageOverlay />
          <TravelIllustration>
            <i className="ri-user-add-line travel-icon"></i>
          </TravelIllustration>
          <ImageText>
            <h2>새로운 여행의 시작</h2>
            <p>
              트래블메이트와 함께 나에게 꼭 맞는 여행 친구를 찾고, 잊지 못할
              추억을 만들어보세요.
            </p>
          </ImageText>
        </ImageSection>
        <FormSection>
          <FormContainer>
            <SignupForm />
          </FormContainer>
        </FormSection>
      </MainContent>
    </Container>
  );
};

export default SignupPage;

// LoginPage와 동일한 스타일 컴포넌트를 사용합니다.
const Container = styled.div`
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const MainContent = styled.div`
  display: flex;
  flex: 1;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const ImageSection = styled.div`
  width: 50%;
  background: linear-gradient(135deg, #1abc9c, #3498db);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 40px;
  color: white;
  position: relative;
  overflow: hidden;
  
  @media (max-width: 768px) {
    width: 100%;
    min-height: 300px;
    padding: 20px;
  }
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
  
  @media (max-width: 768px) {
    height: 200px;
    margin-bottom: 20px;
    .travel-icon {
      font-size: 120px;
    }
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
  
  @media (max-width: 768px) {
    h2 {
      font-size: 24px;
      margin-bottom: 10px;
    }
    p {
      font-size: 14px;
      max-width: 90%;
    }
  }
`;

const FormSection = styled.div`
  width: 50%;
  padding: 20px 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #ffffff;
  overflow: hidden;
  
  @media (max-width: 768px) {
    width: 100%;
    padding: 20px;
    min-height: calc(100vh - 300px);
  }
`;

const FormContainer = styled.div`
  width: 100%;
  max-width: 1600px;
  display: flex;
  justify-content: center;
`;