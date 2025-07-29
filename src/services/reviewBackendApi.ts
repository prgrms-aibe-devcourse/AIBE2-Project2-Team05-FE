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
 * TravelPlan ID로 후기 작성 (TravelFeed를 먼저 조회 후 후기 작성)
 */
export const createReviewByPlanId = async (
  planId: number,
  reviewData: ReviewCreateRequest,
): Promise<ReviewCreateResponse> => {
  try {
    console.log(`🔍 [API] TravelPlan ID로 후기 작성 요청 - Plan ID: ${planId}`, reviewData);

    // 1. TravelPlan ID로 TravelFeed 조회
    const feedResponse = await axios.get(`${API_BASE_URL}/api/feed/plan/${planId}`);
    const travelFeed = feedResponse.data;
    
    if (!travelFeed || !travelFeed.id) {
      throw new Error(`TravelPlan ID ${planId}에 해당하는 TravelFeed를 찾을 수 없습니다`);
    }

    console.log(`✅ [API] TravelFeed 조회 성공 - Plan ID: ${planId} → Feed ID: ${travelFeed.id}`);

    // 2. TravelFeed ID로 후기 작성
    return await createReview(travelFeed.id, reviewData);
    
  } catch (error: any) {
    console.error(`❌ [API] TravelPlan ID로 후기 작성 실패 - Plan ID: ${planId}`, error);
    
    const errorMessage =
      error.response?.data?.message || error.message || `후기 작성 실패: ${error.message}`;
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
 * 특정 여행 계획의 모든 후기 조회 (planId 기반)
 * TravelFeed를 먼저 조회한 후 해당 Feed의 후기를 조회
 */
export const getReviewsByPlanId = async (
  planId: number,
): Promise<ReviewListResponse> => {
  try {
    console.log(`📋 [API] 여행 계획 후기 조회 - Plan ID: ${planId}`);

    // 1. TravelPlan ID로 TravelFeed 조회
    const feedResponse = await axios.get(`${API_BASE_URL}/api/feed/plan/${planId}`);
    const travelFeed = feedResponse.data;
    
    if (!travelFeed || !travelFeed.id) {
      console.log(`ℹ️ [API] Plan ID ${planId}에 해당하는 TravelFeed가 없음 - 빈 결과 반환`);
      return {
        success: true,
        reviews: [],
        stats: {
          averageRating: 0,
          reviewCount: 0
        },
        timestamp: new Date().toISOString()
      };
    }

    console.log(`✅ [API] TravelFeed 조회 성공 - Plan ID: ${planId} → Feed ID: ${travelFeed.id}`);

    // 2. TravelFeed ID로 후기 조회
    const reviewResponse = await axios.get(`${API_BASE_URL}/api/review/feed/${travelFeed.id}`);

    console.log(`✅ [API] 여행 계획 후기 조회 성공 - Plan ID: ${planId} (Feed ID: ${travelFeed.id})`, reviewResponse.data);
    return reviewResponse.data;
    
  } catch (error: any) {
    console.error(`❌ [API] 여행 계획 후기 조회 실패 - Plan ID: ${planId}`, error);
    
    // 404 에러인 경우 빈 결과 반환
    if (error.response?.status === 404) {
      console.log(`ℹ️ [API] Plan ID ${planId}에 대한 후기가 없음 - 빈 결과 반환`);
      return {
        success: true,
        reviews: [],
        stats: {
          averageRating: 0,
          reviewCount: 0
        },
        timestamp: new Date().toISOString()
      };
    }
    
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