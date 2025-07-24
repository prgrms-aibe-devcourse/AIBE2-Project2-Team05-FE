import {
  Feed,
  FeedStatus,
  StatusChangeRequest,
  ReviewCreateRequest,
  TravelReview,
} from '../types/feed';

// API 기본 URL (환경변수에서 가져오거나 기본값 사용)
const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

// API 공통 요청 헤더
const getHeaders = () => ({
  'Content-Type': 'application/json',
  // JWT 토큰이 있다면 추가
  Authorization: localStorage.getItem('accessToken')
    ? `Bearer ${localStorage.getItem('accessToken')}`
    : '',
});

// 에러 응답 처리
const handleApiError = (error: any, operation: string) => {
  console.error(`${operation} API 오류:`, error);
  throw new Error(`${operation} 중 오류가 발생했습니다.`);
};

/**
 * 사용자의 피드 목록 조회
 */
export const getUserFeeds = async (userId: string): Promise<Feed[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/feeds/user/${userId}`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    return data.feeds || [];
  } catch (error) {
    handleApiError(error, '피드 목록 조회');
    return [];
  }
};

/**
 * 특정 피드의 상태 변경
 */
export const updateFeedStatus = async (
  feedId: number,
  newStatus: FeedStatus,
  userId: string,
): Promise<Feed> => {
  try {
    const requestData: StatusChangeRequest = {
      feedId,
      newStatus,
      userId,
    };

    const response = await fetch(`${API_BASE_URL}/api/feeds/${feedId}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    return data.feed;
  } catch (error) {
    handleApiError(error, '피드 상태 변경');
    throw error;
  }
};

/**
 * 피드에 참여자 추가/제거
 */
export const updateFeedParticipants = async (
  feedId: number,
  participantId: string,
  action: 'add' | 'remove',
): Promise<Feed> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/feeds/${feedId}/participants`,
      {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({
          participantId,
          action,
        }),
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    return data.feed;
  } catch (error) {
    handleApiError(error, '참여자 관리');
    throw error;
  }
};

/**
 * 상태별 피드 목록 조회
 */
export const getFeedsByStatus = async (
  status: FeedStatus,
  page: number = 1,
  limit: number = 10,
): Promise<{ feeds: Feed[]; total: number; hasMore: boolean }> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/feeds?status=${status}&page=${page}&limit=${limit}`,
      {
        method: 'GET',
        headers: getHeaders(),
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    return {
      feeds: data.feeds || [],
      total: data.total || 0,
      hasMore: data.hasMore || false,
    };
  } catch (error) {
    handleApiError(error, '상태별 피드 조회');
    return { feeds: [], total: 0, hasMore: false };
  }
};

/**
 * 피드 생성 (여행 계획 작성 시)
 */
export const createFeed = async (feedData: Omit<Feed, 'id'>): Promise<Feed> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/feeds`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(feedData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    return data.feed;
  } catch (error) {
    handleApiError(error, '피드 생성');
    throw error;
  }
};

/**
 * 피드 삭제
 */
export const deleteFeed = async (feedId: number): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/feeds/${feedId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    return true;
  } catch (error) {
    handleApiError(error, '피드 삭제');
    return false;
  }
};

/**
 * 피드 상태 변경 이력 조회
 */
export const getFeedStatusHistory = async (feedId: number): Promise<any[]> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/feeds/${feedId}/status-history`,
      {
        method: 'GET',
        headers: getHeaders(),
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    return data.history || [];
  } catch (error) {
    handleApiError(error, '상태 변경 이력 조회');
    return [];
  }
};

/**
 * 피드에 후기 작성
 */
export const createFeedReview = async (
  reviewData: ReviewCreateRequest,
): Promise<TravelReview> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/feeds/${reviewData.feedId}/review`,
      {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(reviewData),
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    return data.review;
  } catch (error) {
    handleApiError(error, '후기 작성');
    throw error;
  }
};

/**
 * 이미지 업로드 (파일 업로드)
 */
export const uploadImages = async (files: File[]): Promise<string[]> => {
  try {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`images`, file);
    });

    const response = await fetch(`${API_BASE_URL}/api/upload/images`, {
      method: 'POST',
      headers: {
        // Content-Type을 설정하지 않음 (multipart/form-data는 브라우저가 자동으로 설정)
        Authorization: localStorage.getItem('accessToken')
          ? `Bearer ${localStorage.getItem('accessToken')}`
          : '',
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    return data.imageUrls || [];
  } catch (error) {
    handleApiError(error, '이미지 업로드');
    return [];
  }
};

/**
 * 피드 후기 조회
 */
export const getFeedReview = async (
  feedId: number,
): Promise<TravelReview | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/feeds/${feedId}/review`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null; // 후기가 없는 경우
      }
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    return data.review;
  } catch (error) {
    handleApiError(error, '후기 조회');
    return null;
  }
};

/**
 * 피드 후기 수정
 */
export const updateFeedReview = async (
  feedId: number,
  reviewData: Partial<ReviewCreateRequest>,
): Promise<TravelReview> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/feeds/${feedId}/review`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(reviewData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    return data.review;
  } catch (error) {
    handleApiError(error, '후기 수정');
    throw error;
  }
};

/**
 * 피드 후기 삭제
 */
export const deleteFeedReview = async (feedId: number): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/feeds/${feedId}/review`, {
      method: 'DELETE',
      headers: getHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    return true;
  } catch (error) {
    handleApiError(error, '후기 삭제');
    return false;
  }
};

/**
 * 참여자들의 프로필에 후기 피드 자동 등록
 */
export const addReviewToParticipantsProfiles = async (
  feedId: number,
  participantUserIds: string[],
): Promise<boolean> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/feeds/${feedId}/distribute-review`,
      {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          participantUserIds,
        }),
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    return true;
  } catch (error) {
    handleApiError(error, '참여자 프로필에 후기 추가');
    return false;
  }
};

/**
 * 특정 사용자의 프로필에 피드 추가
 */
export const addFeedToUserProfile = async (
  userId: string,
  feedId: number,
): Promise<boolean> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/users/${userId}/profile/feeds`,
      {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          feedId,
        }),
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    return true;
  } catch (error) {
    handleApiError(error, '사용자 프로필에 피드 추가');
    return false;
  }
};
