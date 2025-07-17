import styled from 'styled-components';

const HeroSection = () => {
  return (
    <HeroContainer>
      <h1>함께하는 여행, 더 특별한 추억</h1>
      <p>나와 취향이 맞는 여행 친구를 찾고, 새로운 여행 경험을 공유하세요. <br />트래블메이트와 함께라면 혼자여도 외롭지 않은 여행이 시작됩니다.</p>
      <CTAButton>지금 시작하기</CTAButton>
    </HeroContainer>
  );
};

export default HeroSection;

const HeroContainer = styled.section`
  height: 600px;
  background: linear-gradient(rgba(44, 62, 80, 0.6), rgba(44, 62, 80, 0.6)), url('https://source.unsplash.com/random/1920x700/?travel,landscape') no-repeat center center/cover;
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 0 20px;

  h1 {
    font-size: 52px;
    font-weight: 700;
    margin-bottom: 20px;
    font-family: 'MiSans', sans-serif;
    text-shadow: 0 2px 4px rgba(0,0,0,0.5);
  }

  p {
    font-size: 20px;
    max-width: 700px;
    margin-bottom: 30px;
    line-height: 1.7;
    text-shadow: 0 1px 3px rgba(0,0,0,0.5);
  }
`;

const CTAButton = styled.button`
  background-color: #3498db;
  color: white;
  border: none;
  padding: 15px 35px;
  font-size: 18px;
  font-weight: 600;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);

  &:hover {
    background-color: #2980b9;
    transform: translateY(-3px);
    box-shadow: 0 6px 20px rgba(0,0,0,0.3);
  }
`; 