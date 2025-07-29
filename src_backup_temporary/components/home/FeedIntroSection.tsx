import styled from 'styled-components';

const FeedIntroSection = () => {
  return (
    <IntroContainer>
      <SectionTitle>실시간 여행 피드</SectionTitle>
      <SectionSubtitle>
        전 세계 여행자들의 생생한 여행 이야기를 만나보세요. <br />
        새로운 여행 아이디어와 영감을 얻을 수 있습니다.
      </SectionSubtitle>
      <Divider />
    </IntroContainer>
  );
};

export default FeedIntroSection;

const IntroContainer = styled.section`
  padding: 80px 20px;
  text-align: center;
  background-color: #f8f9fa;
`;

const SectionTitle = styled.h2`
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 20px;
  font-family: 'MiSans', sans-serif;
  color: #333;
`;

const SectionSubtitle = styled.p`
  font-size: 18px;
  color: #666;
  max-width: 700px;
  margin: 0 auto 30px;
  line-height: 1.7;
`;

const Divider = styled.div`
  width: 80px;
  height: 4px;
  background-color: #3498db;
  margin: 0 auto;
`; 