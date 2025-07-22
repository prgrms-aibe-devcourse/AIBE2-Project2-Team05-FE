import {
  Feed,
  FeedStatus,
  StatusChangeRequest,
  ReviewFormData,
  ReviewCreateRequest,
  TravelReview,
} from '../types/feed';
import * as feedApi from './feedStatusApi';
import {
  addReviewToParticipantsProfiles,
  addFeedToUserProfile,
} from './feedStatusApi';

// 개발 모드 체크 (환경변수 또는 로컬스토리지 기반 모드 체크)
const isDevMode =
  process.env.NODE_ENV === 'development' ||
  localStorage.getItem('USE_LOCAL_STORAGE') === 'true';

// 피드 상태 변경 가능성 체크
export const canChangeStatus = (
  currentStatus: FeedStatus,
  targetStatus: FeedStatus,
): boolean => {
  const statusFlow: Record<FeedStatus, FeedStatus[]> = {
    recruiting: ['matched'], // 모집중 → 매칭완료만 가능
    matched: ['traveling'], // 매칭완료 → 여행중만 가능
    traveling: ['completed'], // 여행중 → 후기완료만 가능
    completed: [], // 후기완료는 최종 상태
  };

  return statusFlow[currentStatus].includes(targetStatus);
};

// 상태별 다음 가능한 상태 반환
export const getNextAvailableStatuses = (
  currentStatus: FeedStatus,
): FeedStatus[] => {
  const statusFlow: Record<FeedStatus, FeedStatus[]> = {
    recruiting: ['matched'],
    matched: ['traveling'],
    traveling: ['completed'], // 여행완료 버튼 활성화
    completed: [], // 후기완료는 실제 후기 작성시에만 변경됨 -> 'review_completed'
  };
  return statusFlow[currentStatus] || [];
};

// 로컬 스토리지에서 피드 목록 가져오기 (개발 모드용)
const getFeedsFromStorage = (): Feed[] => {
  const feeds = localStorage.getItem('myFeeds');
  return feeds ? JSON.parse(feeds) : [];
};

// 로컬 스토리지에 피드 목록 저장하기 (개발 모드용)
const saveFeedsToStorage = (feeds: Feed[]): void => {
  localStorage.setItem('myFeeds', JSON.stringify(feeds));
};

// 사용자의 프로필에 피드 추가 (로컬 스토리지용)
const addFeedToUserProfileLocal = (userId: string, feed: Feed): void => {
  try {
    // 사용자별 피드 목록을 localStorage에서 관리
    const userFeedsKey = `userFeeds_${userId}`;
    const existingUserFeeds = localStorage.getItem(userFeedsKey);
    let userFeeds: Feed[] = existingUserFeeds
      ? JSON.parse(existingUserFeeds)
      : [];

    // 이미 존재하는 피드인지 확인 (중복 방지)
    const existingFeedIndex = userFeeds.findIndex((f) => f.id === feed.id);

    if (existingFeedIndex >= 0) {
      // 기존 피드 업데이트 (후기 정보 포함)
      userFeeds[existingFeedIndex] = { ...feed };
    } else {
      // 새 피드 추가
      userFeeds.unshift({ ...feed });
    }

    // 사용자별 피드 목록 저장
    localStorage.setItem(userFeedsKey, JSON.stringify(userFeeds));

    console.log(
      `사용자 ${userId}의 프로필에 후기 피드가 추가되었습니다 (개발모드)`,
    );
  } catch (error) {
    console.error(
      `사용자 ${userId}의 프로필에 피드 추가 실패 (개발모드):`,
      error,
    );
  }
};

// 특정 피드의 상태 변경 (로컬 스토리지용)
const changeFeedStatusLocal = (
  feedId: number,
  newStatus: FeedStatus,
  userId?: string,
): Feed | null => {
  const feeds = getFeedsFromStorage();
  const feedIndex = feeds.findIndex((feed) => feed.id === feedId);

  if (feedIndex === -1) {
    console.error('피드를 찾을 수 없습니다.');
    return null;
  }

  const feed = feeds[feedIndex];
  const currentStatus = feed.status || 'recruiting';

  // 상태 변경 가능성 체크
  if (!canChangeStatus(currentStatus, newStatus)) {
    console.error(`${currentStatus}에서 ${newStatus}로 변경할 수 없습니다.`);
    return null;
  }

  // 상태 업데이트
  feeds[feedIndex] = {
    ...feed,
    status: newStatus,
    updatedAt: new Date().toISOString(),
  };

  // 매칭완료 상태로 변경 시 참여자 정보 초기화
  if (newStatus === 'matched' && !feeds[feedIndex].participants) {
    feeds[feedIndex].participants = [userId || 'current-user'];
  }

  saveFeedsToStorage(feeds);
  return feeds[feedIndex];
};

// 후기 작성 (로컬 스토리지용)
const createReviewLocal = (
  reviewData: ReviewFormData,
  feedId: number,
): Feed | null => {
  const feeds = getFeedsFromStorage();
  const feedIndex = feeds.findIndex((feed) => feed.id === feedId);

  if (feedIndex === -1) {
    console.error('피드를 찾을 수 없습니다.');
    return null;
  }

  // 지출 내역 계산
  const expenses = {
    accommodation: parseInt(reviewData.expenses.accommodation) || 0,
    food: parseInt(reviewData.expenses.food) || 0,
    transportation: parseInt(reviewData.expenses.transportation) || 0,
    activities: parseInt(reviewData.expenses.activities) || 0,
    shopping: parseInt(reviewData.expenses.shopping) || 0,
    etc: parseInt(reviewData.expenses.etc) || 0,
    total: 0,
  };
  expenses.total =
    Object.values(expenses).reduce((sum, value) => sum + value, 0) -
    expenses.total;

  // 후기 데이터 생성
  const review: TravelReview = {
    id: `review_${feedId}_${Date.now()}`,
    feedId,
    authorId: 'current-user',
    authorName: feeds[feedIndex].author,
    title: reviewData.title,
    content: reviewData.content,
    images: reviewData.imageUrls, // 개발 모드에서는 임시 URL 사용
    rating: reviewData.rating,
    highlights: reviewData.highlights.filter((h) => h.trim()),
    recommendations: reviewData.recommendations.filter((r) => r.trim()),
    expenses,
    createdAt: new Date().toISOString(),
  };

  // 피드에 후기 추가
  feeds[feedIndex] = {
    ...feeds[feedIndex],
    review,
    status: 'completed',
    updatedAt: new Date().toISOString(),
  };

  saveFeedsToStorage(feeds);

  // 참여자들의 프로필에 후기 피드 자동 등록 (개발 모드용)
  const updatedFeed = feeds[feedIndex];
  if (updatedFeed.participants && updatedFeed.participants.length > 0) {
    try {
      // 작성자도 포함한 모든 참여자 목록 생성 (중복 제거)
      const allParticipants = Array.from(
        new Set([
          updatedFeed.author, // 작성자 포함
          ...updatedFeed.participants, // 참여자들 포함
        ]),
      );

      // 각 참여자의 프로필에 후기 피드 추가 (개발 모드용)
      allParticipants.forEach((participantId) => {
        addFeedToUserProfileLocal(participantId, updatedFeed);
      });

      console.log(
        '참여자들의 프로필에 후기가 자동으로 추가되었습니다 (개발모드):',
        allParticipants,
      );
    } catch (profileError) {
      console.error('참여자 프로필에 후기 추가 실패 (개발모드):', profileError);
    }
  }

  return feeds[feedIndex];
};

/**
 * 사용자의 피드 목록 조회 (API 또는 로컬 스토리지)
 */
export const getUserFeeds = async (userId: string): Promise<Feed[]> => {
  if (isDevMode) {
    // 개발 모드: 로컬 스토리지 사용
    return getFeedsFromStorage();
  } else {
    // 운영 모드: API 사용
    return await feedApi.getUserFeeds(userId);
  }
};

/**
 * 특정 피드의 상태 변경 (API 또는 로컬 스토리지)
 */
export const changeFeedStatus = async (
  feedId: number,
  newStatus: FeedStatus,
  userId?: string,
): Promise<Feed | null> => {
  if (isDevMode) {
    // 개발 모드: 로컬 스토리지 사용
    const result = changeFeedStatusLocal(feedId, newStatus, userId);

    // 상태 변경 이력 추가
    if (result) {
      addStatusChangeLog(
        feedId,
        result.status || 'recruiting',
        newStatus,
        userId || 'current-user',
      );
    }

    return result;
  } else {
    // 운영 모드: API 사용
    try {
      if (!userId) {
        throw new Error('사용자 ID가 필요합니다.');
      }

      const updatedFeed = await feedApi.updateFeedStatus(
        feedId,
        newStatus,
        userId,
      );
      return updatedFeed;
    } catch (error) {
      console.error('피드 상태 변경 실패:', error);
      return null;
    }
  }
};

/**
 * 피드 생성 (API 또는 로컬 스토리지)
 */
export const createFeed = async (
  feedData: Omit<Feed, 'id'>,
): Promise<Feed | null> => {
  if (isDevMode) {
    // 개발 모드: 로컬 스토리지 사용
    const feeds = getFeedsFromStorage();
    const newFeed: Feed = {
      ...feedData,
      id: Date.now(), // 임시 ID 생성
      status: feedData.status || 'recruiting',
    };

    const updatedFeeds = [newFeed, ...feeds];
    saveFeedsToStorage(updatedFeeds);
    return newFeed;
  } else {
    // 운영 모드: API 사용
    try {
      return await feedApi.createFeed(feedData);
    } catch (error) {
      console.error('피드 생성 실패:', error);
      return null;
    }
  }
};

/**
 * 피드 삭제 (API 또는 로컬 스토리지)
 */
export const deleteFeed = async (feedId: number): Promise<boolean> => {
  if (isDevMode) {
    // 개발 모드: 로컬 스토리지 사용
    const feeds = getFeedsFromStorage();
    const filteredFeeds = feeds.filter((feed) => feed.id !== feedId);
    saveFeedsToStorage(filteredFeeds);
    return true;
  } else {
    // 운영 모드: API 사용
    return await feedApi.deleteFeed(feedId);
  }
};

/**
 * 후기 작성 (API 또는 로컬 스토리지)
 */
export const createReview = async (
  reviewData: ReviewFormData,
  feedId: number,
): Promise<Feed | null> => {
  if (isDevMode) {
    // 개발 모드: 로컬 스토리지 사용
    return createReviewLocal(reviewData, feedId);
  } else {
    // 운영 모드: API 사용
    try {
      // 1. 이미지 업로드
      let imageUrls: string[] = [];
      if (reviewData.images.length > 0) {
        imageUrls = await feedApi.uploadImages(reviewData.images);
      }

      // 2. 지출 내역 계산
      const expenses = {
        accommodation: parseInt(reviewData.expenses.accommodation) || 0,
        food: parseInt(reviewData.expenses.food) || 0,
        transportation: parseInt(reviewData.expenses.transportation) || 0,
        activities: parseInt(reviewData.expenses.activities) || 0,
        shopping: parseInt(reviewData.expenses.shopping) || 0,
        etc: parseInt(reviewData.expenses.etc) || 0,
        total: 0,
      };
      expenses.total =
        Object.values(expenses).reduce((sum, value) => sum + value, 0) -
        expenses.total;

      // 3. 후기 작성 API 호출
      const reviewCreateData: ReviewCreateRequest = {
        feedId,
        title: reviewData.title,
        content: reviewData.content,
        images: imageUrls,
        rating: reviewData.rating,
        highlights: reviewData.highlights.filter((h) => h.trim()),
        recommendations: reviewData.recommendations.filter((r) => r.trim()),
        expenses,
      };

      const review = await feedApi.createFeedReview(reviewCreateData);

      // 4. 피드 상태를 completed로 변경
      const updatedFeed = await feedApi.updateFeedStatus(
        feedId,
        'completed',
        'current-user',
      );

      // 5. 참여자들의 프로필에 후기 피드 자동 등록
      if (
        updatedFeed &&
        updatedFeed.participants &&
        updatedFeed.participants.length > 0
      ) {
        try {
          // 작성자도 포함한 모든 참여자 목록 생성 (중복 제거)
          const allParticipants = Array.from(
            new Set([
              updatedFeed.author, // 작성자 포함
              ...updatedFeed.participants, // 참여자들 포함
            ]),
          );

          // 백엔드 API를 통해 참여자들의 프로필에 후기 피드 추가
          await addReviewToParticipantsProfiles(feedId, allParticipants);

          console.log(
            '참여자들의 프로필에 후기가 자동으로 추가되었습니다:',
            allParticipants,
          );
        } catch (profileError) {
          console.error('참여자 프로필에 후기 추가 실패:', profileError);
          // 후기 작성은 성공했으므로 오류를 throw하지 않고 경고만 표시
        }
      }

      return updatedFeed;
    } catch (error) {
      console.error('후기 작성 실패:', error);
      throw error;
    }
  }
};

/**
 * 후기 조회 (API 또는 로컬 스토리지)
 */
export const getReview = async (
  feedId: number,
): Promise<TravelReview | null> => {
  if (isDevMode) {
    // 개발 모드: 로컬 스토리지 사용
    const feeds = getFeedsFromStorage();
    const feed = feeds.find((f) => f.id === feedId);
    return feed?.review || null;
  } else {
    // 운영 모드: API 사용
    return await feedApi.getFeedReview(feedId);
  }
};

// 피드 상태별 필터링
export const filterFeedsByStatus = (
  feeds: Feed[],
  status?: FeedStatus,
): Feed[] => {
  if (!status) return feeds;
  return feeds.filter((feed) => (feed.status || 'recruiting') === status);
};

// 사용자가 참여한 피드인지 확인
export const isParticipant = (feed: Feed, userId: string): boolean => {
  return feed.participants?.includes(userId) || feed.author === userId;
};

// 피드 상태 변경 권한 체크
export const hasStatusChangePermission = (
  feed: Feed,
  userId: string,
  targetStatus: FeedStatus,
): boolean => {
  // 작성자는 모든 상태 변경 가능
  if (feed.author === userId) return true;

  // 참여자는 여행중 → 후기완료만 가능
  if (targetStatus === 'completed' && isParticipant(feed, userId)) {
    return true;
  }

  return false;
};

// 후기 작성 권한 체크
export const hasReviewPermission = (feed: Feed, userId: string): boolean => {
  // 작성자이거나 참여자이면서 상태가 traveling 이상이어야 함
  const isAuthorOrParticipant =
    feed.author === userId || isParticipant(feed, userId);
  const canWriteReview =
    feed.status === 'traveling' || feed.status === 'completed';

  return isAuthorOrParticipant && canWriteReview;
};

// 피드 상태 변경 이력 추가 (로컬 스토리지용)
export const addStatusChangeLog = (
  feedId: number,
  fromStatus: FeedStatus,
  toStatus: FeedStatus,
  userId: string,
): void => {
  const logs = JSON.parse(localStorage.getItem('feedStatusLogs') || '[]');
  logs.push({
    feedId,
    fromStatus,
    toStatus,
    userId,
    timestamp: new Date().toISOString(),
  });
  localStorage.setItem('feedStatusLogs', JSON.stringify(logs));
};

/**
 * 개발 모드 전환 (로컬 스토리지 ↔ API)
 */
export const toggleDevMode = (useLocalStorage: boolean): void => {
  localStorage.setItem('USE_LOCAL_STORAGE', useLocalStorage.toString());
  window.location.reload(); // 모드 변경 후 새로고침
};

/**
 * 현재 모드 확인
 */
export const getCurrentMode = (): 'local' | 'api' => {
  return isDevMode ? 'local' : 'api';
};
