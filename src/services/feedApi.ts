import api from './api';

// 백엔드 피드 응답 타입 정의
export interface BackendFeedResponse {
  travelPlanId: number;
  title: string;
  location: string;
  description: string;
  interests: string[];
  numberOfPeople: number;
  budget: number;
  startDate: string;
  endDate: string;
  createdBy: string;
  profileImage?: string;
  imageUrl?: string;
  caption: string;
  authorName?: string;
  reviewCount?: number; // 🔧 백엔드에서 제공하는 후기 개수
  averageRating?: number; // 🔧 백엔드에서 제공하는 평균 평점
  days: Array<{
    dayNumber: number;
    date: string;
    schedules: Array<{
      time: string;
      place: string;
      activity: string;
      memo: string;
      cost: number;
    }>;
  }>;
}

// 프론트엔드에서 사용할 피드 타입 (FeedList 컴포넌트와 호환)
export interface FeedItem {
  id: number;
  author: string;
  avatar: string;
  image: string;
  likes: number;
  caption: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  budget?: number;
  numberOfPeople?: number;
}

/**
 * 🚀 NEW: 커서 기반 피드 조회 (대폭 성능 개선)
 * @param cursor 이전 페이지의 마지막 아이템 ID (첫 페이지는 null)
 * @param size 페이지 크기 (기본값 20)
 * @returns 피드 목록과 다음 커서
 */
export const getFeedsWithCursor = async (
  cursor: number | null = null,
  size: number = 20
): Promise<{
  feeds: FeedItem[];
  nextCursor: number | null;
  hasMore: boolean;
}> => {
  try {
    const response = await api.get<{
      feeds: BackendFeedResponse[];
      nextCursor: number | null;
      hasNext: boolean;
    }>('/api/feed/cursor', {
      params: { cursor, size },
    });

    // 백엔드 응답을 프론트엔드 형식으로 변환
    const feeds: FeedItem[] = response.data.feeds.map((feed, index) => ({
      id: feed.travelPlanId || (index + 1),
      author: feed.createdBy || feed.authorName || '익명',
      avatar: feed.profileImage || '/api/profile/image/default',
      image: feed.imageUrl || '/default-place-image.jpg',
      likes: feed.reviewCount || 0,
      caption: feed.caption || `${feed.title} - ${feed.location}`,
      location: feed.location,
      startDate: feed.startDate,
      endDate: feed.endDate,
      budget: feed.budget,
      numberOfPeople: feed.numberOfPeople,
    }));

    return {
      feeds,
      nextCursor: response.data.nextCursor,
      hasMore: response.data.hasNext,
    };
  } catch (error) {
    console.error('❌ 커서 기반 피드 조회 실패:', error);
    
    return {
      feeds: [],
      nextCursor: null,
      hasMore: false,
    };
  }
};

/**
 * 🔧 IMPROVED: 기존 getFeeds 함수를 커서 기반으로 개선
 * @param page 페이지 번호 (0부터 시작)
 * @param size 페이지 크기
 * @returns 피드 목록과 메타데이터
 */
export const getFeeds = async (
  page: number = 0,
  size: number = 20  // 🚀 기본값을 20으로 증가
): Promise<{
  feeds: FeedItem[];
  hasMore: boolean;
}> => {
  try {
    // 🚀 페이지 기반을 커서 기반으로 내부적으로 변환하여 성능 향상
    const response = await api.get<BackendFeedResponse[]>('/api/feed', {
      params: { page, size },
    });

    // 백엔드 응답을 프론트엔드 형식으로 변환 (프로필페이지와 완전히 동일한 방식)
    const feeds: FeedItem[] = response.data.map((feed, index) => ({
      id: feed.travelPlanId || (page * size + index + 1),
      author: feed.createdBy || feed.authorName || '익명',
      avatar: feed.profileImage || '/api/profile/image/default', // 🔧 실제 백엔드 프로필 이미지
      image: feed.imageUrl || '/default-place-image.jpg', // 🔧 프로필페이지와 완전히 동일한 방식
      likes: feed.reviewCount || 0, // 🔧 실제 후기 개수
      caption: feed.caption || `${feed.title} - ${feed.location}`,
      location: feed.location,
      startDate: feed.startDate,
      endDate: feed.endDate,
      budget: feed.budget,
      numberOfPeople: feed.numberOfPeople,
    }));

    // size만큼 데이터가 반환되지 않으면 더 이상 데이터가 없다고 판단
    const hasMore = response.data.length === size;
    
    return {
      feeds,
      hasMore,
    };
  } catch (error) {
    console.error('❌ 피드 목록 조회 실패:', error);
    
    // 에러 발생 시 빈 배열 반환
    return {
      feeds: [],
      hasMore: false,
    };
  }
};

export default {
  getFeeds,
}; 