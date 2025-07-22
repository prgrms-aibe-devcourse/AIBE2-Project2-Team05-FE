import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import PlaceDetailModal from './PlaceDetailModal';
import { AIRecommendationData } from '../types/plan';
import openaiService from '../services/openaiApi';

// 추천 장소 타입 정의
interface RecommendedPlace {
  name: string;
  description: string;
  category: string;
  distance: string;
  verified: boolean;
  source?: string;
}

interface AIRecommendationSectionProps {
  planId?: string; // 저장된 플랜 ID
  savedRecommendations?: AIRecommendationData; // 저장된 추천 데이터
  destination: string;
  travelStyles: string[];
  visitedPlaces: string[]; // 여행 계획의 실제 방문 예정 장소들
}

const AIRecommendationSection: React.FC<AIRecommendationSectionProps> = ({
  planId,
  savedRecommendations,
  destination,
  travelStyles,
  visitedPlaces,
}) => {
  const [recommendations, setRecommendations] = useState<RecommendedPlace[]>(
    [],
  );
  const [loading, setLoading] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 저장된 추천 데이터 로드
  const loadSavedRecommendations = useCallback(() => {
    console.log('🔄 저장된 AI 추천 데이터 로드 시작...');

    // 1. props로 전달된 savedRecommendations 우선 사용
    if (savedRecommendations && savedRecommendations.recommendations) {
      console.log(
        '✅ Props에서 추천 데이터 발견:',
        savedRecommendations.recommendations.length,
        '개',
      );
      setRecommendations(savedRecommendations.recommendations);
      return;
    }

    // 2. planId가 있으면 localStorage에서 해당 플랜의 추천 데이터 로드
    if (planId) {
      try {
        const planDataStr = localStorage.getItem(`plan_${planId}`);
        if (planDataStr) {
          const planData = JSON.parse(planDataStr);

          // ✅ 우선 planData.nearbyRecommendations 확인 (PlanWritePage에서 저장한 데이터)
          if (
            planData.nearbyRecommendations &&
            Array.isArray(planData.nearbyRecommendations)
          ) {
            console.log(
              '✅ 메인 플랜에서 추천 데이터 발견:',
              planData.nearbyRecommendations.length,
              '개',
            );
            setRecommendations(planData.nearbyRecommendations);
            return;
          }

          // 🔄 기존 방식도 지원 (하위 호환성)
          if (
            planData.aiRecommendations &&
            planData.aiRecommendations.recommendations
          ) {
            console.log(
              '✅ 기존 형식 추천 데이터 발견:',
              planData.aiRecommendations.recommendations.length,
              '개',
            );
            setRecommendations(planData.aiRecommendations.recommendations);
            return;
          }
        }
      } catch (error) {
        console.error('localStorage에서 플랜 데이터 로드 중 오류:', error);
      }
    }

    // 3. 저장된 추천이 없는 경우
    console.log('⚠️ 저장된 AI 추천 데이터가 없습니다.');
    setRecommendations([]);
  }, [planId, savedRecommendations]);

  // 새로운 AI 추천 생성 및 저장
  const generateNewRecommendations = async () => {
    if (!destination || travelStyles.length === 0) {
      console.warn('⚠️ 목적지나 여행 스타일 정보가 없습니다.');
      return;
    }

    setLoading(true);
    console.log('🤖 새로운 AI 추천 생성 시작...', {
      destination,
      travelStyles,
      visitedPlaces,
    });

    try {
      // OpenAI API를 통해 추천 생성 (visitedPlaces를 days 형식으로 변환)
      const travelPlanData = {
        days: [
          {
            day: 1,
            activities: visitedPlaces.map((place) => ({ name: place })),
          },
        ],
      };

      const aiRecommendations =
        await openaiService.generateNearbyRecommendations(
          destination,
          travelStyles,
          travelPlanData,
        );

      if (aiRecommendations && aiRecommendations.length > 0) {
        console.log('✅ AI 추천 생성 성공:', aiRecommendations.length, '개');

        // RecommendedPlace 형식으로 변환
        const formattedRecommendations: RecommendedPlace[] =
          aiRecommendations.map((rec, index) => ({
            name: rec.name,
            description: rec.description,
            category: rec.category || '관광명소',
            distance: rec.distance || '정보 없음',
            verified: rec.verified || false,
            source: 'OpenAI',
          }));

        setRecommendations(formattedRecommendations);

        // ✅ localStorage에 저장 (planId가 있는 경우) - 메인 planData에 통합 저장
        if (planId) {
          try {
            // 기존 planData 로드
            const existingPlanStr = localStorage.getItem(`plan_${planId}`);
            if (existingPlanStr) {
              const planData = JSON.parse(existingPlanStr);

              // nearbyRecommendations 업데이트
              planData.nearbyRecommendations = formattedRecommendations;
              planData.lastRecommendationUpdate = new Date().toISOString();

              // planData 다시 저장
              localStorage.setItem(`plan_${planId}`, JSON.stringify(planData));
              console.log('💾 메인 planData에 AI 추천 업데이트 완료:', planId);
            } else {
              console.warn(
                '⚠️ 메인 planData를 찾을 수 없어 별도 저장:',
                planId,
              );
              // 메인 planData가 없으면 기존 방식으로 저장
              const recommendationData = {
                destination,
                travelStyles,
                visitedPlaces,
                recommendations: formattedRecommendations,
                generatedAt: new Date().toISOString(),
              };
              localStorage.setItem(
                `ai_recommendations_${planId}`,
                JSON.stringify(recommendationData),
              );
            }
          } catch (error) {
            console.error('AI 추천 저장 중 오류:', error);
          }
        }
      } else {
        console.warn('⚠️ AI 추천 결과가 없습니다.');
        setRecommendations([]);
      }
    } catch (error) {
      console.error('❌ AI 추천 생성 실패:', error);
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSavedRecommendations();
  }, [loadSavedRecommendations]);

  // 장소 클릭 핸들러
  const handlePlaceClick = (placeName: string) => {
    console.log('🏛️ 장소 클릭:', placeName);
    setSelectedPlace(placeName);
    setIsModalOpen(true);
  };

  // 모달 닫기 핸들러
  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedPlace(null);
  };

  // 카테고리별 색상
  const getCategoryColor = (category: string) => {
    switch (category) {
      case '맛집':
        return '#FF6B6B';
      case '액티비티':
        return '#4ECDC4';
      case '관광명소':
        return '#45B7D1';
      default:
        return '#95A5A6';
    }
  };

  // 추천이 없는 경우의 렌더링
  if (recommendations.length === 0) {
    return (
      <Container>
        <Header>
          <Title>🤖 AI 추천 근처 가볼만한 곳</Title>
        </Header>
        <EmptyState>
          <EmptyIcon>🔍</EmptyIcon>
          <EmptyText>AI 추천 데이터가 없습니다</EmptyText>
          <EmptyDescription>
            AI가 {destination} 근처의 맞춤 장소를 추천해드릴게요!
            <br />✨ 아래 버튼을 클릭해서 새로운 추천을 받아보세요!
          </EmptyDescription>
          <RefreshButton
            onClick={generateNewRecommendations}
            disabled={loading}
            style={{ marginTop: '16px' }}
          >
            {loading ? '🔄 생성 중...' : '🤖 AI 추천받기'}
          </RefreshButton>
        </EmptyState>
      </Container>
    );
  }

  return (
    <>
      <Container>
        <Header>
          <Title>🤖 AI 추천 근처 가볼만한 곳</Title>
          <RefreshButton
            onClick={generateNewRecommendations}
            disabled={loading}
          >
            {loading ? '🔄 생성 중...' : '✨ 새로 추천받기'}
          </RefreshButton>
        </Header>

        {loading ? (
          <LoadingContainer>
            <LoadingSpinner />
            <LoadingText>
              {destination} 근처 맞춤 추천 장소를 찾고 있습니다...
            </LoadingText>
          </LoadingContainer>
        ) : recommendations.length > 0 ? (
          <>
            <PlacesGrid>
              {recommendations.map((place, index) => (
                <PlaceCard
                  key={index}
                  onClick={() => handlePlaceClick(place.name)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                >
                  <PlaceHeader>
                    <PlaceName>{place.name}</PlaceName>
                    <CategoryBadge color={getCategoryColor(place.category)}>
                      {place.category}
                    </CategoryBadge>
                  </PlaceHeader>
                  <PlaceDescription>{place.description}</PlaceDescription>
                  <PlaceFooter>
                    <Distance>📍 {place.distance}</Distance>
                    <VerificationBadge verified={place.verified}>
                      {place.verified ? '✅ 실제 장소' : '❓ 확인 중'}
                    </VerificationBadge>
                  </PlaceFooter>
                </PlaceCard>
              ))}
            </PlacesGrid>
            <FooterNote>
              💡 AI가 {destination} 근처에서 추천하는 장소들입니다. 클릭하면
              상세 정보를 확인할 수 있어요!
            </FooterNote>
          </>
        ) : (
          <EmptyState>
            <EmptyIcon>🗺️</EmptyIcon>
            <EmptyText>
              아직 추천할 장소가 없습니다.
              <br />
              여행 계획에 방문 장소를 추가해보세요!
            </EmptyText>
          </EmptyState>
        )}
      </Container>

      {/* 장소 상세 정보 모달 */}
      <PlaceDetailModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        placeName={selectedPlace || ''}
        region={destination}
      />
    </>
  );
};

// 스타일 컴포넌트들
const Container = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin: 24px 0;
  border: 1px solid #e5e7eb;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
`;

const Title = styled.h2`
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const RefreshButton = styled.button`
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  color: #64748b;
  padding: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: #e2e8f0;
    color: #3682f8;
    transform: scale(1.05);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
`;

const LoadingSpinner = styled.div`
  width: 32px;
  height: 32px;
  border: 2px solid #e5e7eb;
  border-top-color: #3682f8;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 12px;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const LoadingText = styled.div`
  color: #64748b;
  font-size: 14px;
`;

const PlacesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
  margin-bottom: 16px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const PlaceCard = styled(motion.div)`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px;
  position: relative;
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    border-color: #3682f8;
    box-shadow: 0 4px 12px rgba(54, 130, 248, 0.1);
    transform: translateY(-2px);
  }
`;

const PlaceHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const PlaceName = styled.h3`
  margin: 0 0 4px 0;
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  line-height: 1.3;
`;

const CategoryBadge = styled.span<{ color: string }>`
  background-color: ${(props) => props.color};
  color: white;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  z-index: 1;
`;

const PlaceDescription = styled.p`
  margin: 0 0 12px 0;
  color: #64748b;
  font-size: 14px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const PlaceFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
`;

const Distance = styled.span`
  color: #64748b;
  font-size: 14px;
  font-weight: 500;
`;

const VerificationBadge = styled.span<{ verified: boolean }>`
  background: ${(props) =>
    props.verified ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'};
  color: ${(props) => (props.verified ? '#059669' : '#EF4444')};
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  border: ${(props) =>
    props.verified
      ? '1px solid rgba(16, 185, 129, 0.2)'
      : '1px solid rgba(239, 68, 68, 0.2)'};
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
`;

const EmptyText = styled.h3`
  margin: 0 0 8px 0;
  color: #374151;
  font-size: 16px;
  font-weight: 600;
`;

const EmptyDescription = styled.p`
  margin: 0;
  color: #64748b;
  font-size: 14px;
  line-height: 1.5;
`;

const FooterNote = styled.div`
  text-align: center;
  color: #9ca3af;
  font-size: 12px;
  padding-top: 16px;
  border-top: 1px solid #f3f4f6;
`;

export default AIRecommendationSection;
