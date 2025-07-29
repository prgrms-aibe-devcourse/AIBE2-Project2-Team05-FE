import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import matchingApiService from '../services/matchingApi';
import PlanPage from './PlanPage';
import profileApiService from '../services/profileApi'; // 🔧 실제 프로필 데이터를 위한 import

// 간단한 매칭 사용자 인터페이스
interface MatchingUser {
  id: number;
  name: string;
  age: number;
  location: string;
  profileImage: string;
  destination: string;
  duration: string;
  budget: string;
  travelStyle: string[];
  coordinates: { lat: number; lng: number };
  maxMembers: number;
  currentMembers: number;
  gender: string;
  compatibilityScore?: number;
  travelPlanId?: number; // 🔧 백엔드 매칭용 여행 계획 ID 추가
}

// 목적지별 기본 좌표 (대한민국 주요 도시)
const defaultCoordinates: { [key: string]: { lat: number; lng: number } } = {
  '서울': { lat: 37.5665, lng: 126.9780 },
  '부산': { lat: 35.1796, lng: 129.0756 },
  '대구': { lat: 35.8714, lng: 128.6014 },
  '인천': { lat: 37.4563, lng: 126.7052 },
  '광주': { lat: 35.1595, lng: 126.8526 },
  '대전': { lat: 36.3504, lng: 127.3845 },
  '울산': { lat: 35.5384, lng: 129.3114 },
  '제주도': { lat: 33.4996, lng: 126.5312 },
  '강릉': { lat: 37.7519, lng: 128.8761 },
  '경주': { lat: 35.8562, lng: 129.2247 },
};

const MatchRecommendPage: React.FC = () => {
  // 상태 관리
  const [allUsers, setAllUsers] = useState<MatchingUser[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [processedUserIds, setProcessedUserIds] = useState(new Set<number>());
  const [likedUserIds, setLikedUserIds] = useState(new Set<number>());
  const [passedUserIds, setPassedUserIds] = useState(new Set<number>());
  
  // 🔧 실제 프로필 데이터 관리를 위한 상태 추가
  const [currentUserProfile, setCurrentUserProfile] = useState<{
    profileImage?: string;
    age?: number;
    residence?: string;
  } | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  // 백엔드 API에서 매칭 추천 데이터 로드
  useEffect(() => {
    const loadMatchingRecommendations = async () => {
      setIsLoadingUsers(true);
      console.log('🔄 백엔드에서 매칭 추천 데이터 로드 시작...');
      
      try {
        // 백엔드 매칭 추천 API 호출
        const backendRecommendations = await matchingApiService.getRecommendations();
        console.log(`📡 백엔드 매칭 추천 ${backendRecommendations.length}개 로드 성공`);

        // 백엔드 데이터를 MatchingUser 형식으로 변환
        const matchingUsers: MatchingUser[] = backendRecommendations.map((rec) => ({
          id: rec.userId,
          name: rec.nickname,
          age: 0, // 🔧 실제 나이는 별도 프로필 API에서 로드
          location: rec.location,
          profileImage: '👤', // 🔧 실제 프로필 이미지는 별도 프로필 API에서 로드
          destination: rec.location,
          duration: `${rec.startDate} ~ ${rec.endDate}`,
          budget: '예산 협의', // 백엔드에서 제공하지 않는 정보
          travelStyle: ['맛집탐방', '자연감상', '휴식'], // 백엔드에서 제공하지 않는 정보
          coordinates: defaultCoordinates[rec.location] || { lat: 37.5665, lng: 126.9780 },
          maxMembers: 4, // 백엔드에서 제공하지 않는 정보
          currentMembers: 1,
          gender: '무관',
          compatibilityScore: rec.compatibilityScore,
          travelPlanId: rec.travelPlanId, // 🔧 백엔드의 여행 계획 ID 매핑
        }));

        setAllUsers(matchingUsers);
        console.log(`✅ 백엔드 매칭 추천에서 ${matchingUsers.length}개 사용자 생성`);
      } catch (error) {
        console.error('❌ 백엔드 매칭 추천 로드 실패:', error);
        setAllUsers([]);
      } finally {
        setIsLoadingUsers(false);
      }
    };

    loadMatchingRecommendations();
  }, []);

  // 필터링된 사용자 목록 (처리되지 않은 사용자만)
  const filteredUsers = allUsers.filter(user => !processedUserIds.has(user.id));
  const currentUser = filteredUsers.length > 0 ? filteredUsers[currentIndex] : null;

  // 🔧 현재 사용자의 실제 프로필 정보 로드
  useEffect(() => {
    const loadCurrentUserProfile = async () => {
      if (!currentUser) {
        setCurrentUserProfile(null);
        return;
      }

      setIsLoadingProfile(true);
      try {
        console.log(`👤 사용자 ${currentUser.name}(ID: ${currentUser.id})의 실제 프로필 정보 로드 시작`);
        
        const profileData = await profileApiService.getProfile(currentUser.id);
        
        setCurrentUserProfile({
          profileImage: profileData.profileImage,
          age: profileData.age,
          residence: profileData.residence
        });
        
        console.log(`✅ 사용자 ${currentUser.name}의 실제 프로필 정보 로드 완료:`, {
          profileImage: profileData.profileImage,
          age: profileData.age,
          residence: profileData.residence
        });
      } catch (error) {
        console.error(`❌ 사용자 ${currentUser.name}의 프로필 정보 로드 실패:`, error);
        setCurrentUserProfile(null);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    loadCurrentUserProfile();
  }, [currentUser?.id]); // currentUser.id가 변경될 때마다 실행

  // 좋아요 처리 (매칭 요청 전송)
  const handleLike = async () => {
    if (!currentUser) return;

    try {
      console.log(`💖 ${currentUser.name}님에게 매칭 요청 전송!`);
      
      // travelPlanId가 없으면 요청을 보낼 수 없음
      if (!currentUser.travelPlanId) {
        console.error('❌ 여행 계획 ID가 없습니다:', currentUser);
        return;
      }
      
      // 백엔드 API로 매칭 요청 전송
      const matchRequest = {
        receiverId: currentUser.id, // 상대방 ID
        planId: currentUser.travelPlanId // 여행 계획 ID (올바른 필드 사용)
      };
      
      console.log('📤 매칭 요청 데이터:', matchRequest);

      const response = await matchingApiService.sendMatchRequest(matchRequest);
      console.log('✅ 매칭 요청 전송 성공:', response);

      // 사용자를 처리완료 목록에 추가
      setProcessedUserIds(prev => new Set([...Array.from(prev), currentUser.id]));
      setLikedUserIds(prev => new Set([...Array.from(prev), currentUser.id]));

      // 다음 사용자로 이동
      setCurrentIndex(0); // 항상 첫 번째 미처리 사용자를 표시
    } catch (error) {
      console.error('❌ 매칭 요청 전송 실패:', error);
      // 오류가 발생해도 UI는 계속 진행
      setProcessedUserIds(prev => new Set([...Array.from(prev), currentUser.id]));
      setLikedUserIds(prev => new Set([...Array.from(prev), currentUser.id]));
      setCurrentIndex(0);
    }
  };

  // 패스 처리 (매칭 거절)
  const handlePass = async () => {
    if (!currentUser) return;

    // 🚨 travelPlanId가 없으면 거절 불가
    if (!currentUser.travelPlanId) {
      console.error('❌ 여행 계획 ID가 없어서 거절할 수 없습니다:', currentUser);
      alert('여행 계획 정보가 없어서 거절할 수 없습니다.');
      return;
    }

    try {
      console.log(`⏭️ ${currentUser.name}님을 패스 (Plan ID: ${currentUser.travelPlanId})`);
      
      // 🔧 올바른 travelPlanId로 매칭 거절 처리
      await matchingApiService.rejectPlan(currentUser.travelPlanId);
      console.log('✅ 매칭 거절 성공');

      // 사용자를 처리완료 목록에 추가
      setProcessedUserIds(prev => new Set([...Array.from(prev), currentUser.id]));
      setPassedUserIds(prev => new Set([...Array.from(prev), currentUser.id]));

      // 다음 사용자로 이동
      setCurrentIndex(0);
    } catch (error) {
      console.error('❌ 매칭 거절 실패:', error);
      // 오류가 발생해도 UI는 계속 진행
      setProcessedUserIds(prev => new Set([...Array.from(prev), currentUser.id]));
      setPassedUserIds(prev => new Set([...Array.from(prev), currentUser.id]));
      setCurrentIndex(0);
    }
  };

  // 로딩 중
  if (isLoadingUsers) {
    return (
      <Container
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <LoadingContainer>
          <LoadingIcon>🔄</LoadingIcon>
          <LoadingText>백엔드에서 매칭 추천을 가져오는 중...</LoadingText>
        </LoadingContainer>
      </Container>
    );
  }

  // 더 이상 매칭할 사용자가 없을 때
  if (!currentUser) {
    return (
      <Container
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          textAlign: 'center',
          padding: '40px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
        }}
      >
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{ fontSize: '4rem', marginBottom: '20px' }}
        >
          🎯
        </motion.div>

        <motion.h2
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            marginBottom: '16px',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
          }}
        >
          모든 매칭을 완료했어요! 🎉
        </motion.h2>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px',
            marginBottom: '32px',
          }}
        >
          <StatCard>
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>💖</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
              {likedUserIds.size}
            </div>
            <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>좋아요</div>
          </StatCard>

          <StatCard>
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>⏭️</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
              {passedUserIds.size}
            </div>
            <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>패스</div>
          </StatCard>
        </motion.div>

        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setProcessedUserIds(new Set());
            setLikedUserIds(new Set());
            setPassedUserIds(new Set());
            setCurrentIndex(0);
          }}
          style={{
            background: 'rgba(255,255,255,0.3)',
            border: 'none',
            borderRadius: '50px',
            padding: '16px 32px',
            color: 'white',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
          }}
        >
          🔄 다시 시작하기
        </motion.button>
      </Container>
    );
  }

  return (
    <Container
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
    >
      <MainContent>
        {/* Pass 버튼 */}
        <SideAction>
          <ActionButton onClick={handlePass} $type="pass">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </ActionButton>
        </SideAction>

        {/* 🔧 가운데 카드를 PlanPage 컴포넌트로 교체 */}
        <CardContainer>
          {currentUser.travelPlanId ? (
            <PlanPageCard>
              <PlanContentWrapper>
                <PlanPage
                  planId={currentUser.travelPlanId.toString()}
                  authorInfo={{
                    author: currentUser.name,
                    avatar: isLoadingProfile ? '⏳' : (currentUserProfile?.profileImage || '👤'), // 🔧 실제 프로필 이미지
                    age: isLoadingProfile ? 0 : (currentUserProfile?.age || 25) // 🔧 실제 나이
                  }}
                  isModal={true}
                />
              </PlanContentWrapper>
            </PlanPageCard>
          ) : (
            <FallbackCard>
              <div style={{ fontSize: '3rem', marginBottom: '20px' }}>😅</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '10px' }}>
                여행 계획 정보가 없어요
              </div>
              <div style={{ fontSize: '1rem', opacity: 0.7 }}>
                {currentUser.name}님의 상세 정보를 불러올 수 없습니다
              </div>
            </FallbackCard>
          )}
        </CardContainer>

        {/* Like 버튼 */}
        <SideAction>
          <ActionButton onClick={handleLike} $type="like">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="white"
              stroke="white"
              strokeWidth="1"
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </ActionButton>
        </SideAction>
      </MainContent>

      {/* 진행 상황 표시 */}
      <ProgressIndicator>
        {processedUserIds.size} / {allUsers.length} 완료
      </ProgressIndicator>
    </Container>
  );
};

export default MatchRecommendPage;

// Styled Components
const Container = styled(motion.div)`
  min-height: 100vh;
  background: linear-gradient(135deg, #3682f8 0%, #2563eb 100%);
  padding: 0;
  margin: 0;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  color: white;
`;

const LoadingIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
  animation: spin 2s linear infinite;

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.div`
  font-size: 1.2rem;
  opacity: 0.9;
`;

const MainContent = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 100px; /* 버튼과 카드 사이 간격 크게 */
  width: 100%;
  height: 100vh;
  padding: 20px;
  box-sizing: border-box;
  
  @media (max-width: 768px) {
    gap: 40px;
    padding: 10px;
  }
`;

const SideAction = styled.div`
  display: flex;
  flex-direction: column;
  gap: 30px; /* 버튼들 사이 간격 */
`;

const ActionButton = styled.button<{ $type: 'pass' | 'like' }>`
  width: 100px; /* 버튼 크기 증가 */
  height: 100px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25); /* 그림자 강화 */
  
  background: ${props => 
    props.$type === 'pass' 
      ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
      : 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
  };

  &:hover {
    transform: translateY(-6px) scale(1.08); /* 호버 효과 강화 */
    box-shadow: 0 16px 50px rgba(0, 0, 0, 0.35);
  }

  &:active {
    transform: translateY(-3px) scale(0.95);
  }
  
  /* SVG 아이콘 크기 조정 */
  svg {
    width: 44px;
    height: 44px;
  }
  
  @media (max-width: 768px) {
    width: 80px;
    height: 80px;
    
    svg {
      width: 36px;
      height: 36px;
    }
  }
`;

const CardContainer = styled.div`
  /* 🔧 프로필 페이지 모달 크기에 맞춤 */
  width: 90vw;
  max-width: 1200px;
  height: 85vh;
  max-height: 800px;
  
  @media (max-width: 768px) {
    width: 95vw;
    height: 90vh;
  }
`;

// 🔧 PlanPage를 담을 카드 컨테이너
const PlanPageCard = styled.div`
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(54, 130, 248, 0.2);
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

// PlanPage 내용을 담을 래퍼
const PlanContentWrapper = styled.div`
  flex: 1;
  overflow: hidden;
  position: relative;
  
  // PlanPage 내부 스크롤 허용
  & > div {
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
    
    &::-webkit-scrollbar {
      width: 8px; /* 스크롤바 크기 증가 */
    }
    
    &::-webkit-scrollbar-track {
      background: transparent;
    }
    
    &::-webkit-scrollbar-thumb {
      background: rgba(0, 0, 0, 0.2);
      border-radius: 6px;
      transition: background 0.2s ease;
    }
    
    &::-webkit-scrollbar-thumb:hover {
      background: rgba(0, 0, 0, 0.4);
    }
  }
`;

// 여행 계획이 없을 때 표시할 폴백 카드
const FallbackCard = styled.div`
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(54, 130, 248, 0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: #64748b;
  padding: 40px;
  
  /* 폰트 크기 증가 */
  & > div:first-child {
    font-size: 4rem !important;
    margin-bottom: 30px !important;
  }
  
  & > div:nth-child(2) {
    font-size: 1.5rem !important;
    font-weight: bold;
    margin-bottom: 15px !important;
  }
  
  & > div:nth-child(3) {
    font-size: 1.2rem !important;
    opacity: 0.7;
  }
`;

const StatCard = styled.div`
  background: rgba(255,255,255,0.2);
  padding: 20px;
  border-radius: 12px;
  backdrop-filter: blur(10px);
  text-align: center;
`;

const ProgressIndicator = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.9);
  padding: 12px 20px; /* 패딩 증가 */
  border-radius: 25px; /* 라운드 증가 */
  font-size: 14px; /* 폰트 크기 증가 */
  font-weight: 600;
  color: #3682f8;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); /* 그림자 추가 */
`;
