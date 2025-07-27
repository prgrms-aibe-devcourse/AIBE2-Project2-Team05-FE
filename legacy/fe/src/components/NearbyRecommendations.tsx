import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import openaiService from '../services/openaiApi';

// 추천 장소 타입 정의
interface RecommendedPlace {
  name: string;
  description: string;
  category: '맛집' | '액티비티' | '관광명소';
  distance: string;
  verified: boolean;
  source?: string;
}

interface NearbyRecommendationsProps {
  destination: string;
  travelStyles: string[];
  travelPlan: {
    days: Array<{
      events: Array<{
        place: string;
        activity?: string;
        time?: string;
      }>;
    }>;
  };
  isVisible: boolean;
  onClose: () => void;
}

const NearbyRecommendations: React.FC<NearbyRecommendationsProps> = ({
  destination,
  travelStyles,
  travelPlan,
  isVisible,
  onClose,
}) => {
  const [recommendations, setRecommendations] = useState<RecommendedPlace[]>(
    [],
  );
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<
    '전체' | '맛집' | '액티비티' | '관광명소'
  >('전체');

  // 추천 장소 가져오기
  const fetchRecommendations = async () => {
    if (!destination || !isVisible) return;

    setLoading(true);
    try {
      console.log('🔍 실제 장소 추천 요청 시작...', {
        destination,
        styles: travelStyles,
        visitedPlaces: travelPlan.days.flatMap((day) =>
          day.events.map((event) => event.place).filter(Boolean),
        ),
      });

      const results = await openaiService.generateNearbyRecommendations(
        destination,
        travelStyles,
        travelPlan,
      );

      console.log('✅ 추천 결과:', results);
      // 타입 안전성을 위해 카테고리 필터링
      const validResults = results.filter((place) =>
        ['맛집', '액티비티', '관광명소'].includes(place.category),
      ) as RecommendedPlace[];
      setRecommendations(validResults);
    } catch (error) {
      console.error('추천 장소 조회 실패:', error);
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트가 보여질 때 추천 장소 가져오기
  useEffect(() => {
    if (isVisible) {
      fetchRecommendations();
    }
  }, [isVisible, destination]);

  // 카테고리별 필터링
  const filteredRecommendations = recommendations.filter(
    (place) =>
      selectedCategory === '전체' || place.category === selectedCategory,
  );

  // 카테고리별 개수 계산
  const getCategoryCount = (category: '맛집' | '액티비티' | '관광명소') => {
    return recommendations.filter((place) => place.category === category)
      .length;
  };

  // 새로고침 버튼
  const handleRefresh = () => {
    fetchRecommendations();
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <Overlay
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <Container
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* 헤더 */}
          <Header>
            <HeaderContent>
              <Title>
                🗺️ {destination} 근처 추천 장소
                {recommendations.length > 0 && (
                  <Badge
                    $verified={recommendations.some((r) => r.verified || false)}
                  >
                    {recommendations.filter((r) => r.verified).length > 0
                      ? `실제 검증된 ${recommendations.length}개 장소`
                      : `${recommendations.length}개 장소`}
                  </Badge>
                )}
              </Title>
              <Subtitle>
                웹 검색과 AI 분석으로 찾은 실제 존재하는 장소들입니다
              </Subtitle>
            </HeaderContent>
            <HeaderActions>
              <RefreshButton onClick={handleRefresh} disabled={loading}>
                {loading ? '🔄' : '↻'}
              </RefreshButton>
              <CloseButton onClick={onClose}>✕</CloseButton>
            </HeaderActions>
          </Header>

          {/* 카테고리 필터 */}
          <CategoryFilters>
            <CategoryButton
              active={selectedCategory === '전체'}
              onClick={() => setSelectedCategory('전체')}
            >
              전체 ({recommendations.length})
            </CategoryButton>
            <CategoryButton
              active={selectedCategory === '맛집'}
              onClick={() => setSelectedCategory('맛집')}
            >
              🍽️ 맛집 ({getCategoryCount('맛집')})
            </CategoryButton>
            <CategoryButton
              active={selectedCategory === '액티비티'}
              onClick={() => setSelectedCategory('액티비티')}
            >
              🎯 액티비티 ({getCategoryCount('액티비티')})
            </CategoryButton>
            <CategoryButton
              active={selectedCategory === '관광명소'}
              onClick={() => setSelectedCategory('관광명소')}
            >
              🏛️ 관광명소 ({getCategoryCount('관광명소')})
            </CategoryButton>
          </CategoryFilters>

          {/* 추천 장소 목록 */}
          <Content>
            {loading ? (
              <LoadingContainer>
                <LoadingSpinner />
                <LoadingText>
                  실제 존재하는 장소들을 검색하고 있습니다...
                  <br />
                  <small>웹 검색 + AI 분석 진행 중</small>
                </LoadingText>
              </LoadingContainer>
            ) : filteredRecommendations.length > 0 ? (
              <PlacesList>
                {filteredRecommendations.map((place, index) => (
                  <PlaceCard
                    key={`${place.name}-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <PlaceHeader>
                      <PlaceName>
                        {place.category === '맛집' && '🍽️'}
                        {place.category === '액티비티' && '🎯'}
                        {place.category === '관광명소' && '🏛️'}
                        {place.name}
                      </PlaceName>
                      <PlaceDistance>{place.distance}</PlaceDistance>
                    </PlaceHeader>
                    <PlaceDescription>{place.description}</PlaceDescription>
                    <PlaceFooter>
                      <CategoryTag category={place.category}>
                        {place.category}
                      </CategoryTag>
                      {place.verified && (
                        <VerifiedBadge>✓ 실제 검증됨</VerifiedBadge>
                      )}
                      {place.source && place.source !== 'default' && (
                        <SourceBadge>출처: {place.source}</SourceBadge>
                      )}
                    </PlaceFooter>
                  </PlaceCard>
                ))}
              </PlacesList>
            ) : (
              <EmptyState>
                <EmptyIcon>🔍</EmptyIcon>
                <EmptyTitle>추천 장소를 찾을 수 없습니다</EmptyTitle>
                <EmptyDescription>
                  다른 카테고리를 선택하거나 새로고침을 시도해보세요
                </EmptyDescription>
                <RetryButton onClick={handleRefresh}>다시 검색하기</RetryButton>
              </EmptyState>
            )}
          </Content>
        </Container>
      </Overlay>
    </AnimatePresence>
  );
};

// 스타일 컴포넌트들
const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(5px);
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
`;

const Container = styled(motion.div)`
  background: white;
  border-radius: 20px;
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
`;

const Header = styled.div`
  background: linear-gradient(135deg, #3682f8 0%, #2563eb 100%);
  color: white;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const HeaderContent = styled.div`
  flex: 1;
`;

const Title = styled.h2`
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`;

const Badge = styled.span<{ $verified: boolean }>`
  background: ${(props) =>
    props.$verified ? 'rgba(16, 185, 129, 0.9)' : 'rgba(255, 255, 255, 0.2)'};
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid rgba(255, 255, 255, 0.3);
`;

const Subtitle = styled.p`
  margin: 0;
  font-size: 14px;
  opacity: 0.9;
  line-height: 1.4;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 8px;
`;

const RefreshButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  color: white;
  padding: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.05);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const CloseButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  color: white;
  padding: 8px 12px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(239, 68, 68, 0.9);
    border-color: rgba(239, 68, 68, 1);
  }
`;

const CategoryFilters = styled.div`
  display: flex;
  gap: 8px;
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
  overflow-x: auto;
`;

const CategoryButton = styled.button<{ active: boolean }>`
  background: ${(props) => (props.active ? '#3682f8' : 'transparent')};
  color: ${(props) => (props.active ? 'white' : '#64748b')};
  border: 1px solid ${(props) => (props.active ? '#3682f8' : '#d1d5db')};
  border-radius: 20px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    background: ${(props) => (props.active ? '#2563eb' : '#f8fafc')};
    border-color: ${(props) => (props.active ? '#2563eb' : '#3682f8')};
    color: ${(props) => (props.active ? 'white' : '#3682f8')};
  }
`;

const Content = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid #e5e7eb;
  border-top-color: #3682f8;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const LoadingText = styled.div`
  color: #64748b;
  font-size: 16px;
  line-height: 1.5;

  small {
    font-size: 12px;
    opacity: 0.7;
  }
`;

const PlacesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const PlaceCard = styled(motion.div)`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px;
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    border-color: #3682f8;
    box-shadow: 0 4px 12px rgba(54, 130, 248, 0.1);
    transform: translateY(-1px);
  }
`;

const PlaceHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
  gap: 12px;
`;

const PlaceName = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
`;

const PlaceDistance = styled.span`
  background: #f1f5f9;
  color: #64748b;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
`;

const PlaceDescription = styled.p`
  margin: 0 0 12px 0;
  color: #64748b;
  font-size: 14px;
  line-height: 1.5;
`;

const PlaceFooter = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

const CategoryTag = styled.span<{ category: string }>`
  background: ${(props) => {
    switch (props.category) {
      case '맛집':
        return 'rgba(239, 68, 68, 0.1)';
      case '액티비티':
        return 'rgba(16, 185, 129, 0.1)';
      case '관광명소':
        return 'rgba(124, 58, 237, 0.1)';
      default:
        return 'rgba(107, 114, 128, 0.1)';
    }
  }};
  color: ${(props) => {
    switch (props.category) {
      case '맛집':
        return '#dc2626';
      case '액티비티':
        return '#059669';
      case '관광명소':
        return '#7c3aed';
      default:
        return '#374151';
    }
  }};
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
`;

const VerifiedBadge = styled.span`
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  border: 1px solid rgba(16, 185, 129, 0.2);
`;

const SourceBadge = styled.span`
  background: rgba(54, 130, 248, 0.1);
  color: #2563eb;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 500;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
`;

const EmptyTitle = styled.h3`
  margin: 0 0 8px 0;
  color: #374151;
  font-size: 18px;
  font-weight: 600;
`;

const EmptyDescription = styled.p`
  margin: 0 0 24px 0;
  color: #64748b;
  font-size: 14px;
  line-height: 1.5;
`;

const RetryButton = styled.button`
  background: #3682f8;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #2563eb;
    transform: translateY(-1px);
  }
`;

export default NearbyRecommendations;
