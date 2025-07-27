/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import profileApiService from '../services/profileApi';
import PlanPage from './PlanPage';
import { getProfileImageUrl } from '../utils/imageUtils';

// 모듈화된 컴포넌트들 import
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
  age?: number; // 나이 필드 추가
  postsCount: number;
  followersCount: number;
  followingCount: number;
  feeds?: BackendFeed[];
  isCurrentUser: boolean;
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
interface ProfilePageProps {
  isOwnProfile?: boolean;
}

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

  // Refresh function
  const refreshProfile = () => {
    console.log('🔄 프로필 새로고침 시작');
    setRefreshKey((prev) => prev + 1);
  };

  // Load profile data
  useEffect(() => {
    const loadProfile = async () => {
      console.log('🔍 프로필 페이지 로드 시작');
      console.log('📍 isOwnProfile:', isOwnProfile, 'nickname:', nickname);
      try {
        // Get profile data from backend
        let profileData: any = null; // 백엔드 API 응답에 맞춰 any 타입 사용
        if (isOwnProfile) {
          // 내 프로필 조회
          profileData = await profileApiService.getMyProfile();
          console.log('📋 내 프로필 데이터:', profileData);
        } else if (nickname) {
          // 닉네임으로 다른 사용자 프로필 조회
          profileData = await profileApiService.getProfileByNickname(nickname);
          console.log('📋 사용자 프로필 데이터:', profileData);
        } else {
          throw new Error('프로필을 불러올 수 없습니다.');
        }

        // Process feeds with real backend data
        const processedFeeds: UserFeed[] = [];

        if (profileData && profileData.feeds && profileData.feeds.length > 0) {
          console.log('🔍 백엔드 피드 데이터 처리 시작:', profileData.feeds);
          console.log('📊 받은 피드 개수:', profileData.feeds.length);

          // 모든 피드를 간단하게 처리
          profileData.feeds.forEach((feed: any, index: number) => {
            console.log(`🔍 피드 ${index + 1} 처리 중:`, {
              travelPlanId: feed.travelPlanId,
              title: feed.title,
              location: feed.location,
              imageUrl: feed.imageUrl,
              authorName: feed.authorName, // ✅ authorName 디버깅 추가
            });

            // Create rich caption with actual backend data
            const caption = `📍 ${feed.location || '여행지'}
✨ ${feed.title || '여행 계획'}
📅 ${feed.startDate ? new Date(feed.startDate).toLocaleDateString() : '날짜 미정'}`;

            const feedData: UserFeed = {
              id: `feed-${feed.travelPlanId}-${index}`,
              author: profileData.nickname || 'Unknown',
              avatar: profileData.profileImage ? getProfileImageUrl(profileData.profileImage) : '/default-avatar.jpg',
              image: feed.imageUrl || '/default-place-image.jpg',
              caption: caption,
              likes: 0,
              type: 'travel-plan',
              planId: feed.planId || `plan_${feed.travelPlanId}`,
              createdAt: feed.startDate || new Date().toISOString(),
              travelType: 'created' as const,
              authorName: feed.authorName, // ✅ 백엔드에서 받은 authorName 추가
            };

            console.log(`✅ 피드 ${index + 1} 생성 완료:`, feedData.id);
            processedFeeds.push(feedData);
          });
        } else {
          console.log('⚠️ 백엔드에서 피드 데이터 없음');
        }

        console.log('📋 최종 처리된 피드 목록:', processedFeeds);
        setFeeds(processedFeeds);

        // ✅ AuthContext의 사용자 정보에 nickname이 없으면 업데이트
        if (isOwnProfile && profileData && profileData.nickname && user && !user.nickname) {
          console.log('🔄 AuthContext 사용자 정보에 nickname 업데이트:', profileData.nickname);
          updateUser({ nickname: profileData.nickname });
        }

        // 기본 프로필 이미지 설정
        const defaultProfileImage = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
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
        `)}`;

        // 현재 사용자의 프로필인지 확인
        const isCurrentUserProfile = Boolean(isOwnProfile || (user && user.nickname === profileData.nickname));
        
        setProfile({
          id: profileData.id,
          username: profileData.email || 'user',
          nickname: profileData.nickname || 'User',
          profileImage: profileData.profileImage ? getProfileImageUrl(profileData.profileImage) : defaultProfileImage,
          bio: profileData.bio || '안녕하세요 👋',
          age: profileData.age || undefined, // 나이 정보 추가
          postsCount: 0,
          followersCount: 0,
          followingCount: 0,
          isCurrentUser: isCurrentUserProfile,
        });

        console.log('✅ 프로필 페이지 로드 완료');
      } catch (error) {
        console.error('❌ 프로필 로드 실패:', error);

        if (
          error instanceof Error &&
          error.message.includes('사용자를 찾을 수 없습니다')
        ) {
          setError(`사용자 "${nickname}"을(를) 찾을 수 없습니다.`);
        } else {
          setError('프로필을 불러올 수 없습니다.');
        }
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [nickname, refreshKey, isOwnProfile]);

  // Event handlers
  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedImage('');
  };

  const handleFeedClick = (feed: UserFeed) => {
    if (feed.type === 'travel-plan') {
      console.log('🔍 피드 클릭 - 여행 계획 모달 열기:', {
        feedPlanId: feed.planId,
        feedId: feed.id,
      });

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

  const closeTravelPlanModal = () => {
    setTravelPlanModalOpen(false);
    setSelectedPlanId(null);
  };

  // 피드 삭제 기능
  const handleDeleteFeed = async (feedId: string | number, event: React.MouseEvent) => {
    event.stopPropagation();
    
    const isConfirmed = window.confirm('이 게시물을 삭제하시겠습니까?');
    if (!isConfirmed) {
      return;
    }

    try {
      await profileApiService.deleteFeed(feedId);

      const updatedFeeds = feeds.filter((feed) => feed.id !== feedId);
      setFeeds(updatedFeeds);

      if (profile) {
        setProfile({
          ...profile,
          postsCount: Math.max(0, profile.postsCount - 1),
        });
      }

      console.log('✅ 피드 삭제 완료:', feedId);
    } catch (error) {
      console.error('❌ 피드 삭제 실패:', error);
      alert('피드 삭제에 실패했습니다. 다시 시도해주세요.');
    }
  };



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
      {/* 설정 버튼 - 우측 상단 */}
      {profile && profile.isCurrentUser && (
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
            age: (() => {
              // ✅ 닉네임 기반으로 일관된 나이 생성 (20-39세)
              const seedFromNickname = profile.nickname
                .split('')
                .reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
              return 20 + (seedFromNickname % 20);
            })()
          }}
          onClose={closeTravelPlanModal}
        />
      )}
    </Container>
  );
};

// 남은 스타일 컴포넌트들 (모달 관련)
const Container = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;

  @media (max-width: 768px) {
    padding: 10px;
  }
`;

const SettingsButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.9);
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
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  &:hover {
    background: rgba(255, 255, 255, 1);
    transform: scale(1.05);
  }

  @media (max-width: 768px) {
    top: 10px;
    right: 10px;
    width: 40px;
    height: 40px;
    font-size: 16px;
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



export default ProfilePage;
