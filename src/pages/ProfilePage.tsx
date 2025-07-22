import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';
import toast from 'react-hot-toast';
import PlanPage from './PlanPage';
import { getRepresentativePlaceImage } from '../services/backendPlacesApi';
import {
  Feed,
  FeedStatus,
  ReviewFormData,
  FEED_STATUS_LABELS,
} from '../types/feed';
import FeedStatusChanger from '../components/feed/FeedStatusChanger';
import ReviewWriteModal from '../components/feed/ReviewWriteModal';
import ReviewCompletedIndicator from '../components/feed/ReviewCompletedIndicator';
import FeedStatusBadge from '../components/feed/FeedStatusBadge';
import {
  changeFeedStatus,
  createReview,
  getNextAvailableStatuses,
} from '../services/feedStatusService';
import {
  getReviewButtonState,
  getPermissionMessage,
  checkReviewPermission,
} from '../services/reviewPermissionService';

interface ModalProps {
  imageUrl: string;
  onClose: () => void;
}

interface UserFeed extends Feed {
  planId?: string;
}

interface UserProfile {
  id: string;
  name: string;
  username: string;
  avatar: string;
  bio: string;
  postsCount: number;
  followersCount: number;
  followingCount: number;
  isCurrentUser: boolean;
}

const Modal = ({ imageUrl, onClose }: ModalProps) => (
  <ModalOverlay onClick={onClose}>
    <CloseButton onClick={onClose}>&times;</CloseButton>
    <ModalContent onClick={(e: React.MouseEvent) => e.stopPropagation()}>
      <PostImage src={imageUrl} alt="modal content" />
      <PostDetailsContainer>
        <PostHeader>
          <AuthorInfo>
            <AuthorAvatar />
            <span>여행자123</span>
          </AuthorInfo>
          <i className="ri-more-line"></i>
        </PostHeader>
        <PostDetails>
          <PostActions>
            <div>
              <i className="ri-heart-line"></i>
              <i className="ri-chat-3-line"></i>
              <i className="ri-send-plane-line"></i>
            </div>
            <i className="ri-bookmark-line"></i>
          </PostActions>
          <Likes>좋아요 128개</Likes>
          <Caption>
            <strong>여행자123</strong> 제주도 여행 중! 오늘은 성산일출봉에서
            아름다운 일출을 감상했어요. 다음에 제주도 여행 오시는 분들은 꼭 일출
            보러 오세요! #제주도여행 #성산일출봉 #아침일출
          </Caption>
          <Comments>댓글 23개 모두 보기</Comments>
          <Timestamp>3시간 전</Timestamp>
        </PostDetails>
        <CommentInputSection>
          <CommentInput type="text" placeholder="댓글 달기..." />
          <PostButton>게시</PostButton>
        </CommentInputSection>
      </PostDetailsContainer>
    </ModalContent>
  </ModalOverlay>
);

const tabContentVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

const pageVariants = {
  initial: { opacity: 0 },
  in: { opacity: 1 },
  out: { opacity: 0 },
};

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState('posts');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [selectedFeed, setSelectedFeed] = useState<UserFeed | null>(null);
  const [travelPlanModalOpen, setTravelPlanModalOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userFeeds, setUserFeeds] = useState<UserFeed[]>([]);
  const [loading, setLoading] = useState(true);

  // 후기 작성 모달 관련 상태
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedFeedForReview, setSelectedFeedForReview] =
    useState<UserFeed | null>(null);

  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();

  // 사용자 프로필 및 피드 데이터 로드
  useEffect(() => {
    const loadUserData = () => {
      try {
        const currentUserId = 'current-user'; // 현재 로그인한 사용자 ID (실제론 AuthContext에서 가져올 것)
        const targetUserId = userId || currentUserId;
        const isCurrentUser = targetUserId === currentUserId;

        // 저장된 프로필 정보 로드
        let savedProfile = null;
        if (isCurrentUser) {
          const userProfileData = localStorage.getItem('userProfile');
          if (userProfileData) {
            savedProfile = JSON.parse(userProfileData);
          }
        }

        // 사용자 프로필 데이터 (실제론 API에서 가져올 것)
        const profile: UserProfile = {
          id: targetUserId,
          name:
            isCurrentUser && savedProfile?.name
              ? savedProfile.name
              : isCurrentUser
                ? '나'
                : `User_${targetUserId}`,
          username:
            isCurrentUser && savedProfile?.nickname
              ? savedProfile.nickname
              : isCurrentUser
                ? 'Traveler_Kim'
                : `traveler_${targetUserId}`,
          avatar:
            isCurrentUser && savedProfile?.profileImage
              ? savedProfile.profileImage
              : '👤',
          bio:
            isCurrentUser && savedProfile?.bio
              ? savedProfile.bio
              : isCurrentUser
                ? '사진과 여행을 사랑하는 개발자. ✈️'
                : '여행을 좋아하는 사람입니다 ✈️',
          postsCount: 0,
          followersCount: isCurrentUser
            ? 1200
            : Math.floor(Math.random() * 1000),
          followingCount: isCurrentUser ? 345 : Math.floor(Math.random() * 500),
          isCurrentUser,
        };

        // 사용자 피드 데이터 로드
        const feedKey = isCurrentUser ? 'myFeeds' : `userFeeds_${targetUserId}`;
        const savedFeeds = localStorage.getItem(feedKey);
        let feeds: UserFeed[] = [];

        if (savedFeeds) {
          feeds = JSON.parse(savedFeeds);
        } else if (isCurrentUser) {
          // 현재 사용자인데 피드가 없으면 빈 배열
          feeds = [];
        } else {
          // 다른 사용자면 샘플 데이터
          feeds = generateSampleFeeds(targetUserId);
        }

        profile.postsCount = feeds.length;
        setUserProfile(profile);
        setUserFeeds(feeds);
        setLoading(false);
      } catch (error) {
        console.error('사용자 데이터 로드 중 오류:', error);
        setLoading(false);
      }
    };

    loadUserData();
  }, [userId]);

  // 여행 계획 피드의 썸네일 이미지를 Google Places에서 가져오는 함수
  useEffect(() => {
    const updateTravelPlanImages = async () => {
      if (!userFeeds.length) return;

      const updatedFeeds = await Promise.all(
        userFeeds.map(async (feed) => {
          // 여행 계획 피드가 아니거나 이미 Google Places 이미지가 있으면 그대로 반환
          if (
            feed.type !== 'travel-plan' ||
            (feed.image &&
              !feed.image.includes('picsum.photos') &&
              !feed.image.includes('unsplash.com'))
          ) {
            return feed;
          }

          try {
            let destination = '';

            // planId가 있으면 저장된 계획에서 목적지 가져오기
            if (feed.planId) {
              const savedPlan = localStorage.getItem(`plan_${feed.planId}`);
              if (savedPlan) {
                const planData = JSON.parse(savedPlan);
                destination = planData.destination || planData.title || '';
              }
            }

            // 목적지가 없으면 캡션에서 추출 시도
            if (!destination && feed.caption) {
              const locationMatch = feed.caption.match(/(.*?)\s*여행/);
              destination = locationMatch ? locationMatch[1] : '';
            }

            // 목적지가 있으면 OpenAI 분석 후 백엔드를 통해 대표 랜드마크 이미지 검색
            if (destination) {
              console.log(
                `${destination}의 대표 이미지를 AI 분석 후 검색 중...`,
              );
              const placeImage = await getRepresentativePlaceImage(destination);

              if (placeImage && placeImage !== 'NO_IMAGE') {
                console.log(`${destination} 이미지 발견:`, placeImage);
                return {
                  ...feed,
                  image: placeImage,
                };
              } else if (placeImage === 'NO_IMAGE') {
                console.log(
                  `${destination}에 사용할 수 있는 이미지가 없습니다.`,
                );
              }
            }

            return feed;
          } catch (error) {
            console.error('피드 이미지 업데이트 중 오류:', error);
            return feed;
          }
        }),
      );

      // 이미지가 업데이트된 경우에만 상태 업데이트
      const hasUpdates = updatedFeeds.some(
        (feed, index) => feed.image !== userFeeds[index].image,
      );

      if (hasUpdates) {
        setUserFeeds(updatedFeeds);

        // localStorage에도 업데이트된 피드 저장
        const currentUserId = 'current-user';
        const targetUserId = userId || currentUserId;
        const isCurrentUser = targetUserId === currentUserId;

        if (isCurrentUser) {
          localStorage.setItem('myFeeds', JSON.stringify(updatedFeeds));
        } else {
          localStorage.setItem(
            `userFeeds_${targetUserId}`,
            JSON.stringify(updatedFeeds),
          );
        }
      }
    };

    updateTravelPlanImages();
  }, [userFeeds.length, userId]); // userFeeds 의존성 대신 length만 사용하여 무한 루프 방지

  // 샘플 피드 생성 함수
  const generateSampleFeeds = (userId: string): UserFeed[] => {
    return [
      {
        id: Date.now() + 1,
        author: `User_${userId}`,
        avatar: '👤',
        image: 'https://picsum.photos/400/400?random=1',
        likes: Math.floor(Math.random() * 200),
        caption: `${userId === 'user2' ? '부산' : '제주도'} 여행 계획을 세웠어요! 🏖️`,
        type: 'travel-plan',
        createdAt: new Date().toISOString(),
      },
      {
        id: Date.now() + 2,
        author: `User_${userId}`,
        avatar: '👤',
        image: 'https://picsum.photos/400/400?random=2',
        likes: Math.floor(Math.random() * 150),
        caption: '맛집 투어 예정! 😋',
        createdAt: new Date().toISOString(),
      },
    ];
  };

  const handleEditProfile = () => {
    if (userProfile?.isCurrentUser) {
      navigate('/mypage');
    }
  };

  const handleFeedClick = (feed: UserFeed) => {
    if (feed.type === 'travel-plan') {
      setSelectedFeed(feed);
      setTravelPlanModalOpen(true);
    } else {
      setSelectedImage(
        feed.image || `https://picsum.photos/400/400?random=${feed.id}`,
      );
      setModalOpen(true);
    }
  };

  const openModal = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedImage('');
  };

  const closeTravelPlanModal = () => {
    setTravelPlanModalOpen(false);
    setSelectedFeed(null);
  };

  // 피드 삭제 기능
  const handleDeleteFeed = (feedId: number, feedType?: string) => {
    const isConfirmed = window.confirm('이 게시물을 삭제하시겠습니까?');

    if (!isConfirmed) {
      return;
    }

    try {
      // userFeeds 상태에서 해당 피드 제거
      const updatedFeeds = userFeeds.filter((feed) => feed.id !== feedId);
      setUserFeeds(updatedFeeds);

      // localStorage에서 사용자 피드 데이터 업데이트
      const savedFeeds = localStorage.getItem('userFeeds');
      if (savedFeeds) {
        const allFeeds = JSON.parse(savedFeeds);
        const updatedAllFeeds = allFeeds.filter(
          (feed: UserFeed) => feed.id !== feedId,
        );
        localStorage.setItem('userFeeds', JSON.stringify(updatedAllFeeds));
      }

      // 여행 계획 피드인 경우 관련 데이터도 정리
      if (feedType === 'travel-plan') {
        const feedToDelete = userFeeds.find((feed) => feed.id === feedId);
        if (feedToDelete?.planId) {
          localStorage.removeItem(`plan_${feedToDelete.planId}`);
        }
      }

      // 프로필 게시물 수 업데이트
      if (userProfile) {
        const updatedProfile = {
          ...userProfile,
          postsCount: Math.max(0, userProfile.postsCount - 1),
        };
        setUserProfile(updatedProfile);

        // localStorage에도 반영
        if (updatedProfile.isCurrentUser) {
          const savedProfile = localStorage.getItem('userProfile');
          if (savedProfile) {
            const profileData = JSON.parse(savedProfile);
            localStorage.setItem(
              'userProfile',
              JSON.stringify({
                ...profileData,
                postsCount: updatedProfile.postsCount,
              }),
            );
          }
        }
      }

      toast.success('게시물이 삭제되었습니다.', {
        position: 'top-center',
        duration: 3000,
        style: {
          background: '#333',
          color: '#fff',
        },
      });
    } catch (error) {
      console.error('게시물 삭제 중 오류:', error);
      toast.error('게시물 삭제 중 오류가 발생했습니다.', {
        position: 'top-center',
        duration: 3000,
        style: {
          background: '#f44336',
          color: '#fff',
        },
      });
    }
  };

  // 피드 상태 변경 핸들러
  const handleFeedStatusChange = (updatedFeed: UserFeed) => {
    const updatedFeeds = userFeeds.map((feed) =>
      feed.id === updatedFeed.id ? updatedFeed : feed,
    );
    setUserFeeds(updatedFeeds);

    // localStorage도 업데이트
    const currentUserId = 'current-user';
    const targetUserId = userId || currentUserId;
    const feedKey = userProfile?.isCurrentUser
      ? 'myFeeds'
      : `userFeeds_${targetUserId}`;
    localStorage.setItem(feedKey, JSON.stringify(updatedFeeds));

    toast.success('피드 상태가 변경되었습니다.', {
      position: 'top-center',
      duration: 2000,
    });
  };

  // 후기 모달 열기
  const openReviewModal = (feed: UserFeed) => {
    setSelectedFeedForReview(feed);
    setReviewModalOpen(true);
  };

  // 후기 모달 닫기
  const closeReviewModal = () => {
    setReviewModalOpen(false);
    setSelectedFeedForReview(null);
  };

  // 후기 작성 핸들러
  const handleReviewSubmit = async (reviewData: ReviewFormData) => {
    if (!selectedFeedForReview) return;

    try {
      const updatedFeed = await createReview(
        reviewData,
        selectedFeedForReview.id,
      );
      if (updatedFeed) {
        handleFeedStatusChange(updatedFeed as UserFeed);
        closeReviewModal();
        toast.success('후기가 성공적으로 작성되었습니다!', {
          position: 'top-center',
          duration: 3000,
        });

        // 후기 작성 완료 후 새로고침
        setTimeout(() => {
          window.location.reload();
        }, 2000); // 토스트 메시지 표시 후 새로고침
      }
    } catch (error) {
      console.error('후기 작성 실패:', error);
      toast.error('후기 작성 중 오류가 발생했습니다.', {
        position: 'top-center',
        duration: 3000,
      });
    }
  };

  // 로딩 중
  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontSize: '24px',
          color: '#8e8e8e',
        }}
      >
        <div>프로필을 불러오는 중...</div>
      </div>
    );
  }

  // 사용자를 찾을 수 없음
  if (!userProfile) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontSize: '24px',
          color: '#8e8e8e',
        }}
      >
        <div>사용자를 찾을 수 없습니다.</div>
        <button
          onClick={() => navigate('/')}
          style={{
            marginTop: '20px',
            padding: '10px 20px',
            backgroundColor: '#0095f6',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          홈으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={{ duration: 0.2 }}
    >
      <ProfileHeader>
        <ProfileAvatar>{userProfile.avatar}</ProfileAvatar>
        <ProfileInfo>
          <Username>
            {userProfile.username}
            {userProfile.name &&
              userProfile.name !== userProfile.username &&
              userProfile.name !== '나' && (
                <span
                  style={{
                    fontWeight: 'normal',
                    color: '#666',
                    marginLeft: '8px',
                  }}
                >
                  ({userProfile.name})
                </span>
              )}
          </Username>
          <Stats>
            <span>
              게시물 <strong>{userProfile.postsCount}</strong>
            </span>
            <span>
              팔로워{' '}
              <strong>{userProfile.followersCount.toLocaleString()}</strong>
            </span>
            <span>
              팔로우 <strong>{userProfile.followingCount}</strong>
            </span>
          </Stats>
          <Bio>{userProfile.bio}</Bio>
        </ProfileInfo>
        <ProfileButtonContainer>
          {userProfile.isCurrentUser ? (
            <>
              <EditProfileButton onClick={handleEditProfile}>
                프로필 수정
              </EditProfileButton>
              <Link to="/review">
                <ReviewButton>리뷰페이지</ReviewButton>
              </Link>
            </>
          ) : (
            <>
              <FollowButton>팔로우</FollowButton>
              <MessageButton>메시지</MessageButton>
            </>
          )}
        </ProfileButtonContainer>
      </ProfileHeader>

      <Tabs>
        <Tab
          onClick={() => setActiveTab('posts')}
          className={activeTab === 'posts' ? 'active' : ''}
        >
          게시물 ({userProfile.postsCount})
        </Tab>
        <Tab
          onClick={() => setActiveTab('saved')}
          className={activeTab === 'saved' ? 'active' : ''}
        >
          저장됨
        </Tab>
        <Tab
          onClick={() => setActiveTab('tagged')}
          className={activeTab === 'tagged' ? 'active' : ''}
        >
          태그됨
        </Tab>
      </Tabs>

      <TabContent>
        <AnimatePresence mode="wait">
          {activeTab === 'posts' && (
            <motion.div
              key="posts"
              variants={tabContentVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.15 }}
            >
              {userFeeds.length > 0 ? (
                <PostGrid
                  feeds={userFeeds}
                  onFeedClick={handleFeedClick}
                  currentUserId={userProfile.id}
                  isCurrentUser={userProfile.isCurrentUser}
                  onDeleteFeed={handleDeleteFeed}
                  onFeedStatusChange={handleFeedStatusChange}
                  onReviewModalOpen={openReviewModal}
                />
              ) : (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '50vh',
                    color: '#8e8e8e',
                    fontSize: '20px',
                  }}
                >
                  <div style={{ fontSize: '60px', marginBottom: '10px' }}>
                    📷
                  </div>
                  <div>아직 게시물이 없습니다</div>
                  {userProfile.isCurrentUser && (
                    <Link to="/plan/write">
                      <button
                        style={{
                          borderColor: '#0095f6',
                          color: '#0095f6',
                          padding: '8px 16px',
                          borderRadius: '5px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          backgroundColor: 'transparent',
                          marginTop: '20px',
                          textDecoration: 'none',
                        }}
                      >
                        첫 여행 계획 만들기
                      </button>
                    </Link>
                  )}
                </div>
              )}
            </motion.div>
          )}
          {activeTab === 'saved' && (
            <motion.div
              key="saved"
              variants={tabContentVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.15 }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '50vh',
                  color: '#8e8e8e',
                  fontSize: '20px',
                }}
              >
                <div style={{ fontSize: '60px', marginBottom: '10px' }}>🔖</div>
                <div>저장된 게시물이 없습니다</div>
              </div>
            </motion.div>
          )}
          {activeTab === 'tagged' && (
            <motion.div
              key="tagged"
              variants={tabContentVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.15 }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '50vh',
                  color: '#8e8e8e',
                  fontSize: '20px',
                }}
              >
                <div style={{ fontSize: '60px', marginBottom: '10px' }}>🏷️</div>
                <div>태그된 게시물이 없습니다</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </TabContent>

      {modalOpen && <Modal imageUrl={selectedImage} onClose={closeModal} />}
      {travelPlanModalOpen && selectedFeed && (
        <PlanPageModal
          feed={selectedFeed}
          onClose={closeTravelPlanModal}
          onFeedStatusChange={handleFeedStatusChange}
          onReviewModalOpen={openReviewModal}
        />
      )}

      {/* 후기 작성 모달 */}
      {reviewModalOpen && selectedFeedForReview && (
        <ReviewWriteModal
          feed={selectedFeedForReview}
          isOpen={reviewModalOpen}
          onClose={closeReviewModal}
          onSubmit={handleReviewSubmit}
        />
      )}
    </motion.div>
  );
};

interface PostGridProps {
  feeds: UserFeed[];
  onFeedClick: (feed: UserFeed) => void;
  currentUserId: string;
  isCurrentUser: boolean;
  onDeleteFeed: (feedId: number, feedType?: string) => void;
  onFeedStatusChange?: (updatedFeed: UserFeed) => void;
  onReviewModalOpen?: (feed: UserFeed) => void;
}

const PostGrid: React.FC<PostGridProps> = ({
  feeds,
  onFeedClick,
  currentUserId,
  isCurrentUser,
  onDeleteFeed,
  onFeedStatusChange,
  onReviewModalOpen,
}) => (
  <PostsGridContainer>
    {feeds.map((feed) => (
      <PostItem key={feed.id}>
        <img
          src={feed.image || `https://picsum.photos/400/400?random=${feed.id}`}
          alt={`post-${feed.id}`}
          onClick={() => onFeedClick(feed)}
          style={{ cursor: 'pointer' }}
        />

        {/* 상태 관리 및 후기 관리 섹션 - 본인의 게시물에만 표시 */}
        {isCurrentUser && (
          <FeedManagementOverlay>
            {/* 피드 상태 변경 */}
            <FeedStatusChanger
              feed={feed}
              userId={currentUserId}
              onStatusChange={onFeedStatusChange}
              onError={(error) => toast.error(error)}
            />

            {/* 후기 작성 버튼 (권한 기반 표시) */}
            {(() => {
              const buttonState = getReviewButtonState(feed, currentUserId);

              if (!buttonState.show) return null;

              return (
                <FeedReviewButton
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.stopPropagation();
                    if (buttonState.enabled && onReviewModalOpen) {
                      onReviewModalOpen(feed);
                    } else {
                      const permissionResult = checkReviewPermission(
                        feed,
                        currentUserId,
                      );
                      toast.error(getPermissionMessage(permissionResult));
                    }
                  }}
                  disabled={!buttonState.enabled}
                  title={buttonState.tooltip}
                >
                  {buttonState.text}
                </FeedReviewButton>
              );
            })()}

            {/* 후기 완료 표시 */}
            {feed.review && (
              <ReviewCompletedIndicator
                feed={feed}
                variant="badge"
                showRating={true}
              />
            )}
          </FeedManagementOverlay>
        )}

        {/* 삭제 버튼 - 본인의 게시물에만 표시 */}
        {isCurrentUser && (
          <DeleteButton
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.stopPropagation();
              onDeleteFeed(feed.id, feed.type);
            }}
            title="게시물 삭제"
          >
            ×
          </DeleteButton>
        )}

        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            padding: '15px',
            boxSizing: 'border-box',
            color: 'white',
            opacity: 0,
            transition: 'opacity 0.3s ease',
            borderRadius: '8px',
            pointerEvents: 'none', // 호버 오버레이는 클릭 불가
          }}
          className="hover-overlay"
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '14px',
              marginBottom: '5px',
            }}
          >
            <span>❤️ {feed.likes}</span>
            <span>💬 {Math.floor(Math.random() * 50)}</span>
          </div>
          {feed.type === 'travel-plan' && (
            <span
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                color: '#000',
                padding: '4px 8px',
                borderRadius: '5px',
                fontSize: '12px',
                fontWeight: '600',
                alignSelf: 'flex-start',
              }}
            >
              ✈️ 여행계획
            </span>
          )}
        </div>
      </PostItem>
    ))}
  </PostsGridContainer>
);

// NextStatusButton 컴포넌트: 순차적 상태 변경을 위한 버튼 (새로고침 포함)
interface NextStatusButtonProps {
  feed: Feed;
  onStatusChange?: (updatedFeed: Feed) => void;
}

const NextStatusButtonWithRefresh: React.FC<NextStatusButtonProps> = ({
  feed,
  onStatusChange,
}) => {
  const [isChanging, setIsChanging] = useState(false);
  const currentStatus = feed.status || 'recruiting';
  const nextStatuses = getNextAvailableStatuses(currentStatus);

  // 다음 상태가 없으면 버튼 숨김
  if (nextStatuses.length === 0) {
    return null;
  }

  const nextStatus = nextStatuses[0]; // 첫 번째(다음) 상태
  const nextStatusLabel = FEED_STATUS_LABELS[nextStatus];

  const handleStatusChange = async () => {
    setIsChanging(true);
    try {
      const updatedFeed = await changeFeedStatus(feed.id, nextStatus);
      if (updatedFeed && onStatusChange) {
        onStatusChange(updatedFeed);
      }
      toast.success(`상태가 '${nextStatusLabel}'으로 변경되었습니다.`);

      // 상태 변경 후 새로고침
      setTimeout(() => {
        window.location.reload();
      }, 1000); // 토스트 메시지 표시 후 새로고침
    } catch (error) {
      console.error('상태 변경 실패:', error);
      toast.error('상태 변경에 실패했습니다.');
      setIsChanging(false); // 실패 시에만 로딩 해제
    }
  };

  return (
    <NextStatusBtn onClick={handleStatusChange} disabled={isChanging}>
      {isChanging ? '변경 중...' : `→ ${nextStatusLabel}`}
    </NextStatusBtn>
  );
};

// 스크롤바를 숨기는 래퍼 컴포넌트
const ScrollableContainer = styled.div<{
  $hasStatusBar: boolean;
  $hasActionBar: boolean;
}>`
  width: 100%;
  height: 100%;
  border-radius: 12px;
  overflow: auto;
  padding-top: ${({ $hasStatusBar }) => ($hasStatusBar ? '80px' : '0')};
  padding-bottom: ${({ $hasActionBar }) => ($hasActionBar ? '80px' : '0')};

  /* 스크롤바 숨기기 */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* Internet Explorer 10+ */

  &::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Opera */
  }
`;

// 여행 계획 모달 컴포넌트 - PlanPage를 모달로 래핑
interface PlanPageModalProps {
  feed: UserFeed;
  onClose: () => void;
  onFeedStatusChange?: (updatedFeed: UserFeed) => void;
  onReviewModalOpen?: (feed: UserFeed) => void;
}

// 모달 관리 바 스타일
const ModalManagementBar = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid #dbdbdb;
  border-radius: 12px 12px 0 0;
  z-index: 20;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

// 모달 내 후기 작성 버튼 스타일
const ModalReviewButton = styled.button`
  background: #28a745;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
  white-space: nowrap;

  &:hover:not(:disabled) {
    background: #218838;
  }

  &:disabled {
    background: #94a3b8;
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

// 순차적 상태 변경을 위한 NextStatusButton 스타일
const NextStatusBtn = styled.button`
  background: #3682f8;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover:not(:disabled) {
    background: #2563eb;
    transform: translateY(-1px);
  }

  &:disabled {
    background: #94a3b8;
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

const PlanPageModal: React.FC<PlanPageModalProps> = ({
  feed,
  onClose,
  onFeedStatusChange,
  onReviewModalOpen,
}) => {
  // ProfilePage는 항상 현재 사용자의 프로필 페이지이므로 관리 권한 있음
  const isCurrentUser = true; // ProfilePage에서는 항상 본인의 피드만 보여지므로 true

  const currentUserId = 'current-user'; // AuthContext에서 가져올 실제 사용자 ID

  useEffect(() => {
    // PlanPage에서 사용할 데이터를 localStorage에 저장
    if (feed.planId) {
      const existingPlan = localStorage.getItem(`plan_${feed.planId}`);

      if (!existingPlan) {
        // 기본 여행 계획 데이터 구조 생성
        const defaultPlan = {
          id: feed.planId,
          title: feed.caption?.split('\n')[0] || '여행 계획',
          destination: '서울',
          startDate: '2024-08-01',
          endDate: '2024-08-05',
          budget: '50만원',
          people: '2명',
          places: [],
          notes: '',
          createdAt: feed.createdAt || new Date().toISOString(),
          isLiked: false,
        };
        localStorage.setItem(
          `plan_${feed.planId}`,
          JSON.stringify(defaultPlan),
        );
      } else {
        // currentTravelPlan으로도 저장 (PlanPage가 참조하도록)
        localStorage.setItem('currentTravelPlan', existingPlan);
      }
    } else {
      // planId가 없는 경우 기본 계획 생성
      const defaultPlan = {
        id: 'default',
        title: feed.caption?.split('\n')[0] || '여행 계획',
        destination: '서울',
        startDate: '2024-08-01',
        endDate: '2024-08-05',
        budget: '50만원',
        people: '2명',
        places: [],
        notes: '',
        createdAt: feed.createdAt || new Date().toISOString(),
        isLiked: false,
      };
      localStorage.setItem('currentTravelPlan', JSON.stringify(defaultPlan));
    }

    // ESC 키로 모달 닫기
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [feed, onClose]);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          width: '95vw',
          maxWidth: '1200px',
          height: '95vh',
          overflow: 'auto',
          position: 'relative',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 상단: 상태 표시 바 */}
        {isCurrentUser && (
          <ModalStatusBar>
            {/* 현재 상태 표시만 */}
            <FeedStatusBadge status={feed.status || 'recruiting'} />

            {/* 후기 완료 표시 제거 - 모달창 닫기 버튼과 겹침 */}
          </ModalStatusBar>
        )}

        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '30px',
            background: 'rgba(255, 255, 255, 0.9)',
            border: 'none',
            fontSize: '28px',
            cursor: 'pointer',
            color: '#666',
            zIndex: 30, // 관리 바보다 위에 표시
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
          }}
        >
          ×
        </button>

        {/* PlanPage 컴포넌트를 모달 내부에 렌더링 */}
        <ScrollableContainer
          $hasStatusBar={isCurrentUser}
          $hasActionBar={isCurrentUser}
        >
          <PlanPage />

          {/* 후기 섹션 - 후기가 있을 때만 표시 */}
          {feed.review && (
            <ReviewSection>
              <ReviewHeader>
                <ReviewTitle>✍️ 여행 후기</ReviewTitle>
                <ReviewRating>
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star key={i} $filled={i < (feed.review?.rating || 0)}>
                      ⭐
                    </Star>
                  ))}
                  <RatingText>({feed.review?.rating || 0}/5)</RatingText>
                </ReviewRating>
              </ReviewHeader>

              <ReviewContent>
                <ReviewSubTitle>{feed.review.title}</ReviewSubTitle>
                <ReviewText>{feed.review.content}</ReviewText>

                {/* 후기 이미지들 */}
                {feed.review.images && feed.review.images.length > 0 && (
                  <ReviewImages>
                    {feed.review.images.map((image, index) => (
                      <ReviewImage
                        key={index}
                        src={image}
                        alt={`후기 사진 ${index + 1}`}
                      />
                    ))}
                  </ReviewImages>
                )}

                {/* 하이라이트 */}
                {feed.review.highlights &&
                  feed.review.highlights.length > 0 && (
                    <ReviewHighlights>
                      <HighlightTitle>🌟 하이라이트</HighlightTitle>
                      <HighlightList>
                        {feed.review.highlights.map((highlight, index) => (
                          <HighlightItem key={index}>{highlight}</HighlightItem>
                        ))}
                      </HighlightList>
                    </ReviewHighlights>
                  )}

                {/* 추천사항 */}
                {feed.review.recommendations &&
                  feed.review.recommendations.length > 0 && (
                    <ReviewRecommendations>
                      <RecommendationTitle>💡 추천사항</RecommendationTitle>
                      <RecommendationList>
                        {feed.review.recommendations.map(
                          (recommendation, index) => (
                            <RecommendationItem key={index}>
                              {recommendation}
                            </RecommendationItem>
                          ),
                        )}
                      </RecommendationList>
                    </ReviewRecommendations>
                  )}

                {/* 지출 내역 */}
                {feed.review.expenses && feed.review.expenses.total > 0 && (
                  <ExpenseSection>
                    <ExpenseTitle>💰 지출 내역</ExpenseTitle>
                    <ExpenseGrid>
                      {feed.review.expenses.accommodation > 0 && (
                        <ExpenseItem>
                          <ExpenseLabel>숙박</ExpenseLabel>
                          <ExpenseAmount>
                            {feed.review.expenses.accommodation.toLocaleString()}
                            원
                          </ExpenseAmount>
                        </ExpenseItem>
                      )}
                      {feed.review.expenses.food > 0 && (
                        <ExpenseItem>
                          <ExpenseLabel>음식</ExpenseLabel>
                          <ExpenseAmount>
                            {feed.review.expenses.food.toLocaleString()}원
                          </ExpenseAmount>
                        </ExpenseItem>
                      )}
                      {feed.review.expenses.transportation > 0 && (
                        <ExpenseItem>
                          <ExpenseLabel>교통</ExpenseLabel>
                          <ExpenseAmount>
                            {feed.review.expenses.transportation.toLocaleString()}
                            원
                          </ExpenseAmount>
                        </ExpenseItem>
                      )}
                      {feed.review.expenses.activities > 0 && (
                        <ExpenseItem>
                          <ExpenseLabel>액티비티</ExpenseLabel>
                          <ExpenseAmount>
                            {feed.review.expenses.activities.toLocaleString()}원
                          </ExpenseAmount>
                        </ExpenseItem>
                      )}
                      {feed.review.expenses.shopping > 0 && (
                        <ExpenseItem>
                          <ExpenseLabel>쇼핑</ExpenseLabel>
                          <ExpenseAmount>
                            {feed.review.expenses.shopping.toLocaleString()}원
                          </ExpenseAmount>
                        </ExpenseItem>
                      )}
                      {feed.review.expenses.etc > 0 && (
                        <ExpenseItem>
                          <ExpenseLabel>기타</ExpenseLabel>
                          <ExpenseAmount>
                            {feed.review.expenses.etc.toLocaleString()}원
                          </ExpenseAmount>
                        </ExpenseItem>
                      )}
                    </ExpenseGrid>
                    <ExpenseTotal>
                      총 지출: {feed.review.expenses.total.toLocaleString()}원
                    </ExpenseTotal>
                  </ExpenseSection>
                )}

                <ReviewFooter>
                  <ReviewDate>
                    {new Date(feed.review.createdAt).toLocaleDateString(
                      'ko-KR',
                      {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      },
                    )}{' '}
                    작성
                  </ReviewDate>
                </ReviewFooter>
              </ReviewContent>
            </ReviewSection>
          )}
        </ScrollableContainer>

        {/* 하단: 액션 바 */}
        {isCurrentUser && (
          <ModalActionBar>
            {/* 후기 작성 버튼 (여행중/여행완료 상태일 때 표시) */}
            {(feed.status === 'traveling' || feed.status === 'completed') &&
              !feed.review && (
                <ModalReviewButton
                  onClick={() => onReviewModalOpen?.(feed)}
                  disabled={!getReviewButtonState(feed, currentUserId).enabled}
                  title={getReviewButtonState(feed, currentUserId).tooltip}
                >
                  {getReviewButtonState(feed, currentUserId).text}
                </ModalReviewButton>
              )}

            {/* 상태 변경 버튼 */}
            <NextStatusButtonWithRefresh
              feed={feed}
              onStatusChange={onFeedStatusChange}
            />
          </ModalActionBar>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;

const ProfileHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 40px;
  border-bottom: 1px solid #dbdbdb;
`;

const ProfileAvatar = styled.div`
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background-color: #eee;
  margin-right: 60px;
  font-size: 80px; /* 아바타 텍스트 크기 */
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ProfileInfo = styled.div`
  flex-grow: 1;
`;

const Username = styled.h2`
  font-size: 28px;
  font-weight: 300;
  margin-bottom: 20px;
`;

const Stats = styled.div`
  display: flex;
  margin-bottom: 20px;

  span {
    margin-right: 40px;
    font-size: 16px;
  }

  strong {
    font-weight: 600;
  }
`;

const Bio = styled.p`
  font-size: 16px;
`;

const EditProfileButton = styled.button`
  background-color: transparent;
  border: 1px solid #dbdbdb;
  color: #262626;
  padding: 8px 16px;
  border-radius: 5px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap; // 버튼 텍스트가 줄바꿈되지 않도록 설정
`;

// 리뷰 페이지 이동 버튼 스타일
const ReviewButton = styled(EditProfileButton)`
  border-color: #3b82f6;
  color: #3b82f6;

  &:hover {
    background-color: rgba(59, 130, 246, 0.1);
  }
`;

// 프로필 헤더의 버튼들을 묶는 컨테이너
const ProfileButtonContainer = styled.div`
  display: flex;
  flex-direction: column; // 버튼을 세로로 정렬
  gap: 10px; // 버튼 사이의 간격
  align-self: flex-start; // 컨테이너를 상단에 정렬
`;

const FollowButton = styled(EditProfileButton)`
  border-color: #0095f6;
  color: #0095f6;

  &:hover {
    background-color: rgba(0, 149, 246, 0.1);
  }
`;

const MessageButton = styled(EditProfileButton)`
  border-color: #007bff;
  color: #007bff;

  &:hover {
    background-color: rgba(0, 123, 255, 0.1);
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
  padding: 20px;
`;

const PostsGridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 28px;
`;

const PostItem = styled.div`
  position: relative;
  width: 100%;
  padding-bottom: 100%; /* 1:1 Aspect Ratio */
  cursor: pointer;

  img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 8px;
  }

  /* 호버 시 오버레이 표시 */
  &:hover .hover-overlay {
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
  border-radius: 8px;
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
  background-color: white;
  border-radius: 8px;
  width: 90vw;
  height: 90vh;
  max-width: 900px;
  max-height: 600px;
  display: flex;
  overflow: hidden;
  flex-direction: column;

  @media (min-width: 768px) {
    flex-direction: row;
  }
`;

const PostImage = styled.img`
  width: 100%;
  height: 50%;
  object-fit: cover;

  @media (min-width: 768px) {
    width: 60%;
    height: 100%;
  }
`;

const PostDetailsContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;

  @media (min-width: 768px) {
    width: 40%;
  }
`;

const PostHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 50px 16px 16px; /* X 버튼과의 간격 확보 */
  border-bottom: 1px solid #efefef;

  i {
    font-size: 24px;
    cursor: pointer;
  }
`;

const AuthorInfo = styled.div`
  display: flex;
  align-items: center;
  font-weight: 600;

  span {
    margin-left: 12px;
  }
`;

const AuthorAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #eee;
`;

const PostActions = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #dbdbdb;
  margin-bottom: 10px;

  i {
    font-size: 24px;
    margin-right: 12px;
    cursor: pointer;
  }
`;

const PostDetails = styled.div`
  padding: 16px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
`;

const CommentInputSection = styled.div`
  display: flex;
  padding: 16px;
  border-top: 1px solid #efefef;
`;

const CommentInput = styled.input`
  flex-grow: 1;
  border: none;
  outline: none;
  background-color: transparent;
  font-size: 14px;
`;

const PostButton = styled.button`
  border: none;
  background-color: transparent;
  color: #0095f6;
  font-weight: 600;
  cursor: pointer;

  &:disabled {
    color: #b2dffc;
  }
`;

const Likes = styled.div`
  font-weight: 600;
  margin-bottom: 8px;
`;

const Caption = styled.div`
  margin-bottom: 8px;

  strong {
    margin-right: 5px;
  }
`;

const Comments = styled.div`
  margin-top: 12px;
  font-size: 14px;
  color: #8e8e8e;
`;

const Timestamp = styled.div`
  color: #8e8e8e;
  font-size: 12px;
`;

const CloseButton = styled.span`
  position: absolute;
  top: 20px;
  right: 40px; /* 오른쪽에서 좀 더 안쪽으로 이동 */
  font-size: 40px;
  font-weight: 300;
  color: #fff;
  cursor: pointer;
  z-index: 1010;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  font-size: 24px;
  color: #8e8e8e;
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  font-size: 24px;
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

const EmptyPostsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 50vh; /* 화면 높이의 50% */
  color: #8e8e8e;
  font-size: 20px;

  div:first-child {
    font-size: 60px;
    margin-bottom: 10px;
  }
`;

const CreatePostButton = styled(EditProfileButton)`
  border-color: #0095f6;
  color: #0095f6;
  padding: 8px 16px;
  border-radius: 5px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;

  &:hover {
    background-color: rgba(0, 149, 246, 0.1);
  }
`;

const DeleteButton = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.9);
  color: #ff4444;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.2s ease;
  z-index: 10;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  &:hover {
    background-color: #ff4444;
    color: white;
    transform: scale(1.1);
  }

  /* PostItem hover 시 표시 */
  ${PostItem}:hover & {
    opacity: 1;
  }
`;

const FeedManagementOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 15px;
  box-sizing: border-box;
  color: white;
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: 8px;
  pointer-events: none; /* 클릭 이벤트를 자식 요소에 전달하지 않도록 설정 */
  z-index: 5; /* 호버 오버레이보다 앞에 표시 */

  &:hover {
    opacity: 1;
  }
`;

const FeedReviewButton = styled.button`
  background: #3682f8;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 12px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  margin-top: 8px;
  pointer-events: auto; /* 버튼은 클릭 가능하도록 설정 */

  &:hover:not(:disabled) {
    background: #2563eb;
  }

  &:disabled {
    background: #94a3b8;
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

const ModalStatusBar = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid #dbdbdb;
  border-radius: 12px 12px 0 0;
  z-index: 20;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const ModalActionBar = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 15px 20px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 15px; /* 버튼들 사이 간격 */
  background-color: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-top: 1px solid #dbdbdb;
  border-radius: 0 0 12px 12px;
  z-index: 20;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
`;

const ReviewSection = styled.div`
  background-color: #f8f8f8;
  border-radius: 12px;
  padding: 20px;
  margin-top: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const ReviewHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
`;

const ReviewTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
`;

const ReviewRating = styled.div`
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #666;
`;

const Star = styled.span<{ $filled: boolean }>`
  font-size: 18px;
  color: ${({ $filled }) => ($filled ? '#ffd700' : '#e0e0e0')};
  margin-right: 5px;
`;

const RatingText = styled.span`
  margin-left: 5px;
`;

const ReviewContent = styled.div`
  font-size: 15px;
  line-height: 1.6;
  color: #444;
  margin-bottom: 15px;
`;

const ReviewSubTitle = styled.h4`
  font-size: 16px;
  font-weight: 500;
  color: #262626;
  margin-top: 0;
  margin-bottom: 8px;
`;

const ReviewText = styled.p`
  font-size: 15px;
  line-height: 1.6;
  color: #555;
  margin-bottom: 15px;
`;

const ReviewImages = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 15px;
`;

const ReviewImage = styled.img`
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 8px;
`;

const ReviewHighlights = styled.div`
  margin-bottom: 15px;
`;

const HighlightTitle = styled.h4`
  font-size: 16px;
  font-weight: 500;
  color: #262626;
  margin-top: 0;
  margin-bottom: 8px;
`;

const HighlightList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const HighlightItem = styled.li`
  font-size: 14px;
  color: #666;
  margin-bottom: 5px;
`;

const ReviewRecommendations = styled.div`
  margin-bottom: 15px;
`;

const RecommendationTitle = styled.h4`
  font-size: 16px;
  font-weight: 500;
  color: #262626;
  margin-top: 0;
  margin-bottom: 8px;
`;

const RecommendationList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const RecommendationItem = styled.li`
  font-size: 14px;
  color: #666;
  margin-bottom: 5px;
`;

const ExpenseSection = styled.div`
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px dashed #dbdbdb;
`;

const ExpenseTitle = styled.h4`
  font-size: 16px;
  font-weight: 500;
  color: #262626;
  margin-top: 0;
  margin-bottom: 8px;
`;

const ExpenseGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 10px;
`;

const ExpenseItem = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: #555;
`;

const ExpenseLabel = styled.span`
  font-weight: 500;
`;

const ExpenseAmount = styled.span`
  font-weight: 600;
  color: #007bff;
`;

const ExpenseTotal = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #007bff;
  text-align: right;
  margin-top: 10px;
`;

const ReviewFooter = styled.div`
  text-align: right;
  font-size: 13px;
  color: #888;
  margin-top: 15px;
`;

const ReviewDate = styled.span`
  font-weight: 500;
`;
