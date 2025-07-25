import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

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

  // 메이트 찾기 게시글 로드
  useEffect(() => {
    const loadMatePosts = () => {
      try {
        const savedPosts = localStorage.getItem('matePosts');
        let posts: MatePost[] = [];

        if (savedPosts) {
          posts = JSON.parse(savedPosts);
        } else {
          // 샘플 데이터 생성
          posts = generateSamplePosts();
          localStorage.setItem('matePosts', JSON.stringify(posts));
        }

        setMatePosts(posts);
        setFilteredPosts(posts);
        setLoading(false);
      } catch (error) {
        console.error('메이트 게시글 로드 중 오류:', error);
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

  // 샘플 데이터 생성
  const generateSamplePosts = (): MatePost[] => {
    return [
      {
        id: 1,
        userId: 'user1',
        userName: '김여행',
        userAvatar: '👩',
        title: '제주도 힐링 여행 같이 하실분!',
        destination: '제주도',
        startDate: '2024-04-15',
        endDate: '2024-04-17',
        period: '3일',
        budget: '80만원',
        currentPeople: 1,
        maxPeople: 3,
        preferences: {
          gender: '여성만',
          age: '20대',
          language: '한국어',
          memo: '조용하고 힐링하는 여행을 원해요',
        },
        styles: ['휴양', '맛집탐방'],
        image:
          'https://images.unsplash.com/photo-1539650116574-75c0c6d3e81b?w=400',
        likes: 15,
        views: 120,
        status: 'recruiting',
        createdAt: '2024-01-15T10:00:00.000Z',
        tags: ['#제주도', '#힐링', '#여행메이트'],
      },
      {
        id: 2,
        userId: 'user2',
        userName: '박모험',
        userAvatar: '👨',
        title: '부산 액티비티 투어 멤버 모집!',
        destination: '부산',
        startDate: '2024-05-01',
        endDate: '2024-05-03',
        period: '3일',
        budget: '120만원',
        currentPeople: 2,
        maxPeople: 4,
        preferences: {
          gender: '무관',
          age: '20~30대',
          language: '한국어',
          memo: '액티비티 좋아하는 분들과 함께해요!',
        },
        styles: ['액티비티', '관광'],
        image:
          'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400',
        likes: 8,
        views: 95,
        status: 'recruiting',
        createdAt: '2024-01-14T15:30:00.000Z',
        tags: ['#부산', '#액티비티', '#관광'],
      },
    ];
  };

  const handleFilterChange = (filterType: keyof FilterState, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  };

  if (loading) {
    return (
      <Container>
        <LoadingMessage>메이트 찾기 게시글을 불러오는 중...</LoadingMessage>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>여행 메이트 찾기</Title>
        <Description>같이 여행할 메이트를 찾아보세요! 🧳</Description>
      </Header>

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
          {filteredPosts.length > 0 ? (
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
    </Container>
  );
};

export default MatchPage;

// Styled Components
const Container = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const LoadingMessage = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50vh;
  font-size: 18px;
  color: #666;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 30px;
`;

const Title = styled.h1`
  color: #3682f8;
  margin-bottom: 10px;
  font-family: 'Pretendard', sans-serif;
`;

const Description = styled.p`
  color: #666;
  font-size: 16px;
`;

const ContentWrapper = styled.div`
  display: flex;
  gap: 30px;
  margin-bottom: 80px; /* 플로팅 버튼 공간 확보 */
`;

const FilterSidebar = styled.aside`
  width: 250px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
  height: fit-content;
  position: sticky;
  top: 20px;
`;

const FilterTitle = styled.h2`
  color: #333;
  margin-bottom: 20px;
  font-size: 18px;
  font-family: 'Pretendard', sans-serif;
`;

const FilterGroup = styled.div`
  margin-bottom: 20px;
`;

const FilterLabel = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
`;

const FilterSelect = styled.select`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #3682f8;
  }
`;

const ApplyFilterButton = styled.button`
  width: 100%;
  padding: 12px;
  background: #3682f8;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    background: #2c6de6;
  }
`;

const MainContent = styled.section`
  flex: 1;
`;

const ResultsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const ResultsTitle = styled.h2`
  color: #333;
  font-family: 'Pretendard', sans-serif;
`;

const ResultsCount = styled.span`
  color: #3682f8;
  font-weight: 700;
`;

const SortDropdown = styled.select`
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;

  &:focus {
    outline: none;
    border-color: #3682f8;
  }
`;

const PostGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
`;

const PostCard = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  }
`;

const PostImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
`;

const PostContent = styled.div`
  padding: 16px;
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
  color: #333;
`;

const PostDate = styled.span`
  font-size: 12px;
  color: #999;
`;

const PostTitle = styled.h3`
  margin-bottom: 12px;
  color: #333;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.4;
`;

const PostDetails = styled.div`
  margin-bottom: 12px;
`;

const Detail = styled.div`
  font-size: 14px;
  color: #666;
  margin-bottom: 4px;
`;

const PostTags = styled.div`
  display: flex;
  gap: 6px;
  margin-bottom: 16px;
  flex-wrap: wrap;
`;

const Tag = styled.span`
  background: #f0f2ff;
  color: #3682f8;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
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
  font-size: 14px;
  color: #666;
`;

const PostActions = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button<{ $primary?: boolean }>`
  padding: 6px 12px;
  border: 1px solid ${(props) => (props.$primary ? '#3682F8' : '#ddd')};
  background: ${(props) => (props.$primary ? '#3682F8' : 'white')};
  color: ${(props) => (props.$primary ? 'white' : '#666')};
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;

  &:hover {
    background: ${(props) => (props.$primary ? '#2c6de6' : '#f8f9fa')};
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 50vh;
  color: #666;
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
`;

const EmptyTitle = styled.h3`
  margin-bottom: 8px;
  color: #333;
`;

const EmptyDescription = styled.p`
  color: #999;
`;

const FloatingButton = styled.div`
  position: fixed;
  bottom: 30px;
  right: 30px;
  background: #3682f8;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(54, 130, 248, 0.3);
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.05);
  }

  a {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    color: white;
    text-decoration: none;
  }
`;

const FloatingIcon = styled.div`
  font-size: 24px;
  font-weight: 600;
`;

const FloatingText = styled.span`
  font-weight: 600;
`;
