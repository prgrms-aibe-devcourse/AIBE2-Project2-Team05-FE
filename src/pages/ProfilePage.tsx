import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import profileApiService from '../services/profileApi';
import travelPlanApiService from '../services/travelPlanApi';
import PlanPage from './PlanPage';

// Types
interface UserProfile {
  id?: number;
  username: string;
  nickname: string;
  profileImage: string;
  bio: string;
  postsCount: number;
  followersCount: number;
  followingCount: number;
  isCurrentUser?: boolean;
  feeds?: any[];
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
}

// TravelPlan 인터페이스 제거 - PlanPage에서 직접 처리

// PlanPage를 모달로 감싸는 컴포넌트 - 이제 localStorage 없이 직접 planId 전달
const TravelPlanModal: React.FC<{
  planId: string;
  onClose: () => void;
}> = ({ planId, onClose }) => {
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
          <PlanPage planId={planId} isModal={true} />
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
  const { user } = useAuth();
  const location = useLocation();

  // States
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [feeds, setFeeds] = useState<UserFeed[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'created' | 'participated'>(
    'created',
  );
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
        let profileData;
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
              imageUrl: feed.imageUrl, // 이미지 URL 확인
            });

            // Create rich caption with actual backend data
            const caption = `📍 ${feed.location || '여행지'}
✨ ${feed.title || '여행 계획'}
📅 ${feed.startDate ? new Date(feed.startDate).toLocaleDateString() : '날짜 미정'}`;

            const feedData: UserFeed = {
              id: `feed-${feed.travelPlanId}-${index}`, // 인덱스 기반 고유 ID
              author: profileData.nickname || 'Unknown',
              avatar: profileData.profileImage || '/default-avatar.jpg',
              image: feed.imageUrl || '/default-place-image.jpg',
              caption: caption,
              likes: 0,
              type: 'travel-plan',
              planId: feed.planId || `plan_${feed.travelPlanId}`, // planId 간소화
              createdAt: feed.startDate || new Date().toISOString(),
              travelType: 'created' as const,
            };

            console.log(`✅ 피드 ${index + 1} 생성 완료:`, feedData.id);
            processedFeeds.push(feedData);
          });
        } else {
          console.log('⚠️ 백엔드에서 피드 데이터 없음');
        }

        console.log('📋 최종 처리된 피드 목록:', processedFeeds);
        console.log('📊 피드 개수:', processedFeeds.length);
        processedFeeds.forEach((feed, index) => {
          console.log(`피드 ${index + 1}:`, {
            id: feed.id,
            caption: feed.caption,
            image: feed.image,
          });
        });
        setFeeds(processedFeeds);

        // 기본 프로필 이미지 설정 (깔끔한 그라데이션 원형 아바타)
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

        setProfile({
          id: profileData.id,
          username: profileData.email || 'user',
          nickname: profileData.nickname || 'User',
          profileImage: profileData.profileImage || defaultProfileImage,
          bio: profileData.bio || '안녕하세요 👋',
          postsCount: 0, // 게시물 수는 더 이상 사용하지 않음
          followersCount: 0,
          followingCount: 0,
          isCurrentUser: true,
        });

        console.log('✅ 프로필 페이지 로드 완료');
      } catch (error) {
        console.error('❌ 프로필 로드 실패:', error);

        // 사용자를 찾을 수 없는 경우와 일반 에러 구분
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
  }, [nickname, refreshKey, isOwnProfile]); // nickname, refreshKey, isOwnProfile이 변경될 때마다 프로필 다시 로드

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

      // 모달을 항상 열고, 데이터 로딩은 모달 내부에서 처리
      setSelectedPlanId(feed.planId || feed.id.toString());
      setTravelPlanModalOpen(true);
    }
  };

  const closeTravelPlanModal = () => {
    setTravelPlanModalOpen(false);
    setSelectedPlanId(null);
  };

  // Render loading state
  if (loading) {
    return (
      <LoadingContainer>
        <div>프로필을 불러오는 중...</div>
      </LoadingContainer>
    );
  }

  // Render error state
  if (error || !profile) {
    return (
      <ErrorContainer>
        <div>{error || '프로필을 찾을 수 없습니다.'}</div>
        <button onClick={() => window.location.reload()}>다시 시도</button>
      </ErrorContainer>
    );
  }

  return (
    <Container>
      {/* 설정 버튼 - 우측 상단 */}
      {(() => {
        const isOwnProfilePath = location.pathname === '/profile';
        const isSameUser =
          user && profile && user.nickname === profile.nickname;
        const showSettings = isOwnProfile || isOwnProfilePath || isSameUser;
        return showSettings;
      })() && (
        <SettingsButton onClick={() => navigate('/mypage')}>⚙️</SettingsButton>
      )}

      {/* Profile Header */}
      <ProfileHeader>
        <ProfileAvatar>
          {userProfile.avatar && userProfile.avatar !== '👤' ? (
            <>
              <ProfileImage 
                src={`http://localhost:8080${userProfile.avatar}`} 
                alt="프로필 이미지"
                onError={(e) => {
                  console.error('프로필 이미지 로드 실패:', userProfile.avatar);
                  // 이미지 로드 실패 시 기본 아이콘으로 대체
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.nextElementSibling?.setAttribute('style', 'display: flex');
                }}
                onLoad={() => {
                  console.log('프로필 이미지 로드 성공:', userProfile.avatar);
                }}
              />
              <DefaultAvatar style={{ display: 'none' }}>👤</DefaultAvatar>
            </>
          ) : (
            <DefaultAvatar>👤</DefaultAvatar>
          )}
        </ProfileAvatar>
        <ProfileInfo>
          <ProfileTop>
            <Username>{profile.nickname}</Username>
            <UserDetails>
              <DetailItem>
                <i className="ri-calendar-line"></i>
                25세
              </DetailItem>
              <DetailItem>
                <i className="ri-map-pin-line"></i>
                서울, 대한민국
              </DetailItem>
            </UserDetails>
          </ProfileTop>
        </ProfileInfo>
      </ProfileHeader>

      {/* Bio Section */}
      <BioSection>
        <BioTitle>자기소개</BioTitle>
        <BioContent>{profile.bio}</BioContent>
      </BioSection>

      {/* Tabs */}
      <Tabs>
        <Tab
          className={activeTab === 'created' ? 'active' : ''}
          onClick={() => setActiveTab('created')}
        >
          ✈️ 내가 만든 여행
          <TabCount>
            {feeds.filter((f) => f.travelType === 'created').length}
          </TabCount>
        </Tab>
        <Tab
          className={activeTab === 'participated' ? 'active' : ''}
          onClick={() => setActiveTab('participated')}
        >
          🤝 참여한 여행
          <TabCount>
            {feeds.filter((f) => f.travelType === 'participated').length}
          </TabCount>
        </Tab>
      </Tabs>

      {/* Tab Content */}
      <TabContent>
        <AnimatePresence mode="wait">
          {(activeTab === 'created' || activeTab === 'participated') && (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {feeds.length > 0 ? (
                <PostsGrid>
                  {feeds
                    .filter((feed) => {
                      return feed.travelType === activeTab;
                    })
                    .map((feed, index) => {
                      console.log(
                        `🖼️ 렌더링 피드 ${index + 1}:`,
                        feed.id,
                        feed.caption,
                      );
                      return (
                        <PostItem
                          key={feed.id}
                          onClick={() => handleFeedClick(feed)}
                        >
                          <img
                            src={feed.image}
                            alt="여행 사진"
                            onError={(e) => {
                              // Google Places API 이미지 로딩 실패 시 대체 이미지 사용
                              const target = e.target as HTMLImageElement;
                              if (target.src.includes('googleapis.com')) {
                                target.src = `https://picsum.photos/400/300?random=${feed.id}`;
                                console.log(
                                  '🖼️ Google Places 이미지 로딩 실패, 대체 이미지 사용:',
                                  target.src,
                                );
                              }
                            }}
                          />
                          <PostOverlay>
                            <PostBadge>✈️ 여행계획</PostBadge>
                            <OverlayStats>
                              <span>❤️ {feed.likes}</span>
                              <span>💬 0</span>
                            </OverlayStats>
                          </PostOverlay>
                        </PostItem>
                      );
                    })}
                </PostsGrid>
              ) : (
                <EmptyState>
                  <i className="ri-camera-3-line" />
                  <div>
                    {activeTab === 'created'
                      ? '아직 만든 여행이 없습니다'
                      : '아직 참여한 여행이 없습니다'}
                  </div>
                  {activeTab === 'created' && (
                    <CreateTripButton onClick={() => navigate('/plan/write')}>
                      첫 번째 여행 플랜 만들기
                    </CreateTripButton>
                  )}
                </EmptyState>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </TabContent>

      {/* Modals */}
      {modalOpen && (
        <ImageModal imageUrl={selectedImage} onClose={closeModal} />
      )}
      {travelPlanModalOpen && selectedPlanId && (
        <TravelPlanModal
          planId={selectedPlanId}
          onClose={closeTravelPlanModal}
        />
      )}
    </Container>
  );
};

// Modal Components
interface ImageModalProps {
  imageUrl: string;
  onClose: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({ imageUrl, onClose }) => (
  <ModalOverlay
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    onClick={onClose}
  >
    <CloseButton onClick={onClose}>&times;</CloseButton>
    <ModalContent onClick={(e) => e.stopPropagation()}>
      <PostImage src={imageUrl} alt="확대된 이미지" />
    </ModalContent>
  </ModalOverlay>
);

// Styled Components
const Container = styled.div`
  max-width: 935px;
  margin: 0 auto;
  padding: 20px 20px 30px 10px; /* 상단 여백 줄임, 좌측 10px, 우측 20px */
  min-height: 100vh;
  overflow-y: auto;
  position: relative;

  @media (max-width: 768px) {
    padding: 15px 15px;
  }

  @media (max-width: 480px) {
    padding: 10px 10px;
  }
`;

const SettingsButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background: transparent;
  border: none;
  color: #8e8e8e;
  font-size: 24px;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s ease;
  z-index: 10;

  &:hover {
    background-color: #f5f5f5;
    color: #262626;
  }

  @media (max-width: 768px) {
    top: 15px;
    right: 15px;
    font-size: 22px;
  }
`;

const ProfileHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 32px;
  padding: 40px 30px;
  background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  min-height: 200px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 30px 20px;
    min-height: auto;
  }
`;

const ProfileImage = styled.div`
  width: 150px;
  height: 150px;
  margin-right: 40px;
  position: relative;
  flex-shrink: 0;

  @media (max-width: 768px) {
    margin-right: 0;
    margin-bottom: 24px;
  }

  @media (max-width: 480px) {
    width: 120px;
    height: 120px;
  }

  img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
    border: 4px solid #ffffff;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    transition:
      transform 0.2s ease,
      box-shadow 0.2s ease;

    &:hover {
      transform: scale(1.02);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
    }
  }

  /* 기본 이미지를 위한 추가 스타일 */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    opacity: 0;
    transition: opacity 0.2s ease;
  }
  border-radius: 50%;
  background-color: #eee;
  margin-right: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden; /* 이미지가 원형을 벗어나지 않도록 */
`;

const ProfileImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
`;

const DefaultAvatar = styled.span`
  font-size: 80px; /* 아바타 텍스트 크기 */
  color: #8e8e8e;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ProfileInfo = styled.div`
  flex: 1;
  min-width: 0; /* flexbox에서 텍스트 오버플로우 방지 */
`;

const ProfileTop = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;

  @media (max-width: 768px) {
    align-items: center;
    text-align: center;
  }
`;

const Username = styled.h1`
  font-size: 32px;
  font-weight: 600;
  margin: 0 0 12px 0;
  color: #1a1a1a;
  letter-spacing: -0.02em;
  line-height: 1.2;

  @media (max-width: 768px) {
    font-size: 28px;
  }

  @media (max-width: 480px) {
    font-size: 24px;
  }
`;

const UserDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  @media (max-width: 768px) {
    align-items: center;
  }
`;

const DetailItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  color: #6b7280;
  font-weight: 400;

  i {
    font-size: 16px;
    color: #8b9dc3;
  }

  @media (max-width: 768px) {
    font-size: 14px;
    justify-content: center;
  }
`;

const BioSection = styled.div`
  background: linear-gradient(135deg, #f8f9fc 0%, #eef2f7 100%);
  border-radius: 12px;
  padding: 24px;
  margin: 20px 0;
  border: 1px solid #e8ecf0;

  @media (max-width: 768px) {
    padding: 20px;
    margin: 16px 0;
  }
`;

const BioTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 12px 0;
  letter-spacing: -0.02em;
`;

const BioContent = styled.div`
  font-size: 16px;
  line-height: 1.6;
  color: #4a5568;
  margin: 0;
  font-weight: 400;

  @media (max-width: 768px) {
    font-size: 15px;
  }
`;

const Tabs = styled.div`
  display: flex;
  justify-content: center;
  border-top: 1px solid #efefef;
  margin-top: 20px;
`;

const Tab = styled.div`
  padding: 16px 30px;
  cursor: pointer;
  font-weight: 600;
  color: #8e8e8e;
  border-top: 2px solid transparent;
  margin-top: -1px;
  transition: all 0.2s ease;
  font-size: 14px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  display: flex;
  align-items: center;
  gap: 8px;

  &.active {
    color: #3682f8;
    border-top: 2px solid #3682f8;
  }

  &:hover {
    color: #3682f8;
  }
`;

const TabCount = styled.span`
  background-color: #3682f8;
  color: white;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 12px;
  min-width: 20px;
  text-align: center;
  text-transform: none;
  letter-spacing: 0;
`;

const TabContent = styled.div`
  padding: 20px 0 20px 0; /* 좌우 패딩 제거 */
`;

const PostsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  max-width: 900px;
  margin: 0 auto;
  padding: 0 10px 0 0; /* 좌측 패딩 제거, 우측 10px */

  @media (max-width: 768px) {
    gap: 4px;
    padding: 0 10px;
  }

  @media (max-width: 480px) {
    gap: 2px;
    padding: 0 5px;
  }
`;

const PostItem = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  cursor: pointer;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  &:hover > div {
    opacity: 1;
  }

  @media (max-width: 768px) {
    border-radius: 6px;
  }

  @media (max-width: 480px) {
    border-radius: 4px;
  }
`;

const PostOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.1));
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 12px;
  box-sizing: border-box;
  color: white;
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: 8px;

  @media (max-width: 768px) {
    padding: 10px;
    border-radius: 6px;
  }

  @media (max-width: 480px) {
    padding: 8px;
    border-radius: 4px;
  }
`;

const OverlayStats = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 8px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);

  @media (max-width: 480px) {
    font-size: 12px;
    margin-bottom: 6px;
  }
`;

const PostBadge = styled.span`
  background-color: rgba(255, 255, 255, 0.9);
  color: #333;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  align-self: flex-start;
  backdrop-filter: blur(4px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  @media (max-width: 480px) {
    padding: 3px 6px;
    font-size: 10px;
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  color: #8e8e8e;
  font-size: 16px;
  text-align: center;
  padding: 40px 20px;

  i {
    font-size: 48px;
    margin-bottom: 16px;
    opacity: 0.5;
  }

  @media (max-width: 768px) {
    height: 300px;
    font-size: 14px;
    padding: 30px 15px;

    i {
      font-size: 40px;
      margin-bottom: 12px;
    }
  }
`;

const CreateTripButton = styled.button`
  border: 1px solid #3682f8;
  color: #3682f8;
  padding: 12px 28px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  background-color: transparent;
  margin-top: 24px;
  transition: all 0.2s ease;
  font-size: 14px;

  &:hover {
    background-color: #3682f8;
    color: white;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(54, 130, 248, 0.3);
  }

  @media (max-width: 768px) {
    padding: 10px 24px;
    font-size: 13px;
    margin-top: 20px;
  }

  &:hover {
    background-color: rgba(0, 149, 246, 0.1);
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  font-size: 18px;
  color: #8e8e8e;
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  font-size: 18px;
  color: #8e8e8e;

  button {
    margin-top: 20px;
    padding: 10px 20px;
    background-color: #0095f6;
    color: white;
    border: none;
    border-radius: 5px;
    font-weight: 600;
    cursor: pointer;
  }
`;

const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(3px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  overflow: hidden;
`;

const PlanPageModalContent = styled(motion.div)`
  position: relative;
  background-color: white;
  border-radius: 8px;
  width: 95vw;
  height: 95vh;
  max-width: 1200px;
  max-height: 800px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const PlanPageWrapper = styled.div`
  width: 100%;
  height: 100%;
  overflow-y: auto;
  background: white;
`;

const ModalCloseButton = styled.span`
  position: absolute;
  top: 20px;
  right: 40px;
  font-size: 40px;
  font-weight: 300;
  color: #fff;
  cursor: pointer;
  z-index: 1010;
`;

const PostImage = styled.img`
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
`;

const CloseButton = styled.span`
  position: absolute;
  top: 20px;
  right: 40px;
  font-size: 40px;
  font-weight: 300;
  color: #fff;
  cursor: pointer;
  z-index: 1010;
`;

export default ProfilePage;
