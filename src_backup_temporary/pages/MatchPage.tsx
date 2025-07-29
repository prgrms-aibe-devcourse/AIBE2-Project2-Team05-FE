import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import matePostService from '../services/matePostService';
import travelPlanApiService from '../services/travelPlanApi'; // 백엔드 API 추가

interface MatePost {
  id: number;
  userId: string;
  userName: string;
  userAvatar: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  period: string;
  budget: string;
  currentPeople: number;
  maxPeople: number;
  preferences: {
    gender: string;
    age: string;
    language: string;
    memo: string;
  };
  styles: string[];
  image: string;
  likes: number;
  views: number;
  status: string;
  createdAt: string;
  tags: string[];
}

interface FilterState {
  destination: string;
  schedule: string;
  style: string;
  sortBy: string;
}

const MatchPage: React.FC = () => {
  const [matePosts, setMatePosts] = useState<MatePost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<MatePost[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    destination: '전체',
    schedule: '전체',
    style: '전체',
    sortBy: '최신순',
  });
  const [loading, setLoading] = useState(true);

  // 🔥 강력한 Mock 데이터 완전 정리 함수
  const clearMockData = () => {
    try {
      console.log('🗑️ 모든 Mock 데이터 완전 정리 시작...');

      // 🔥 1. matePosts 완전 삭제 (실제 사용자 데이터만 남기기)
      const existingMatePosts = localStorage.getItem('matePosts');
      if (existingMatePosts) {
        console.log('🧹 기존 matePosts 완전 삭제');
        localStorage.removeItem('matePosts');
      }

      // 🔥 2. Mock 사용자 데이터 완전 삭제
      const allKeys = Object.keys(localStorage);
      const mockKeys = allKeys.filter(
        (key) =>
          key.includes('user_00') || // Mock 사용자 ID
          key.includes('mock') || // Mock 관련
          key.includes('Lotusrious') || // 특정 Mock 사용자
          key.includes('sample'), // 샘플 데이터
      );

      mockKeys.forEach((key) => {
        localStorage.removeItem(key);
        console.log(`🗑️ Mock 데이터 삭제: ${key}`);
      });

      // 🔥 3. 특정 Mock planId들 삭제 (이미지에서 보이는 데이터)
      const mockPlanIds = [
        'plan_1',
        'plan_2',
        'plan_3',
        'plan_강릉',
        'plan_부산',
        'plan_제주',
      ];
      mockPlanIds.forEach((planId) => {
        if (localStorage.getItem(planId)) {
          // 실제 사용자가 작성했는지 확인 (myFeeds에 있는지)
          const myFeeds = localStorage.getItem('myFeeds');
          let isRealUserPlan = false;

          if (myFeeds) {
            const feeds = JSON.parse(myFeeds);
            isRealUserPlan = feeds.some(
              (feed: any) =>
                feed.planId === planId.replace('plan_', '') &&
                feed.type === 'travel-plan',
            );
          }

          if (!isRealUserPlan) {
            localStorage.removeItem(planId);
            console.log(`🗑️ Mock 계획 삭제: ${planId}`);
          }
        }
      });

      console.log('✅ Mock 데이터 완전 정리 완료!');
    } catch (error) {
      console.error('Mock 데이터 정리 중 오류:', error);
    }
  };

  // 메이트 찾기 게시글 로드 (실제 사용자 데이터만)
  useEffect(() => {
    const loadMatePosts = async () => {
      try {
        console.log('📋 실제 사용자 여행메이트 데이터 로드 시작...');

        // 🗑️ 먼저 Mock 데이터 정리
        clearMockData();

        // ✅ 실제 사용자가 작성한 계획들만 매칭에 반영 (myFeeds)
        try {
          const myFeedsStr = localStorage.getItem('myFeeds');
          if (myFeedsStr) {
            const myFeeds = JSON.parse(myFeedsStr);
            console.log(`📝 내 피드 발견: ${myFeeds.length}개`);

            // 여행 계획만 필터링해서 매칭에 반영
            const travelPlanFeeds = myFeeds.filter(
              (feed: any) => feed.type === 'travel-plan' && feed.planId,
            );
            console.log(`✈️ 여행 계획 피드: ${travelPlanFeeds.length}개`);

            if (travelPlanFeeds.length > 0) {
              matePostService.initializeFromProfileData(travelPlanFeeds);
            }
          }
        } catch (error) {
          console.warn('내 피드 매칭 반영 실패:', error);
        }

        // 🚀 백엔드 API에서 매칭 포스트 로드 (우선)
        console.log('🎯 백엔드에서 매칭 포스트 로드 시작...');

        let posts: MatePost[] = [];

        try {
          // 백엔드 API에서 매칭 활성화된 여행 계획 조회
          const backendPlans =
            await travelPlanApiService.getMatchingTravelPlans();
          console.log(`📡 백엔드에서 매칭 계획 ${backendPlans.length}개 조회`);

          // 백엔드 데이터를 MatePost 형식으로 변환
          posts = backendPlans.map((plan) => ({
            id: parseInt(plan.planId),
            userId: plan.userId,
            userName: plan.author.name,
            userAvatar: plan.author.profileImage || '👤',
            title: `${plan.title} (메이트 모집)`,
            destination: plan.destination,
            startDate: plan.startDate,
            endDate: plan.endDate,
            period: plan.period,
            budget: plan.budget,
            currentPeople: 1, // 작성자 본인
            maxPeople: parseInt(plan.people.replace(/[^0-9]/g, '')) || 2,
            preferences: {
              gender: plan.matchingInfo?.preferredGender || '무관',
              age: plan.matchingInfo?.preferredAge || '무관',
              language: plan.matchingInfo?.preferredLanguage || '한국어',
              memo:
                plan.matchingInfo?.matchingMemo ||
                `${plan.destination} 여행을 함께할 메이트를 찾습니다!`,
            },
            styles: plan.styleLabels || plan.styles || [],
            image: plan.imageUrl || '/default-place-image.jpg',
            likes: 0,
            views: 0,
            status: 'recruiting', // 모집중
            createdAt: plan.createdAt,
            tags: [
              `#${plan.destination}`,
              ...plan.styleLabels.map((style: string) => `#${style}`),
            ],
            planId: plan.planId, // 원본 여행계획과 연결
          }));

          if (posts.length > 0) {
            localStorage.setItem('matePosts', JSON.stringify(posts));
            console.log(
              `✅ 백엔드에서 ${posts.length}개의 매칭 포스트 로드 완료`,
            );
          } else {
            console.log('📝 백엔드에 작성된 여행메이트 모집글이 없습니다.');
          }
        } catch (backendError) {
          console.error(
            '❌ 백엔드 매칭 포스트 로드 실패, 로컬 데이터 사용:',
            backendError,
          );

          // 백엔드 실패 시 로컬 데이터 사용 (폴백)
          posts = matePostService.getAllMatePosts();
          console.log(`🔄 로컬에서 ${posts.length}개의 매칭 포스트 로드`);

          if (posts.length === 0) {
            console.log('📝 로컬에도 여행메이트 모집글이 없습니다.');
          }
        }

        setMatePosts(posts);
        setFilteredPosts(posts);
        setLoading(false);
      } catch (error) {
        console.error('메이트 게시글 로드 중 오류:', error);

        // ✅ 오류 발생 시 빈 배열로 설정 (Mock 데이터 없음)
        setMatePosts([]);
        setFilteredPosts([]);
        setLoading(false);
      }
    };

    loadMatePosts();
  }, []);

  // 필터링 적용
  useEffect(() => {
    let filtered = [...matePosts];

    // 여행지 필터
    if (filters.destination !== '전체') {
      filtered = filtered.filter((post) =>
        post.destination.includes(filters.destination),
      );
    }

    // 일정 필터
    if (filters.schedule !== '전체') {
      filtered = filtered.filter((post) => {
        const dayCount = parseInt(post.period.replace(/\D/g, ''));
        if (filters.schedule === '당일치기') return dayCount === 1;
        if (filters.schedule === '1박 2일') return dayCount === 2;
        if (filters.schedule === '2박 3일 이상') return dayCount >= 3;
        return true;
      });
    }

    // 여행 스타일 필터
    if (filters.style !== '전체') {
      filtered = filtered.filter((post) =>
        post.styles.some(
          (style) =>
            style.toLowerCase().includes(filters.style.toLowerCase()) ||
            post.tags.some((tag) => tag.includes(filters.style)),
        ),
      );
    }

    // 정렬
    if (filters.sortBy === '최신순') {
      filtered.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    } else if (filters.sortBy === '추천순') {
      filtered.sort((a, b) => b.likes + b.views - (a.likes + a.views));
    }

    setFilteredPosts(filtered);
  }, [matePosts, filters]);

  // ✅ Mock 샘플 데이터 제거됨 - 실제 사용자 데이터만 사용

  const handleFilterChange = (filterType: keyof FilterState, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  };

  if (loading) {
    return (
      <Container
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={{ duration: 0.3 }}
      >
        <PageHeader>
          <HeaderContent>
            <Title>🌍 여행 메이트 찾기</Title>
            <Description>함께할 여행 동반자를 찾아보세요</Description>
          </HeaderContent>
        </PageHeader>
        <MainContainer>
          <LoadingContainer>
            메이트 찾기 게시글을 불러오는 중...
          </LoadingContainer>
        </MainContainer>
      </Container>
    );
  }

  return (
    <Container
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={{ duration: 0.3 }}
    >
      <PageHeader>
        <HeaderContent>
          <Title>🌍 여행 메이트 찾기</Title>
          <Description>함께할 여행 동반자를 찾아보세요</Description>
        </HeaderContent>
      </PageHeader>

      <MainContainer>
        <ContentWrapper>
          {/* 필터 사이드바 */}
          <FilterSidebar>
            <FilterTitle>여행지 필터</FilterTitle>

            <FilterGroup>
              <FilterLabel>여행지</FilterLabel>
              <FilterSelect
                value={filters.destination}
                onChange={(e) =>
                  handleFilterChange('destination', e.target.value)
                }
              >
                <option>전체</option>
                <option>서울</option>
                <option>부산</option>
                <option>제주도</option>
                <option>강릉</option>
                <option>여수</option>
                <option>경주</option>
              </FilterSelect>
            </FilterGroup>

            <FilterGroup>
              <FilterLabel>일정</FilterLabel>
              <FilterSelect
                value={filters.schedule}
                onChange={(e) => handleFilterChange('schedule', e.target.value)}
              >
                <option>전체</option>
                <option>당일치기</option>
                <option>1박 2일</option>
                <option>2박 3일 이상</option>
              </FilterSelect>
            </FilterGroup>

            <FilterGroup>
              <FilterLabel>여행 스타일</FilterLabel>
              <FilterSelect
                value={filters.style}
                onChange={(e) => handleFilterChange('style', e.target.value)}
              >
                <option>전체</option>
                <option>맛집</option>
                <option>휴양</option>
                <option>액티비티</option>
                <option>관광</option>
                <option>쇼핑</option>
              </FilterSelect>
            </FilterGroup>

            <ApplyFilterButton>필터 적용됨</ApplyFilterButton>
          </FilterSidebar>

          {/* 메인 콘텐츠 */}
          <MainContent>
            <ResultsHeader>
              <ResultsTitle>
                여행 메이트 <ResultsCount>{filteredPosts.length}</ResultsCount>
              </ResultsTitle>
              <SortDropdown
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              >
                <option>최신순</option>
                <option>추천순</option>
              </SortDropdown>
            </ResultsHeader>

            {/* 게시글 목록 */}
            {matePosts.length === 0 ? (
              <EmptyState>
                <EmptyIcon>✈️</EmptyIcon>
                <EmptyTitle>아직 여행메이트 모집글이 없어요</EmptyTitle>
                <EmptyDescription>
                  여행 계획을 작성하면 자동으로 여행메이트 찾기에 등록됩니다!
                </EmptyDescription>
                <Link to="/plan/write">
                  <ActionButton $primary style={{ marginTop: '1rem' }}>
                    첫 여행 계획 만들기
                  </ActionButton>
                </Link>
              </EmptyState>
            ) : filteredPosts.length > 0 ? (
              <PostGrid>
                {filteredPosts.map((post) => (
                  <PostCard key={post.id}>
                    <PostImage src={post.image} alt={post.title} />
                    <PostContent>
                      <PostHeader>
                        <UserInfo>
                          <UserAvatar>{post.userAvatar}</UserAvatar>
                          <UserName>{post.userName}</UserName>
                        </UserInfo>
                        <PostDate>
                          {new Date(post.createdAt).toLocaleDateString('ko-KR')}
                        </PostDate>
                      </PostHeader>

                      <PostTitle>{post.title}</PostTitle>

                      <PostDetails>
                        <Detail>📍 {post.destination}</Detail>
                        <Detail>
                          📅 {post.startDate} ~ {post.endDate}
                        </Detail>
                        <Detail>💰 {post.budget}</Detail>
                        <Detail>
                          👥 {post.currentPeople}/{post.maxPeople}명
                        </Detail>
                      </PostDetails>

                      <PostTags>
                        {post.tags.slice(0, 3).map((tag, index) => (
                          <Tag key={index}>{tag}</Tag>
                        ))}
                      </PostTags>

                      <PostFooter>
                        <PostStats>
                          <Stat>❤️ {post.likes}</Stat>
                          <Stat>👁️ {post.views}</Stat>
                        </PostStats>
                        <PostActions>
                          <ActionButton>관심 표시</ActionButton>
                          <ActionButton $primary>지원하기</ActionButton>
                        </PostActions>
                      </PostFooter>
                    </PostContent>
                  </PostCard>
                ))}
              </PostGrid>
            ) : (
              <EmptyState>
                <EmptyIcon>🔍</EmptyIcon>
                <EmptyTitle>검색 결과가 없습니다</EmptyTitle>
                <EmptyDescription>다른 조건으로 검색해보세요</EmptyDescription>
              </EmptyState>
            )}
          </MainContent>
        </ContentWrapper>

        {/* 플로팅 버튼 */}
        <FloatingButton>
          <Link to="/plan/write">
            <FloatingIcon>+</FloatingIcon>
            <FloatingText>여행 계획 만들기</FloatingText>
          </Link>
        </FloatingButton>
      </MainContainer>
    </Container>
  );
};

export default MatchPage;

// Page Animation
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 },
};

// Styled Components
const Container = styled(motion.div)`
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  font-family:
    'Pretendard',
    -apple-system,
    BlinkMacSystemFont,
    sans-serif;
`;

const PageHeader = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(54, 130, 248, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
  padding: 20px 0;
`;

const HeaderContent = styled.div`
  width: 100%;
  padding: 0 20px;
  text-align: center;
`;

const Title = styled.h1`
  color: #3682f8;
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 10px 0;
  font-family: 'Pretendard', sans-serif;
`;

const Description = styled.p`
  color: #64748b;
  font-size: 18px;
  margin: 0;
  font-weight: 400;
`;

const MainContainer = styled.div`
  width: 100%;
  padding: 20px;
`;

const ContentWrapper = styled.div`
  display: flex;
  gap: 30px;
  margin-bottom: 80px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 20px;
  }
`;

const FilterSidebar = styled.aside`
  width: 280px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(54, 130, 248, 0.1);
  border-radius: 16px;
  padding: 24px;
  height: fit-content;
  position: sticky;
  top: 120px;
  box-shadow: 0 8px 32px rgba(54, 130, 248, 0.1);

  @media (max-width: 768px) {
    width: 100%;
    position: static;
    top: auto;
  }
`;

const FilterTitle = styled.h2`
  color: #1e293b;
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 20px 0;
  font-family: 'Pretendard', sans-serif;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50vh;
  font-size: 18px;
  color: #64748b;
  font-weight: 500;
`;

const FilterGroup = styled.div`
  margin-bottom: 20px;
`;

const FilterLabel = styled.label`
  display: block;
  margin-bottom: 10px;
  font-weight: 500;
  color: #1e293b;
  font-size: 14px;
`;

const FilterSelect = styled.select`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid rgba(54, 130, 248, 0.2);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.8);
  color: #1e293b;
  font-size: 14px;
  font-family: 'Pretendard', sans-serif;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #3682f8;
    box-shadow: 0 0 0 3px rgba(54, 130, 248, 0.1);
    background: white;
  }

  &:hover {
    border-color: #3682f8;
  }
`;

const ApplyFilterButton = styled.button`
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #3682f8 0%, #2563eb 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(54, 130, 248, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(54, 130, 248, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
`;

const MainContent = styled.section`
  flex: 1;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(54, 130, 248, 0.1);
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 8px 32px rgba(54, 130, 248, 0.08);
`;

const ResultsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const ResultsTitle = styled.h2`
  color: #1e293b;
  font-family: 'Pretendard', sans-serif;
  font-size: 20px;
  font-weight: 600;
  margin: 0;
`;

const ResultsCount = styled.span`
  color: #3682f8;
  font-weight: 700;
`;

const SortDropdown = styled.select`
  padding: 10px 14px;
  border: 1px solid rgba(54, 130, 248, 0.2);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  color: #1e293b;
  font-family: 'Pretendard', sans-serif;
  cursor: pointer;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #3682f8;
    box-shadow: 0 0 0 3px rgba(54, 130, 248, 0.1);
  }

  &:hover {
    border-color: #3682f8;
  }
`;

const PostGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 30px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  @media (min-width: 1200px) {
    grid-template-columns: repeat(auto-fill, minmax(420px, 1fr));
  }
`;

const PostCard = styled.div`
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(54, 130, 248, 0.1);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(54, 130, 248, 0.08);
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(54, 130, 248, 0.15);
    border-color: rgba(54, 130, 248, 0.3);
  }
`;

const PostImage = styled.img`
  width: 100%;
  height: 220px;
  object-fit: cover;
  transition: transform 0.3s ease;

  ${PostCard}:hover & {
    transform: scale(1.05);
  }
`;

const PostContent = styled.div`
  padding: 24px;
`;

const PostHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const UserAvatar = styled.div`
  font-size: 24px;
`;

const UserName = styled.span`
  font-weight: 600;
  color: #1e293b;
  font-size: 14px;
`;

const PostDate = styled.span`
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
`;

const PostTitle = styled.h3`
  margin-bottom: 16px;
  color: #1e293b;
  font-size: 18px;
  font-weight: 700;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const PostDetails = styled.div`
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Detail = styled.div`
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;

  &:first-child {
    color: #3682f8;
    font-weight: 600;
  }
`;

const PostTags = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  flex-wrap: wrap;
`;

const Tag = styled.span`
  background: linear-gradient(
    135deg,
    rgba(54, 130, 248, 0.1) 0%,
    rgba(37, 99, 235, 0.1) 100%
  );
  color: #3682f8;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid rgba(54, 130, 248, 0.2);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;

  &:hover {
    background: rgba(54, 130, 248, 0.15);
    border-color: rgba(54, 130, 248, 0.4);
    transform: translateY(-1px);
  }
`;

const PostFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const PostStats = styled.div`
  display: flex;
  gap: 12px;
`;

const Stat = styled.span`
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;

  &:first-child {
    color: #ef4444;
  }

  &:last-child {
    color: #3682f8;
  }
`;

const PostActions = styled.div`
  display: flex;
  gap: 10px;
`;

const ActionButton = styled.button<{ $primary?: boolean }>`
  padding: 10px 16px;
  border: 1px solid
    ${(props) => (props.$primary ? '#3682F8' : 'rgba(54, 130, 248, 0.3)')};
  background: ${(props) =>
    props.$primary ? '#3682F8' : 'rgba(255, 255, 255, 0.8)'};
  color: ${(props) => (props.$primary ? 'white' : '#3682F8')};
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  font-family: 'Pretendard', sans-serif;

  &:hover {
    background: ${(props) =>
      props.$primary ? '#2563EB' : 'rgba(54, 130, 248, 0.1)'};
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(54, 130, 248, 0.2);
  }

  &:active {
    transform: translateY(0);
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 50vh;
  color: #64748b;
  text-align: center;
  padding: 40px 20px;
`;

const EmptyIcon = styled.div`
  font-size: 64px;
  margin-bottom: 24px;
  opacity: 0.7;
`;

const EmptyTitle = styled.h3`
  margin-bottom: 12px;
  color: #1e293b;
  font-size: 24px;
  font-weight: 600;
`;

const EmptyDescription = styled.p`
  color: #64748b;
  font-size: 16px;
  margin: 0;
  max-width: 400px;
  line-height: 1.5;
`;

const FloatingButton = styled.div`
  position: fixed;
  bottom: 30px;
  right: 30px;
  background: linear-gradient(135deg, #3682f8 0%, #2563eb 100%);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(54, 130, 248, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1000;

  &:hover {
    transform: translateY(-4px) scale(1.02);
    box-shadow: 0 12px 40px rgba(54, 130, 248, 0.4);
  }

  &:active {
    transform: translateY(-2px) scale(0.98);
  }

  a {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 24px;
    color: white;
    text-decoration: none;
    font-family: 'Pretendard', sans-serif;
  }
`;

const FloatingIcon = styled.div`
  font-size: 28px;
  font-weight: bold;
  line-height: 1;
`;

const FloatingText = styled.span`
  font-size: 15px;
  font-weight: 600;
  white-space: nowrap;
`;
