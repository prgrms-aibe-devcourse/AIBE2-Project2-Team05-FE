import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
const ProfilePage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  // States
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [feeds, setFeeds] = useState<UserFeed[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    'posts' | 'created' | 'participated'
  >('posts');
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
      try {
        setLoading(true);
        console.log('🔍 프로필 페이지 로드 시작');

        // Get profile data from backend
        const profileData = await profileApiService.getMyProfile();
        console.log('📋 백엔드 프로필 데이터:', profileData);

        // Process feeds with real backend data
        const processedFeeds: UserFeed[] = [];

        if (profileData && profileData.feeds && profileData.feeds.length > 0) {
          console.log('🔍 백엔드 피드 데이터 처리 시작:', profileData.feeds);
          console.log('📊 받은 피드 개수:', profileData.feeds.length);

          // 모든 피드를 간단하게 처리
          profileData.feeds.forEach((feed, index) => {
            console.log(`🔍 피드 ${index + 1} 처리 중:`, {
              travelPlanId: feed.travelPlanId,
              title: feed.title,
              location: feed.location,
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

        setProfile({
          id: profileData.id,
          username: profileData.email || 'user',
          nickname: profileData.nickname || 'User',
          profileImage: profileData.profileImage || '/default-avatar.jpg',
          bio: profileData.bio || '자기소개를 입력해주세요.',
          postsCount: processedFeeds.length,
          followersCount: 0,
          followingCount: 0,
          isCurrentUser: true,
        });

        console.log('✅ 프로필 페이지 로드 완료');
      } catch (error) {
        console.error('❌ 프로필 로드 실패:', error);
        setError('프로필을 불러올 수 없습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [username, refreshKey]); // refreshKey가 변경될 때마다 프로필 다시 로드

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
      {/* Profile Header */}
      <ProfileHeader>
        <ProfileImage>
          <img src={profile.profileImage} alt={profile.nickname} />
        </ProfileImage>
        <ProfileInfo>
          <ProfileTop>
            <Username>{profile.nickname}</Username>
            <EditProfileButton onClick={() => navigate('/settings')}>
              ⚙️ 설정
            </EditProfileButton>
          </ProfileTop>
          <ProfileStats>
            <StatItem>
              게시물 <strong>{profile.postsCount}</strong>
            </StatItem>
            <StatItem>
              팔로워 <strong>{profile.followersCount}</strong>
            </StatItem>
            <StatItem>
              팔로우 <strong>{profile.followingCount}</strong>
            </StatItem>
          </ProfileStats>
          <Bio>{profile.bio}</Bio>
          <TravelStats>
            <StatItem>
              ✈️ 내가 만든 여행 <strong>0</strong>
            </StatItem>
            <StatItem>
              🤝 참여한 여행 <strong>0</strong>
            </StatItem>
          </TravelStats>
        </ProfileInfo>
      </ProfileHeader>

      {/* Tabs */}
      <Tabs>
        <Tab
          className={activeTab === 'posts' ? 'active' : ''}
          onClick={() => setActiveTab('posts')}
        >
          게시물
        </Tab>
      </Tabs>

      {/* Tab Content */}
      <TabContent>
        <AnimatePresence mode="wait">
          {activeTab === 'posts' && (
            <motion.div
              key="posts"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {feeds.length > 0 ? (
                <PostsGrid>
                  {feeds.map((feed, index) => {
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
                        <img src={feed.image} alt="여행 사진" />
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
                  <div>아직 게시물이 없습니다.</div>
                  <CreateTripButton onClick={() => navigate('/plan/write')}>
                    여행 플랜 만들기
                  </CreateTripButton>
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
  padding: 30px 20px;
  min-height: 100vh;
  overflow-y: auto;
`;

const ProfileHeader = styled.div`
  display: flex;
  margin-bottom: 44px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
`;

const ProfileImage = styled.div`
  width: 150px;
  height: 150px;
  margin-right: 30px;

  @media (max-width: 768px) {
    margin-right: 0;
    margin-bottom: 20px;
  }

  img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
  }
`;

const ProfileInfo = styled.div`
  flex: 1;
`;

const ProfileTop = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  gap: 20px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 10px;
  }
`;

const Username = styled.h1`
  font-size: 28px;
  font-weight: 300;
  margin: 0;
`;

const EditProfileButton = styled.button`
  background-color: transparent;
  border: 1px solid #dbdbdb;
  color: #262626;
  padding: 8px 16px;
  border-radius: 5px;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    background-color: #f5f5f5;
  }
`;

const ProfileStats = styled.div`
  display: flex;
  margin-bottom: 20px;
  gap: 40px;

  @media (max-width: 768px) {
    justify-content: center;
    gap: 20px;
  }
`;

const StatItem = styled.div`
  font-size: 16px;

  strong {
    font-weight: 600;
  }
`;

const Bio = styled.div`
  font-size: 16px;
  line-height: 24px;
  margin-bottom: 20px;
`;

const TravelStats = styled.div`
  display: flex;
  gap: 40px;
  margin-top: 10px;

  @media (max-width: 768px) {
    justify-content: center;
    gap: 20px;
  }
`;

const Tabs = styled.div`
  display: flex;
  justify-content: center;
  border-top: 1px solid #dbdbdb;
`;

const Tab = styled.div`
  padding: 15px 30px;
  cursor: pointer;
  font-weight: 600;
  color: #8e8e8e;
  border-top: 1px solid transparent;
  margin-top: -1px;

  &.active {
    color: #262626;
    border-top: 1px solid #262626;
  }
`;

const TabContent = styled.div`
  padding: 20px 0;
`;

const PostsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4px;
  max-width: 935px;
  margin: 0 auto;

  @media (max-width: 768px) {
    gap: 2px;
  }
`;

const PostItem = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  cursor: pointer;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  &:hover > div {
    opacity: 1;
  }
`;

const PostOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.6), transparent);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 15px;
  box-sizing: border-box;
  color: white;
  opacity: 0;
  transition: opacity 0.3s ease;
`;

const OverlayStats = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  margin-bottom: 5px;
`;

const PostBadge = styled.span`
  background-color: rgba(255, 255, 255, 0.8);
  color: #000;
  padding: 4px 8px;
  border-radius: 5px;
  font-size: 12px;
  font-weight: 600;
  align-self: flex-start;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  color: #8e8e8e;
  font-size: 18px;
`;

const CreateTripButton = styled.button`
  border: 1px solid #0095f6;
  color: #0095f6;
  padding: 12px 24px;
  border-radius: 5px;
  font-weight: 600;
  cursor: pointer;
  background-color: transparent;
  margin-top: 20px;

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
