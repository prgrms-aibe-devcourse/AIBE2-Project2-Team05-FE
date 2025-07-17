import styled from 'styled-components';

const featuresData = [
  { icon: '🗺️', title: '맞춤형 여행 계획', description: '나만의 여행 스타일에 맞는 계획을 세우고 다른 사용자들과 공유하세요.' },
  { icon: '🤝', title: '취향 기반 매칭', description: '여행 취향과 스타일이 비슷한 동행자를 AI 매칭 시스템으로 찾아드립니다.' },
  { icon: '💬', title: '실시간 채팅', description: '매칭된 여행 친구와 실시간으로 대화하며 여행 계획을 조율하세요.' },
  { icon: '갤러리', title: '여행 피드', description: '나의 여행 경험을 공유하고 다른 사람들의 여행 이야기를 둘러보세요.' },
];

const FeaturesSection = () => {
  return (
    <FeaturesContainer>
      <SectionTitle>트래블메이트의 특별한 기능</SectionTitle>
      <FeaturesGrid>
        {featuresData.map((feature, index) => (
          <FeatureCard key={index}>
            <FeatureIcon>{feature.icon}</FeatureIcon>
            <FeatureTitle>{feature.title}</FeatureTitle>
            <FeatureDesc>{feature.description}</FeatureDesc>
          </FeatureCard>
        ))}
      </FeaturesGrid>
    </FeaturesContainer>
  );
};

export default FeaturesSection;

const FeaturesContainer = styled.section`
  padding: 80px 60px;
  background-color: #fff;
`;

const SectionTitle = styled.h2`
  text-align: center;
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 60px;
  font-family: 'MiSans', sans-serif;
  color: #333;
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
  max-width: 1200px;
  margin: 0 auto;
`;

const FeatureCard = styled.div`
  text-align: center;
  padding: 40px 20px;
  border-radius: 10px;
  background-color: #f8f9fa;
  transition: transform 0.3s, box-shadow 0.3s;
  
  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  }
`;

const FeatureIcon = styled.div`
  font-size: 48px;
  margin-bottom: 20px;
`;

const FeatureTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 15px;
  color: #333;
`;

const FeatureDesc = styled.p`
  font-size: 15px;
  color: #666;
  line-height: 1.6;
`; 