/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import profileApiService from '../services/profileApi';
import PlanPage from './PlanPage';

// ✅ 모듈화된 컴포넌트들 import
import {
  ProfileHeader,
  BioSection,
  ProfileTabs,
  PostsGrid,
  LoadingSpinner,
  ErrorDisplay,
  ImageModal
} from '../components/profile';

// Types
interface UserProfile {
  id?: number;
  username: string;
  nickname: string;
  profileImage: string;
  bio: string;
  age: number; // 🔧 백엔드에서 제공하는 나이 추가
  postsCount: number;
  followersCount: number;
  followingCount: number;
  feeds?: UserFeed[];
  isCurrentUser?: boolean;
}

// 백엔드에서 받은 피드 데이터 타입
interface BackendFeed {
  travelPlanId: number;
  title?: string;
  location?: string;
  imageUrl?: string;
  startDate?: string;
  planId?: string;
}

interface UserFeed {
  id: string | number;
  author: string;
  avatar: string;
  image: string;
  caption: string;
  likes: number;
  type: 'travel-plan' | 'photo';
  planId?: string;
  createdAt: string;
  travelType: 'created' | 'participated';
  authorName?: string; // ✅ 여행 계획 작성자 이름 (여행리더 구분용)
}

interface ProfilePageProps {
  isOwnProfile?: boolean;
}

// ✅ TravelPlan 모달 컴포넌트 (프로필 정보 포함)
const TravelPlanModal: React.FC<{
  planId: string;
  authorInfo?: {
    author: string;
    avatar: string;
    age: number;
  };
  onClose: () => void;
}> = ({ planId, authorInfo, onClose }) => {
  
  // ✅ 프로필페이지 모달에서의 작성자 정보 로깅
  console.log('🏡 프로필페이지 TravelPlanModal에서 받은 작성자 정보:', {
    planId,
    authorInfo,
    '전달할 정보': authorInfo ? `${authorInfo.author} (${authorInfo.age}세)` : '없음'
  });

  return (
    <ModalOverlay
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <PlanPageModalContent
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <ModalCloseButton onClick={onClose}>&times;</ModalCloseButton>
        <PlanPageWrapper>
          <PlanPage planId={planId} isModal={true} authorInfo={authorInfo} />
        </PlanPageWrapper>
      </PlanPageModalContent>
    </ModalOverlay>
  );
};

// Main Component
const ProfilePage: React.FC<ProfilePageProps> = ({ isOwnProfile = false }) => {
  const { nickname } = useParams<{ nickname: string }>();
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const location = useLocation();

  // States
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [feeds, setFeeds] = useState<UserFeed[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'created' | 'participated'>('created');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [travelPlanModalOpen, setTravelPlanModalOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // ✅ 기본 프로필 이미지를 memo로 최적화 (컴포넌트 레벨에서)
  const defaultProfileImage = useMemo(() => 
    `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
      <svg width="150" height="150" viewBox="0 0 150 150" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="75" cy="75" r="75" fill="url(#gradient)"/>
        <circle cx="75" cy="55" r="25" fill="white" opacity="0.9"/>
        <path d="M75 85c-20 0-36 12-36 26v14h72v-14c0-14-16-26-36-26z" fill="white" opacity="0.9"/>
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#667eea"/>
            <stop offset="100%" style="stop-color:#764ba2"/>
          </linearGradient>
        </defs>
      </svg>
    `)}`, []
  );

  // ✅ 최적화된 새로고침 함수
  const refreshProfile = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  // ✅ 최적화된 프로필 로드 함수
  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get profile data from backend
      let profileData: any = null;
      if (isOwnProfile) {
        profileData = await profileApiService.getMyProfile();
        console.log('👤 내 프로필 데이터 로드 성공:', profileData);
      } else if (nickname) {
        profileData = await profileApiService.getProfileByNickname(nickname);
        console.log('👤 다른 사용자 프로필 데이터 로드 성공:', profileData);
      } else {
        throw new Error('프로필을 불러올 수 없습니다.');
      }

      // ✅ 피드 처리 최적화 - map으로 변경하고 로그 제거
      const processedFeeds: UserFeed[] = profileData?.feeds?.map((feed: any, index: number) => {
        const caption = `📍 ${feed.location || '여행지'}
✨ ${feed.title || '여행 계획'}
📅 ${feed.startDate ? new Date(feed.startDate).toLocaleDateString() : '날짜 미정'}`;

        // 🔧 이미지 URL 디버깅 및 개선
        console.log(`🖼️ [피드 ${index}] 이미지 확인:`, {
          travelPlanId: feed.travelPlanId,
          imageUrl: feed.imageUrl,
          hasImage: !!feed.imageUrl,
          location: feed.location
        });

        return {
          id: `feed-${feed.travelPlanId}-${index}`,
          author: profileData.nickname || 'Unknown',
          avatar: profileData.profileImage || '/default-avatar.jpg',
          image: feed.imageUrl || '/default-place-image.jpg', // 🔧 실제 구글 이미지 우선 사용
          caption,
          likes: 0,
          type: 'travel-plan' as const,
          planId: feed.planId || `plan_${feed.travelPlanId}`,
          createdAt: feed.startDate || new Date().toISOString(),
          travelType: 'created' as const,
          authorName: feed.authorName,
        };
      }) || [];

      setFeeds(processedFeeds);

      // ✅ AuthContext 업데이트 - 내 프로필일 때만 업데이트
      if (isOwnProfile && profileData && user) {
        const shouldUpdate = !user.nickname || user.nickname !== profileData.nickname;
        if (shouldUpdate) {
          console.log('🔄 AuthContext 사용자 정보 업데이트:', {
            기존: { nickname: user.nickname, profileImage: user.profileImage },
            새로운: { nickname: profileData.nickname, profileImage: profileData.profileImage }
          });
          updateUser({
            nickname: profileData.nickname,
            profileImage: profileData.profileImage,
            bio: profileData.bio,
            age: profileData.age,
            gender: profileData.gender,
            id: profileData.id,
          });
        }
      }

      // ✅ 실제 백엔드 데이터 사용 (목 데이터 제거)
      setProfile({
        id: profileData.id,
        username: profileData.email || 'user',
        nickname: profileData.nickname || '닉네임 없음',
        profileImage: profileData.profileImage || defaultProfileImage,
        bio: profileData.bio || '자기소개가 없습니다.',
        age: profileData.age || 25, // 🔧 백엔드에서 제공하는 실제 나이 사용
        postsCount: profileData.postsCount || 0,
        followersCount: profileData.followerCount || 0,
        followingCount: profileData.followingCount || 0,
                 feeds: processedFeeds,
        isCurrentUser: isOwnProfile || (user?.email === profileData.email) || false,
      });

      console.log('✅ 프로필 설정 완료:', {
        nickname: profileData.nickname,
        postsCount: profileData.postsCount,
        followersCount: profileData.followerCount,
        followingCount: profileData.followingCount,
                 isCurrentUser: isOwnProfile || (user?.email === profileData.email) || false,
      });

    } catch (error) {
      console.error('❌ 프로필 로드 실패:', error);
      if (error instanceof Error && error.message.includes('사용자를 찾을 수 없습니다')) {
        setError(`사용자 "${nickname}"을(를) 찾을 수 없습니다.`);
      } else {
        setError('프로필을 불러올 수 없습니다.');
      }
    } finally {
      setLoading(false);
    }
  }, [isOwnProfile, nickname, user, updateUser, defaultProfileImage]);

  // ✅ 최적화된 useEffect
  useEffect(() => {
    loadProfile();
  }, [loadProfile, refreshKey]);

  // ✅ 최적화된 이벤트 핸들러들
  const handleImageClick = useCallback((imageUrl: string) => {
    setSelectedImage(imageUrl);
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setSelectedImage('');
  }, []);

  const handleFeedClick = useCallback((feed: UserFeed) => {
    if (feed.type === 'travel-plan') {
      setSelectedPlanId(feed.planId || feed.id.toString());
      setTravelPlanModalOpen(true);
      
      // ✅ 프로필페이지에서 모달 열기 로그
      console.log('🏡 프로필페이지에서 여행계획 모달 열기:', {
        feedId: feed.id,
        planId: feed.planId,
        profileInfo: profile ? {
          nickname: profile.nickname,
          profileImage: profile.profileImage
        } : null
      });
    }
  }, [profile]);

  const closeTravelPlanModal = useCallback(() => {
    setTravelPlanModalOpen(false);
    setSelectedPlanId(null);
  }, []);

  // ✅ 최적화된 피드 삭제 핸들러
  const handleDeleteFeed = useCallback(async (feedId: string | number, event: React.MouseEvent) => {
    event.stopPropagation();
    
    const isConfirmed = window.confirm('이 게시물을 삭제하시겠습니까?');
    if (!isConfirmed) return;

    try {
      await profileApiService.deleteFeed(feedId);
      setFeeds(prevFeeds => prevFeeds.filter((feed) => feed.id !== feedId));
      setProfile(prevProfile => prevProfile ? {
        ...prevProfile,
        postsCount: Math.max(0, prevProfile.postsCount - 1),
      } : null);
    } catch (error) {
      alert('피드 삭제에 실패했습니다. 다시 시도해주세요.');
    }
  }, []);

  // ✅ 설정 버튼 표시 여부를 memo로 최적화
  const shouldShowSettings = useMemo(() => {
    const isOwnProfilePath = location.pathname === '/profile';
    const isSameUser = user && profile && user.nickname === profile.nickname;
    const result = isOwnProfile || isOwnProfilePath || isSameUser;
    
    // 디버깅 로그 추가
    console.log('🔧 설정 버튼 표시 조건 확인:', {
      isOwnProfile,
      isOwnProfilePath,
      isSameUser,
      'location.pathname': location.pathname,
      'user?.nickname': user?.nickname,
      'profile?.nickname': profile?.nickname,
      '최종 결과': result
    });
    
    return result;
  }, [isOwnProfile, location.pathname, user, profile]);

  // Render loading state
  if (loading) {
    return <LoadingSpinner />;
  }

  // Render error state
  if (error || !profile) {
    return (
      <ErrorDisplay 
        message={error || '프로필을 찾을 수 없습니다.'} 
        onRetry={() => window.location.reload()} 
      />
    );
  }

  return (
    <Container>
      {/* 설정 버튼 - 자신의 프로필에서만 표시 */}
      {shouldShowSettings && (
        <SettingsButton onClick={() => navigate('/mypage')}>⚙️</SettingsButton>
      )}

      {/* 모듈화된 컴포넌트들 사용 */}
      <ProfileHeader profile={profile} feedCount={feeds.length} />
      
      <BioSection bio={profile.bio} />
      
      <ProfileTabs 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        feeds={feeds} 
      />

      <TabContent>
        <PostsGrid
          feeds={feeds}
          activeTab={activeTab}
          isCurrentUser={profile.isCurrentUser}
          onFeedClick={handleFeedClick}
          onDeleteFeed={handleDeleteFeed}
        />
      </TabContent>

      {/* Modals */}
      {modalOpen && (
        <ImageModal imageUrl={selectedImage} onClose={closeModal} />
      )}
      {travelPlanModalOpen && selectedPlanId && profile && (
        <TravelPlanModal
          planId={selectedPlanId}
          authorInfo={{
            author: profile.nickname,
            avatar: profile.profileImage,
            age: profile.age || 25 // 🔧 백엔드에서 제공하는 실제 나이 사용
          }}
          onClose={closeTravelPlanModal}
        />
      )}
    </Container>
  );
};

// 남은 스타일 컴포넌트들 (모달 관련)
const Container = styled.div`
  position: relative; /* 설정 버튼 위치를 위해 추가 */
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;

  @media (max-width: 768px) {
    padding: 10px;
  }
`;



const TabContent = styled.div`
  padding: 20px 0;
`;

// 모달 관련 스타일 컴포넌트들
const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
`;

const PlanPageModalContent = styled(motion.div)`
  background: white;
  border-radius: 16px;
  width: 90vw;  /* 고정 너비 */
  max-width: 1200px;  /* 최대 너비 제한 */
  height: 85vh;  /* 고정 높이 */
  max-height: 800px;  /* 최대 높이 제한 */
  overflow-y: auto;
  position: relative;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.2);  /* 그림자 부드럽게 */
  margin: 20px;  /* 여백 추가 */
  
  /* 스크롤바 스타일링 - 더 세련되게 */
  &::-webkit-scrollbar {
    width: 6px;  /* 더 얇게 */
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;  /* 배경 투명하게 */
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);  /* 더 투명하게 */
    border-radius: 6px;
    transition: background 0.2s ease;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 0, 0, 0.4);
  }

  /* 모바일에서 더 적절하게 */
  @media (max-width: 768px) {
    width: 95vw;
    height: 90vh;
    margin: 10px;
    border-radius: 12px;
  }
`;

const ModalCloseButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  cursor: pointer;
  font-size: 20px;
  z-index: 1001;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);

  &:hover {
    background: rgba(0, 0, 0, 0.7);
    transform: scale(1.1);
  }
`;

const PlanPageWrapper = styled.div`
  width: 100%;
  height: 100%;
  overflow: auto;
`;

const SettingsButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid #e5e7eb;
  border-radius: 50%;
  width: 44px;
  height: 44px;
  cursor: pointer;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 10; /* z-index 추가 */

  &:hover {
    background: rgba(255, 255, 255, 1);
    transform: scale(1.05);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  }

  @media (max-width: 768px) {
    top: 10px;
    right: 10px;
    width: 40px;
    height: 40px;
    font-size: 16px;
  }
`;


export default ProfilePage;
