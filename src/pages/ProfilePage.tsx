import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import PlanPage from './PlanPage';
import {
  generateMockUserProfile,
  generateMockUserFeeds,
  generateMockPlanDataForFeed,
  UserFeed,
  UserProfile,
} from '../data/mockProfileData';
import {
  mockTravelPlans,
  getMockTravelPlanById,
} from '../data/mockTravelPlans';
import { getDestinationRepresentativeImage } from '../services/backendPlacesApi';

// 피드 상태 관리 관련 imports
import { FeedWithTravelStatus, TravelStatus, ReviewData } from '../types/feed';
import feedStatusService from '../services/feedStatusService';
import FeedStatusBadge from '../components/feed/FeedStatusBadge';
import FeedStatusChanger from '../components/feed/FeedStatusChanger';
import ReviewWriteModal from '../components/feed/ReviewWriteModal';

interface ModalProps {
  imageUrl: string;
  onClose: () => void;
}

// ProfilePage에서만 사용하는 추가 타입들
interface FilteredFeedsType {
  [key: string]: UserFeed[];
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
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userFeeds, setUserFeeds] = useState<UserFeed[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('created');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [travelPlanModalOpen, setTravelPlanModalOpen] = useState(false);
  const [selectedFeed, setSelectedFeed] = useState<UserFeed | null>(null);
  // 목적지별 이미지 캐시를 위한 상태
  const [destinationImages, setDestinationImages] = useState<
    Map<string, string>
  >(new Map());

  // 백엔드 API를 통해 목적지별 이미지 가져오기
  const getDestinationImage = async (destination: string): Promise<string> => {
    // 캐시된 이미지가 있으면 반환
    if (destinationImages.has(destination)) {
      return destinationImages.get(destination)!;
    }

    console.log('🔍 백엔드 API로 목적지 이미지 가져오기:', destination);

    try {
      const imageUrl = await getDestinationRepresentativeImage(destination);

      if (imageUrl) {
        console.log(
          '✅ 백엔드에서 이미지 가져오기 성공:',
          destination,
          imageUrl,
        );
        setDestinationImages((prev) =>
          new Map(prev).set(destination, imageUrl),
        );
        return imageUrl;
      } else {
        // 백엔드에서 이미지를 찾지 못한 경우 기본 이미지 사용
        const fallbackImage = `https://source.unsplash.com/600x400/?travel,${encodeURIComponent(destination)}`;
        console.log('⚠️ 백엔드에서 이미지 없음, Unsplash 사용:', destination);
        setDestinationImages((prev) =>
          new Map(prev).set(destination, fallbackImage),
        );
        return fallbackImage;
      }
    } catch (error) {
      console.error('❌ 백엔드 API 호출 실패:', destination, error);
      // API 호출 실패 시 Unsplash 이미지 사용
      const fallbackImage = `https://source.unsplash.com/600x400/?travel,${encodeURIComponent(destination)}`;
      setDestinationImages((prev) =>
        new Map(prev).set(destination, fallbackImage),
      );
      return fallbackImage;
    }
  };

  // 피드 상태 관리 관련 state
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedFeedForReview, setSelectedFeedForReview] =
    useState<FeedWithTravelStatus | null>(null);
  const [feedsWithStatus, setFeedsWithStatus] = useState<
    FeedWithTravelStatus[]
  >([]);

  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();

  useEffect(() => {
    // 프로필 데이터 로드 - 백엔드 API 연동 준비
    const loadUserData = async () => {
      setLoading(true);

      try {
        // 현재 사용자인지 확인
        const currentUserId = 'current-user'; // 실제로는 AuthContext에서 가져올 예정
        const isCurrentUser = !userId || userId === currentUserId;
        const targetUserId = userId || currentUserId;

        // TODO: 백엔드 API 호출로 교체 예정
        // const profileData = await fetch(`/api/users/${targetUserId}/profile`).then(res => res.json());
        // const feedsData = await fetch(`/api/users/${targetUserId}/feeds`).then(res => res.json());

        // 임시 샘플 데이터 (백엔드 연동 전까지 사용) - 분리된 함수 사용
        const sampleProfile = generateMockUserProfile(
          targetUserId,
          isCurrentUser,
        );
        setUserProfile(sampleProfile);

        // 백엔드에서 피드 권한에 따라 분류된 데이터를 가져올 예정
        // 응답 형태 예시:
        // {
        //   createdTrips: [...], // 내가 계획자인 여행들
        //   joinedTrips: [...],  // 내가 참여자인 여행들
        // }
        const sampleFeeds = generateMockUserFeeds(targetUserId);
        setUserFeeds(sampleFeeds);

        // 각 피드에 대한 여행 계획 데이터 확인 (실제 사용자 데이터 우선)
        // 구글 플레이스 API를 통해 모든 이미지 획득
        const feedProcessingPromises = sampleFeeds.map(async (feed) => {
          if (!feed.planId) return; // planId가 없으면 건너뜀

          try {
            // ✅ 우선 실제 사용자가 저장한 계획 데이터가 있는지 확인
            const existingPlanData = localStorage.getItem(
              `plan_${feed.planId}`,
            );
            let planData = null;

            if (existingPlanData) {
              // 📋 실제 사용자 데이터가 있으면 사용
              console.log(`✅ 실제 사용자 데이터 발견: ${feed.planId}`);
              planData = JSON.parse(existingPlanData);
            } else {
              // 🔄 실제 데이터가 없으면 Mock 데이터 사용 (신규 사용자용)
              console.log(
                `⚠️ 사용자 데이터 없음, Mock 데이터 사용: ${feed.planId}`,
              );
              planData = getMockTravelPlanById(feed.planId);

              if (!planData) {
                // 실제 mock 데이터가 없으면 generateMockPlanDataForFeed로 생성
                planData = generateMockPlanDataForFeed(feed);
              }
            }

            if (!planData) {
              console.warn(
                `⚠️ 피드 ${feed.planId}에 대한 계획 데이터를 생성할 수 없습니다`,
              );
              return;
            }

            // 구글 플레이스 API를 통해 대표 이미지 가져오기 (필수)
            try {
              console.log(
                `🔍 구글 플레이스 API로 이미지 검색 시작: ${planData.destination} (planId: ${feed.planId})`,
              );

              const backendImageUrl = await getDestinationRepresentativeImage(
                planData.destination,
              );

              if (backendImageUrl && backendImageUrl !== 'NO_IMAGE') {
                // 성공: planData와 feed 썸네일 모두 업데이트
                planData.imageUrl = backendImageUrl;
                feed.image = backendImageUrl;

                console.log(
                  `✅ 구글 플레이스 이미지 획득 성공: ${planData.destination} -> ${backendImageUrl.substring(0, 60)}...`,
                );
              } else {
                // 구글 플레이스에서 이미지를 찾지 못함 - 백엔드 API 사용
                const destinationImage = await getDestinationImage(
                  planData.destination,
                );
                planData.imageUrl = destinationImage;
                feed.image = destinationImage;

                console.warn(
                  `⚠️ 구글 플레이스에서 이미지 없음, 백엔드 API 사용: ${planData.destination} -> ${destinationImage}`,
                );
              }
            } catch (imageError) {
              // API 호출 실패 - 백엔드 API 사용
              const destinationImage = await getDestinationImage(
                planData.destination,
              );
              planData.imageUrl = destinationImage;
              feed.image = destinationImage;

              console.error(
                `❌ 구글 플레이스 API 실패, 백엔드 API 사용: ${planData.destination} -> ${destinationImage}`,
                imageError,
              );
            }

            // localStorage에 저장 (실제 사용자 데이터가 없었던 경우만)
            if (!existingPlanData) {
              localStorage.setItem(
                `plan_${feed.planId}`,
                JSON.stringify(planData),
              );
              console.log(
                `💾 새 여행 계획 데이터 저장: ${feed.planId} -> ${planData.title}`,
              );
            } else {
              console.log(
                `🔒 기존 사용자 데이터 보존: ${feed.planId} -> ${planData.title}`,
              );
            }
          } catch (feedError) {
            console.error(`❌ 피드 ${feed.planId} 처리 중 오류:`, feedError);
          }
        });

        // 모든 피드 데이터 처리가 완료될 때까지 기다림
        try {
          await Promise.all(feedProcessingPromises);

          // ✨ 구글 플레이스 이미지 로드 완료 후 피드 상태를 새롭게 업데이트
          const updatedFeeds = sampleFeeds.map((feed) => ({
            ...feed,
            // 이미지가 없으면 기본 여행 이미지 사용
            image:
              feed.image ||
              'https://source.unsplash.com/600x400/?travel,vacation',
          }));

          setUserFeeds(updatedFeeds);
          console.log('✅ 모든 피드 데이터 처리 완료 (구글 플레이스 API 사용)');

          // 피드에 여행 상태 정보 추가
          const enrichedFeeds =
            feedStatusService.enrichFeedsWithStatus(updatedFeeds);
          setFeedsWithStatus(enrichedFeeds);

          setLoading(false);
        } catch (error) {
          console.error('프로필 로딩 중 오류:', error);
          setLoading(false);
        }

        setLoading(false);
      } catch (error) {
        console.error('사용자 데이터 로드 실패:', error);
        setLoading(false);
      }
    };

    // 약간의 지연으로 로딩 시뮬레이션
    setTimeout(loadUserData, 500);
  }, [userId]);

  // 피드 상태 변경 핸들러
  const handleStatusChange = (feedId: number, newStatus: TravelStatus) => {
    setFeedsWithStatus((prev) =>
      prev.map((feed) =>
        feed.id === feedId
          ? {
              ...feed,
              travelStatus: newStatus,
              statusUpdatedAt: new Date().toISOString(),
            }
          : feed,
      ),
    );

    // userFeeds도 업데이트 (일관성 유지)
    setUserFeeds((prev) =>
      prev.map((feed) =>
        feed.id === feedId ? { ...feed, travelStatus: newStatus } : feed,
      ),
    );
  };

  // 후기 작성 모달 열기
  const handleOpenReviewModal = (feed: FeedWithTravelStatus) => {
    if (feed.travelStatus !== 'completed') {
      alert('여행이 완료된 후에 후기를 작성할 수 있습니다.');
      return;
    }

    if (feed.reviewWritten) {
      alert('이미 후기를 작성한 여행입니다.');
      return;
    }

    setSelectedFeedForReview(feed);
    setReviewModalOpen(true);
  };

  // 후기 작성 완료 핸들러
  const handleReviewSubmit = (review: ReviewData) => {
    const feedId = review.feedId;

    // 피드에 후기 작성 완료 표시
    setFeedsWithStatus((prev) =>
      prev.map((feed) =>
        feed.id === feedId ? { ...feed, reviewWritten: true } : feed,
      ),
    );

    console.log(`✅ 피드 ${feedId} 후기 작성 완료:`, review);
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
      // ✨ picsum 랜덤 이미지 대신 처리된 이미지만 사용
      setSelectedImage(feed.image);
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

  // 현재 활성화된 탭에 따라 피드 필터링
  // 백엔드에서 이미 권한별로 분류된 데이터를 받을 예정이지만,
  // 프론트엔드에서도 탭별로 필터링하여 표시
  const getFilteredFeeds = () => {
    if (activeTab === 'created') {
      // 내가 계획자인 여행들만 표시
      return feedsWithStatus.filter((feed) => feed.travelType === 'created');
    } else if (activeTab === 'joined') {
      // 타인이 만든 여행에 내가 참여한 것들만 표시
      return feedsWithStatus.filter((feed) => feed.travelType === 'joined');
    }
    return [];
  };

  // TODO: 백엔드 API 연동 함수들 (현재는 더미, 실제 구현 시 사용)
  const fetchUserProfile = async (userId: string) => {
    // 실제 API 호출 예시:
    // const response = await fetch(`/api/users/${userId}/profile`);
    // return response.json();

    // 현재는 더미 데이터 반환
    return null;
  };

  const fetchUserFeeds = async (userId: string) => {
    // 실제 API 호출 예시:
    // const response = await fetch(`/api/users/${userId}/feeds`);
    // const data = response.json();
    //
    // 백엔드 응답 구조 예시:
    // {
    //   createdTrips: UserFeed[], // 내가 계획자인 여행들
    //   joinedTrips: UserFeed[],  // 내가 참여자인 여행들
    //   totalCount: number,
    //   createdCount: number,
    //   joinedCount: number
    // }

    // 현재는 더미 데이터 반환
    return null;
  };

  // 피드 삭제 함수
  const handleDeleteFeed = async (feedId: number) => {
    try {
      // 사용자 확인
      const confirmed = window.confirm('이 피드를 삭제하시겠습니까?');
      if (!confirmed) return;

      console.log(`🗑️ 피드 삭제 시작: ${feedId}`);

      // 1. 로컬 state에서 피드 제거
      const updatedFeeds = userFeeds.filter((feed) => feed.id !== feedId);
      setUserFeeds(updatedFeeds);

      // 2. localStorage에서 myFeeds 업데이트 (현재 사용자의 피드인 경우)
      const myFeedsStr = localStorage.getItem('myFeeds');
      if (myFeedsStr) {
        const myFeeds = JSON.parse(myFeedsStr);
        const updatedMyFeeds = myFeeds.filter(
          (feed: any) => feed.id !== feedId,
        );
        localStorage.setItem('myFeeds', JSON.stringify(updatedMyFeeds));
        console.log('✅ myFeeds에서 피드 삭제 완료');
      }

      // 3. 연관된 여행 계획 데이터 삭제
      const targetFeed = userFeeds.find((feed) => feed.id === feedId);
      if (targetFeed?.planId) {
        // localStorage에서 개별 계획 데이터 삭제
        localStorage.removeItem(`plan_${targetFeed.planId}`);
        console.log(`✅ 여행 계획 데이터 삭제 완료: ${targetFeed.planId}`);

        // 4. 매칭 포스트에서도 삭제
        try {
          const matePostsStr = localStorage.getItem('matePosts');
          if (matePostsStr) {
            const matePosts = JSON.parse(matePostsStr);
            const updatedMatePosts = matePosts.filter(
              (post: any) => post.planId !== targetFeed.planId,
            );
            localStorage.setItem('matePosts', JSON.stringify(updatedMatePosts));
            console.log('✅ 매칭 포스트에서도 삭제 완료');
          }
        } catch (error) {
          console.warn('매칭 포스트 삭제 중 오류:', error);
        }
      }

      // 5. 프로필 통계 업데이트
      if (userProfile && targetFeed?.travelType === 'created') {
        setUserProfile((prev) =>
          prev
            ? {
                ...prev,
                createdTripsCount: Math.max(0, prev.createdTripsCount - 1),
              }
            : null,
        );
      }

      console.log('🎉 피드 삭제 완료!');

      // TODO: 실제 백엔드 API 호출
      // await fetch(`/api/feeds/${feedId}`, { method: 'DELETE' });
    } catch (error) {
      console.error('❌ 피드 삭제 중 오류:', error);
      alert('피드 삭제 중 오류가 발생했습니다.');

      // 오류 발생 시 UI 복구를 위해 다시 로드
      window.location.reload();
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

  const filteredFeeds = getFilteredFeeds();

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
            <SettingsButton onClick={handleEditProfile}>⚙️ 설정</SettingsButton>
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
          onClick={() => setActiveTab('created')}
          className={activeTab === 'created' ? 'active' : ''}
        >
          ✈️ 내가 만든 여행 ({userProfile.createdTripsCount})
        </Tab>
        <Tab
          onClick={() => setActiveTab('joined')}
          className={activeTab === 'joined' ? 'active' : ''}
        >
          🤝 참여한 여행 ({userProfile.joinedTripsCount})
        </Tab>
      </Tabs>

      <TabContent>
        <AnimatePresence mode="wait">
          {activeTab === 'created' && (
            <motion.div
              key="created"
              variants={tabContentVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.15 }}
            >
              {filteredFeeds.length > 0 ? (
                <PostGrid
                  feeds={filteredFeeds}
                  onFeedClick={handleFeedClick}
                  onDeleteFeed={handleDeleteFeed}
                  showDeleteButton={userProfile?.isCurrentUser || false}
                  onStatusChange={handleStatusChange}
                  onOpenReviewModal={handleOpenReviewModal}
                />
              ) : (
                <EmptyStateContainer>
                  <div style={{ fontSize: '60px', marginBottom: '10px' }}>
                    ✈️
                  </div>
                  <div>아직 만든 여행 계획이 없습니다</div>
                  {userProfile.isCurrentUser && (
                    <Link to="/plan/write">
                      <CreateTripButton>첫 여행 계획 만들기</CreateTripButton>
                    </Link>
                  )}
                </EmptyStateContainer>
              )}
            </motion.div>
          )}
          {activeTab === 'joined' && (
            <motion.div
              key="joined"
              variants={tabContentVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.15 }}
            >
              {filteredFeeds.length > 0 ? (
                <PostGrid feeds={filteredFeeds} onFeedClick={handleFeedClick} />
              ) : (
                <EmptyStateContainer>
                  <div style={{ fontSize: '60px', marginBottom: '10px' }}>
                    🤝
                  </div>
                  <div>아직 참여한 여행이 없습니다</div>
                  <div
                    style={{
                      fontSize: '14px',
                      color: '#999',
                      marginTop: '8px',
                    }}
                  >
                    다른 사용자의 여행에 참여해보세요!
                  </div>
                </EmptyStateContainer>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </TabContent>

      {/* 모달들 */}
      {modalOpen && <Modal imageUrl={selectedImage} onClose={closeModal} />}
      {travelPlanModalOpen && selectedFeed && (
        <PlanPageModal
          feed={selectedFeed}
          onClose={closeTravelPlanModal}
          feedWithStatus={feedsWithStatus.find((f) => f.id === selectedFeed.id)}
          isOwner={userProfile?.isCurrentUser}
        />
      )}

      {/* 후기 작성 모달 */}
      {reviewModalOpen && selectedFeedForReview && (
        <ReviewWriteModal
          isOpen={reviewModalOpen}
          onClose={() => {
            setReviewModalOpen(false);
            setSelectedFeedForReview(null);
          }}
          feedId={selectedFeedForReview.id}
          planId={selectedFeedForReview.planId || ''}
          destination={selectedFeedForReview.caption.split('\n')[0] || '여행지'}
          onReviewSubmit={handleReviewSubmit}
        />
      )}
    </motion.div>
  );
};

interface PostGridProps {
  feeds: FeedWithTravelStatus[];
  onFeedClick: (feed: UserFeed) => void;
  onDeleteFeed?: (feedId: number) => void;
  showDeleteButton?: boolean;
  onStatusChange?: (feedId: number, newStatus: TravelStatus) => void;
  onOpenReviewModal?: (feed: FeedWithTravelStatus) => void;
}

const PostGrid = ({
  feeds,
  onFeedClick,
  onDeleteFeed,
  showDeleteButton = false,
  onStatusChange,
  onOpenReviewModal,
}: PostGridProps) => (
  <PostsGridContainer>
    {feeds.map((feed) => (
      <PostItem key={feed.id} onClick={() => onFeedClick(feed)}>
        <img
          src={feed.image} // ✨ picsum fallback 제거, 구글 플레이스 이미지만 사용
          alt={`post-${feed.id}`}
        />

        {/* 여행 상태 뱃지 */}
        <FeedStatusContainer>
          <FeedStatusBadge status={feed.travelStatus} size="small" />
        </FeedStatusContainer>

        {/* 삭제 버튼 - 내가 만든 여행에만 표시 */}
        {showDeleteButton && feed.travelType === 'created' && onDeleteFeed && (
          <DeleteButton
            onClick={(e) => {
              e.stopPropagation();
              onDeleteFeed(feed.id);
            }}
          >
            🗑️
          </DeleteButton>
        )}

        {/* 후기 작성 버튼 - 완료된 여행이고 후기 미작성 시 */}
        {feed.travelStatus === 'completed' &&
          !feed.reviewWritten &&
          feed.travelType === 'created' &&
          onOpenReviewModal && (
            <ReviewButton
              onClick={(e) => {
                e.stopPropagation();
                onOpenReviewModal(feed);
              }}
            >
              후기작성
            </ReviewButton>
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
          }}
        >
          {/* 상태 변경 컴포넌트 - 내가 만든 여행에만 표시 */}
          {feed.travelType === 'created' && onStatusChange && (
            <StatusChangerContainer>
              <FeedStatusChanger
                feedId={feed.id}
                currentStatus={feed.travelStatus}
                onStatusChange={(newStatus) =>
                  onStatusChange(feed.id, newStatus)
                }
              />
            </StatusChangerContainer>
          )}

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
          {feed.type === 'travel-plan' && <PostBadge>✈️ 여행계획</PostBadge>}
        </div>
      </PostItem>
    ))}
  </PostsGridContainer>
);

// 스크롤바를 숨기는 래퍼 컴포넌트
const ScrollableContainer = styled.div`
  width: 100%;
  height: 100%;
  border-radius: 12px;
  overflow: auto;

  /* 스크롤바 숨기기 */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
  -webkit-overflow-scrolling: touch; /* iOS smooth scrolling */

  /* Webkit 기반 브라우저 (Chrome, Safari) */
  &::-webkit-scrollbar {
    display: none;
  }
`;

// 여행 계획 모달 컴포넌트 - PlanPage를 모달로 래핑
interface PlanPageModalProps {
  feed: UserFeed;
  onClose: () => void;
  feedWithStatus?: FeedWithTravelStatus;
  isOwner?: boolean;
}

const PlanPageModal: React.FC<PlanPageModalProps> = ({
  feed,
  onClose,
  feedWithStatus,
  isOwner = false,
}) => {
  const [currentFeedStatus, setCurrentFeedStatus] =
    useState<TravelStatus>('recruiting');

  useEffect(() => {
    // 모달이 열릴 때 해당 피드의 여행 계획 데이터를 localStorage에 설정
    if (feed.planId) {
      const savedPlan = localStorage.getItem(`plan_${feed.planId}`);
      if (savedPlan) {
        // 해당 계획을 현재 계획으로 설정 (PlanPage에서 읽어옴)
        localStorage.setItem('currentTravelPlan', savedPlan);
      } else {
        // 기본 데이터 생성
        const defaultPlan = {
          id: feed.planId,
          title: feed.caption?.split('\n')[1] || '여행 계획',
          author: {
            id: 'current-user',
            name: feed.author,
            profileImage: feed.avatar,
          },
          startDate: '2024-01-01',
          endDate: '2024-01-03',
          destination: '여행지',
          budget: '예산 정보 없음',
          people: '인원 정보 없음',
          period: '2박 3일',
          days: [
            {
              id: 'day1',
              dayNumber: 1,
              date: '2024-01-01',
              events: [
                {
                  id: 'event1',
                  time: '09:00',
                  title: '여행 시작',
                  location: '출발지',
                  description: '즐거운 여행을 시작해요!',
                  tags: ['여행'],
                  price: '무료',
                  category: 'transport',
                },
              ],
            },
          ],
          likes: feed.likes,
          likedUsers: [],
          isLiked: false,
        };
        localStorage.setItem('currentTravelPlan', JSON.stringify(defaultPlan));
      }
    }

    // 초기 상태 설정
    if (feedWithStatus) {
      setCurrentFeedStatus(feedWithStatus.travelStatus);
    }

    // 실시간 상태 업데이트를 위한 interval 설정
    const statusCheckInterval = setInterval(() => {
      try {
        const feedId = feed.id;
        const statusInfo = feedStatusService.getFeedStatus(feedId);
        if (statusInfo && statusInfo !== currentFeedStatus) {
          setCurrentFeedStatus(statusInfo);
        }
      } catch (error) {
        console.error('상태 체크 오류:', error);
      }
    }, 1000); // 1초마다 체크

    // ESC 키로 모달 닫기
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEsc);

    return () => {
      document.removeEventListener('keydown', handleEsc);
      clearInterval(statusCheckInterval);
    };
  }, [feed, onClose, feedWithStatus, currentFeedStatus]);

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
          overflow: 'hidden',
          position: 'relative',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 상태 뱃지 - 좌측 상단 */}
        {feedWithStatus && isOwner && (
          <div
            style={{
              position: 'absolute',
              top: '20px',
              left: '30px',
              zIndex: 10,
            }}
          >
            <FeedStatusBadge
              status={currentFeedStatus}
              size="medium"
              showDescription={true}
            />
          </div>
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
            zIndex: 10,
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
        <div style={{ flex: 1, overflow: 'auto' }}>
          <ScrollableContainer>
            <PlanPage />
          </ScrollableContainer>
        </div>

        {/* 하단 상태 관리 버튼들 - 피드 소유자일 때만 표시 */}
        {/* PlanPage 내부에서 자체 관리하므로 제거 */}
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

// 프로필 헤더의 버튼들을 묶는 컨테이너
const ProfileButtonContainer = styled.div`
  display: flex;
  gap: 10px; // 버튼 사이의 간격
  align-self: flex-start; // 컨테이너를 상단에 정렬
`;

const FollowButton = styled(EditProfileButton)`
  background-color: #0095f6;
  color: white;
  border-color: #0095f6;

  &:hover {
    background-color: #1877f2;
  }
`;

const MessageButton = styled(EditProfileButton)`
  margin-left: 8px;
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
  padding: 12px 20px; /* 20px에서 12px로 줄임 */

  @media (max-width: 768px) {
    padding: 8px 16px; /* 모바일에서 더 작은 padding */
  }
`;

const PostsGridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4px; // 인스타그램처럼 간격을 좁게
  max-width: 935px; // 인스타그램 스타일 최대 너비
  margin: 0 auto;

  @media (max-width: 768px) {
    gap: 2px; // 모바일에서는 더 좁은 간격
    max-width: 100%;
  }
`;

const PostItem = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 1; // 정사각형 비율 유지 (1:1)
  cursor: pointer;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 0; // 인스타그램처럼 둥근 모서리 제거
    border: none; // 테두리 제거
    display: block;
  }

  /* 호버 시 오버레이 표시 */
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

const FeedStatusContainer = styled.div`
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 5;
`;

const ReviewButton = styled.button`
  position: absolute;
  bottom: 8px;
  right: 8px;
  background-color: #10b981;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  z-index: 5;

  &:hover {
    background-color: #059669;
  }

  &:disabled {
    background-color: #9ca3af;
    cursor: not-allowed;
  }
`;

const StatusChangerContainer = styled.div`
  position: absolute;
  bottom: 40px;
  left: 8px;
  right: 8px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 8px;
  padding: 8px;
  z-index: 5;
  opacity: 0;
  transform: translateY(10px);
  transition: all 0.3s ease;
`;

const DeleteButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: rgba(255, 255, 255, 0.7);
  border: 1px solid #dbdbdb;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  cursor: pointer;
  z-index: 10;
  color: #ff0000;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);

  &:hover {
    background-color: rgba(255, 255, 255, 0.9);
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
  padding: 16px 50px 16px 16px;
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
  right: 40px;
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

const EmptyStateContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 50vh;
  color: #8e8e8e;
  fontsize: 20px;
`;

const CreateTripButton = styled.button`
  border: 1px solid #0095f6;
  color: #0095f6;
  padding: 8px 16px;
  border-radius: 5px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  background-color: transparent;
  margin-top: 20px;
  text-decoration: none;

  &:hover {
    background-color: rgba(0, 149, 246, 0.1);
  }
`;

const SettingsButton = styled.button`
  background-color: transparent;
  border: 1px solid #dbdbdb;
  color: #262626;
  padding: 8px 16px;
  border-radius: 5px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 6px;

  &:hover {
    background-color: #f5f5f5;
  }
`;
