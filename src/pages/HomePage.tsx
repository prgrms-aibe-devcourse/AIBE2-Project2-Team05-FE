import { motion } from 'framer-motion';
import styled from 'styled-components';

const pageVariants = {
  initial: {
    opacity: 0,
  },
  in: {
    opacity: 1,
  },
  out: {
    opacity: 0,
  },
};

const HomePage = () => {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={{ duration: 0.5 }}
    >
      <HeroSection>
        <h1>당신만의 여행, 완벽한 동행</h1>
        <p>트래블메이트와 함께라면, 낯선 여행지도 즐거워집니다. <br />나와 꼭 맞는 여행 동반자를 찾아보세요.</p>
        <CTAButton>지금 매칭 시작하기</CTAButton>
      </HeroSection>
      
      <FeaturesSection>
        <SectionTitle>주요 기능</SectionTitle>
        <FeaturesContainer>
          <FeatureCard>
            <FeatureIcon>🤝</FeatureIcon>
            <h3>스마트 매칭</h3>
            <p>나와 꼭 맞는 여행 스타일을 가진 동행자를 찾아보세요.</p>
          </FeatureCard>
          <FeatureCard>
            <FeatureIcon>🗺️</FeatureIcon>
            <h3>여행 계획</h3>
            <p>동행자와 함께 간편하게 여행 일정을 계획하고 공유하세요.</p>
          </FeatureCard>
          <FeatureCard>
            <FeatureIcon>💬</FeatureIcon>
            <h3>안전한 채팅</h3>
            <p>매칭된 동행자와 안전하게 대화하며 여행을 준비하세요.</p>
          </FeatureCard>
          <FeatureCard>
            <FeatureIcon>⭐</FeatureIcon>
            <h3>생생한 후기</h3>
            <p>다른 사용자들의 여행 후기를 통해 영감을 얻으세요.</p>
          </FeatureCard>
        </FeaturesContainer>
      </FeaturesSection>

      <PopularDestinationsSection>
        <SectionTitle>인기 여행지</SectionTitle>
        <DestinationsContainer>
          <DestinationCard>
            <DestinationImg style={{ backgroundColor: '#aed9e0' }} />
            <DestinationInfo>
              <h3>제주도</h3>
              <p>아름다운 자연 경관과 독특한 문화를 경험할 수 있는 한국의 대표 휴양지</p>
              <DestinationMeta>
                <span>👤 현재 324명 매칭 중</span>
                <span>📅 인기 시즌: 5-10월</span>
              </DestinationMeta>
            </DestinationInfo>
          </DestinationCard>
          <DestinationCard>
            <DestinationImg style={{ backgroundColor: '#ffc0cb' }} />
            <DestinationInfo>
              <h3>다낭</h3>
              <p>아름다운 해변과 현대적인 리조트가 조화를 이루는 베트남의 휴양 도시</p>
              <DestinationMeta>
                <span>👤 현재 256명 매칭 중</span>
                <span>📅 인기 시즌: 2-8월</span>
              </DestinationMeta>
            </DestinationInfo>
          </DestinationCard>
          <DestinationCard>
            <DestinationImg style={{ backgroundColor: '#b2f2bb' }} />
            <DestinationInfo>
              <h3>교토</h3>
              <p>일본의 전통 문화와 역사적인 사찰을 경험할 수 있는 고도</p>
              <DestinationMeta>
                <span>👤 현재 198명 매칭 중</span>
                <span>📅 인기 시즌: 3-5월, 10-11월</span>
              </DestinationMeta>
            </DestinationInfo>
          </DestinationCard>
        </DestinationsContainer>
      </PopularDestinationsSection>

      <RecommendedMatchesSection>
        <SectionTitle>추천 매칭</SectionTitle>
        <MatchesContainer>
          <MatchCard>
            <MatchHeader>
              <MatchAvatar style={{ backgroundColor: '#ffc107' }} />
              <div>
                <MatchName>김지연, 28세</MatchName>
                <p>사진 촬영을 좋아하는 여행자</p>
              </div>
            </MatchHeader>
            <MatchInfo>
              <MatchDetail>
                <span>📍</span>
                <p>희망 여행지: 유럽 (프랑스, 이탈리아)</p>
              </MatchDetail>
              <MatchDetail>
                <span>📅</span>
                <p>여행 기간: 2023년 9월 15일 ~ 9월 30일</p>
              </MatchDetail>
              <MatchDetail>
                <span>❤️</span>
                <p>관심사: 사진, 미술관, 카페 탐방</p>
              </MatchDetail>
              <MatchButton>매칭 요청하기</MatchButton>
            </MatchInfo>
          </MatchCard>
          <MatchCard>
            <MatchHeader>
              <MatchAvatar style={{ backgroundColor: '#4caf50' }} />
              <div>
                <MatchName>이민호, 32세</MatchName>
                <p>맛집 탐방을 좋아하는 여행자</p>
              </div>
            </MatchHeader>
            <MatchInfo>
              <MatchDetail>
                <span>📍</span>
                <p>희망 여행지: 일본 (오사카, 교토)</p>
              </MatchDetail>
              <MatchDetail>
                <span>📅</span>
                <p>여행 기간: 2023년 10월 5일 ~ 10월 12일</p>
              </MatchDetail>
              <MatchDetail>
                <span>❤️</span>
                <p>관심사: 음식, 전통 문화, 쇼핑</p>
              </MatchDetail>
              <MatchButton>매칭 요청하기</MatchButton>
            </MatchInfo>
          </MatchCard>
          <MatchCard>
            <MatchHeader>
              <MatchAvatar style={{ backgroundColor: '#f44336' }} />
              <div>
                <MatchName>박서연, 26세</MatchName>
                <p>액티비티를 좋아하는 여행자</p>
              </div>
            </MatchHeader>
            <MatchInfo>
              <MatchDetail>
                <span>📍</span>
                <p>희망 여행지: 태국 (방콕, 푸켓)</p>
              </MatchDetail>
              <MatchDetail>
                <span>📅</span>
                <p>여행 기간: 2023년 11월 10일 ~ 11월 20일</p>
              </MatchDetail>
              <MatchDetail>
                <span>❤️</span>
                <p>관심사: 해변, 스노클링, 현지 축제</p>
              </MatchDetail>
              <MatchButton>매칭 요청하기</MatchButton>
            </MatchInfo>
          </MatchCard>
        </MatchesContainer>
      </RecommendedMatchesSection>

      <TestimonialsSection>
        <SectionTitle>사용자 후기</SectionTitle>
        <TestimonialsContainer>
          <TestimonialCard>
            <QuoteIcon>"</QuoteIcon>
            <TestimonialText>트래블메이트 덕분에 저와 비슷한 여행 스타일을 가진 친구를 만나 잊지 못할 유럽 여행을 할 수 있었어요. 혼자였다면 절대 경험하지 못했을 특별한 추억들을 만들 수 있었습니다.</TestimonialText>
            <TestimonialAuthor>
              <AuthorAvatar style={{ backgroundColor: '#9c27b0' }} />
              <AuthorInfo>
                <h4>정다은</h4>
                <p>30대 / 회사원</p>
              </AuthorInfo>
            </TestimonialAuthor>
          </TestimonialCard>
          <TestimonialCard>
            <QuoteIcon>"</QuoteIcon>
            <TestimonialText>처음에는 낯선 사람과 여행한다는 것이 걱정됐지만, 매칭 시스템이 정말 정확했어요. 저와 취향이 잘 맞는 여행 동반자를 만나 즐거운 여행을 할 수 있었고, 지금은 좋은 친구가 되었습니다.</TestimonialText>
            <TestimonialAuthor>
              <AuthorAvatar style={{ backgroundColor: '#2196f3' }} />
              <AuthorInfo>
                <h4>김준호</h4>
                <p>20대 / 대학생</p>
              </AuthorInfo>
            </TestimonialAuthor>
          </TestimonialCard>
        </TestimonialsContainer>
      </TestimonialsSection>
    </motion.div>
  );
};

export default HomePage;

const HeroSection = styled.section`
  height: 700px;
  background: linear-gradient(rgba(44, 62, 80, 0.7), rgba(44, 62, 80, 0.7)),
    linear-gradient(45deg, #3498db, #9b59b6);
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 0 20px;

  h1 {
    font-size: 56px;
    font-weight: 700;
    margin-bottom: 20px;
    font-family: 'MiSans', sans-serif;
  }

  p {
    font-size: 22px;
    max-width: 800px;
    margin-bottom: 40px;
    line-height: 1.6;
  }
`;

const CTAButton = styled.button`
  background: #3498db;
  color: white;
  border: none;
  padding: 15px 40px;
  font-size: 18px;
  font-weight: 500;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 15px rgba(52, 152, 219, 0.4);

  &:hover {
    background: #2980b9;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(52, 152, 219, 0.6);
  }
`; 

const FeaturesSection = styled.section`
  padding: 100px 60px;
  background-color: #f9f9f9;
`;

const SectionTitle = styled.h2`
  text-align: center;
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 60px;
  color: #2c3e50;
  font-family: 'MiSans', sans-serif;
`;

const FeaturesContainer = styled.div`
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
`;

const FeatureCard = styled.div`
  width: 23%;
  background: white;
  border-radius: 15px;
  padding: 40px 30px;
  text-align: center;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s;

  &:hover {
    transform: translateY(-10px);
  }
`;

const FeatureIcon = styled.div`
  font-size: 50px;
  color: #3498db;
  margin-bottom: 20px;
`; 

const PopularDestinationsSection = styled.section`
  padding: 100px 60px;
`;

const DestinationsContainer = styled.div`
  display: flex;
  justify-content: space-between;
`;

const DestinationCard = styled.div`
  width: 32%;
  background: white;
  border-radius: 15px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  transition: transform 0.3s;

  &:hover {
    transform: translateY(-10px);
  }
`;

const DestinationImg = styled.div`
  height: 200px;
  background-size: cover;
  background-position: center;
`;

const DestinationInfo = styled.div`
  padding: 25px;

  h3 {
    font-size: 22px;
    margin-bottom: 10px;
  }

  p {
    font-size: 15px;
    color: #7f8c8d;
    margin-bottom: 20px;
    height: 45px; /* for alignment */
  }
`;

const DestinationMeta = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: #34495e;
`; 

const RecommendedMatchesSection = styled.section`
  padding: 100px 60px;
  background-color: #f9f9f9;
`;

const MatchesContainer = styled.div`
  display: flex;
  justify-content: space-between;
`;

const MatchCard = styled.div`
  width: 32%;
  background: white;
  border-radius: 15px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05);
  padding: 25px;
`;

const MatchHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  p { font-size: 14px; color: #7f8c8d; }
`;

const MatchAvatar = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  margin-right: 15px;
`;

const MatchName = styled.h3`
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 5px;
`;

const MatchInfo = styled.div``;

const MatchDetail = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  font-size: 15px;
  span { margin-right: 10px; }
`;

const MatchButton = styled.button`
  width: 100%;
  background: #3498db;
  color: white;
  border: none;
  padding: 12px;
  font-size: 16px;
  font-weight: 500;
  border-radius: 50px;
  cursor: pointer;
  margin-top: 10px;
  transition: background 0.3s;
  &:hover { background: #2980b9; }
`; 

const TestimonialsSection = styled.section`
  padding: 100px 60px;
`;

const TestimonialsContainer = styled.div`
  display: flex;
  justify-content: space-around;
`;

const TestimonialCard = styled.div`
  width: 45%;
  background: #f9f9f9;
  border-radius: 15px;
  padding: 40px;
  position: relative;
`;

const QuoteIcon = styled.div`
  font-size: 50px;
  color: #3498db;
  position: absolute;
  top: 20px;
  right: 30px;
  opacity: 0.1;
`;

const TestimonialText = styled.p`
  font-size: 16px;
  line-height: 1.8;
  margin-bottom: 30px;
  font-style: italic;
`;

const TestimonialAuthor = styled.div`
  display: flex;
  align-items: center;
`;

const AuthorAvatar = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-right: 15px;
`;

const AuthorInfo = styled.div`
  h4 {
    font-size: 16px;
    font-weight: 700;
  }
  p {
    font-size: 14px;
    color: #7f8c8d;
  }
`; 