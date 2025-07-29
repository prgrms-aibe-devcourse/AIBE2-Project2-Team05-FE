/**
 * 백엔드 후기 API 통신 서비스
 */
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080';

// 후기 작성 요청 타입
export interface ReviewCreateRequest {
  title: string;
  content: string;
  rating: number;
  tags?: string[];
  imageUrls?: string[];
}

// 후기 응답 타입
export interface ReviewResponse {
  id: number;
  travelFeedId: number;
  title: string;
  content: string;
  rating: number;
  tags: string[];
  imageUrls: string[];
  createdAt: string;
  author: {
    id: number;
    email: string;
    nickname: string;
    profileImageUrl: string;
  };
}

// 후기 목록 응답 타입
export interface ReviewListResponse {
  success: boolean;
  reviews: ReviewResponse[];
  stats: {
    averageRating: number;
    reviewCount: number;
  };
  timestamp: string;
}

// 후기 작성 응답 타입
export interface ReviewCreateResponse {
  success: boolean;
  message: string;
  review: ReviewResponse;
  timestamp: string;
}

/**
 * 특정 피드에 후기 작성
 */
export const createReview = async (
  feedId: number,
  reviewData: ReviewCreateRequest,
): Promise<ReviewCreateResponse> => {
  try {
    console.log(`🌟 [API] 후기 작성 요청 - 피드 ID: ${feedId}`, reviewData);

    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      throw new Error('로그인이 필요합니다');
    }

    const response = await axios.post(
      `${API_BASE_URL}/api/review/feed/${feedId}`,
      reviewData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      },
    );

    console.log(`✅ [API] 후기 작성 성공 - 피드 ID: ${feedId}`, response.data);
    return response.data;
  } catch (error: any) {
    console.error(`❌ [API] 후기 작성 실패 - 피드 ID: ${feedId}`, error);
    
    if (error.response?.status === 403) {
      throw new Error('후기 작성 권한이 없습니다');
    }
    
    const errorMessage =
      error.response?.data?.message || error.message || '후기 작성 실패';
    throw new Error(errorMessage);
  }
};

/**
 * 특정 피드의 모든 후기 조회
 */
export const getReviewsByFeedId = async (
  feedId: number,
): Promise<ReviewListResponse> => {
  try {
    console.log(`📋 [API] 피드 후기 조회 - 피드 ID: ${feedId}`);

    const response = await axios.get(
      `${API_BASE_URL}/api/review/feed/${feedId}`,
    );

    console.log(`✅ [API] 피드 후기 조회 성공 - 피드 ID: ${feedId}`, response.data);
    return response.data;
  } catch (error: any) {
    console.error(`❌ [API] 피드 후기 조회 실패 - 피드 ID: ${feedId}`, error);
    
    const errorMessage =
      error.response?.data?.message || error.message || '후기 조회 실패';
    throw new Error(errorMessage);
  }
};

/**
 * 특정 피드의 후기 통계 조회
 */
export const getReviewStats = async (
  feedId: number,
): Promise<{ averageRating: number; reviewCount: number }> => {
  try {
    console.log(`📊 [API] 피드 후기 통계 조회 - 피드 ID: ${feedId}`);

    const response = await axios.get(
      `${API_BASE_URL}/api/review/feed/${feedId}/stats`,
    );

    console.log(`✅ [API] 피드 후기 통계 조회 성공 - 피드 ID: ${feedId}`, response.data);
    return response.data.stats;
  } catch (error: any) {
    console.error(`❌ [API] 피드 후기 통계 조회 실패 - 피드 ID: ${feedId}`, error);
    
    return {
      averageRating: 0,
      reviewCount: 0,
    };
  }
}; 